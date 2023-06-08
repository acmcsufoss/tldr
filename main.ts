import * as env from "./env.ts";
import { discord } from "./deps.ts";
import { DiscordAPIClient, verify } from "./bot/discord/mod.ts";
import { APP_TLDR } from "./bot/app/app.ts";
import { tldr, TLDROptions } from "./tldr.ts";

const api = new DiscordAPIClient();

if (import.meta.main) {
  await main();
}

export async function main() {
  // Overwrite the Discord Application Command.
  await api.registerCommand({
    app: APP_TLDR,
    botID: env.DISCORD_CLIENT_ID,
    botToken: env.DISCORD_TOKEN,
  });

  console.log(
    "TLDR Info:\n\n",
    `- Invite: https://discord.com/api/oauth2/authorize?client_id=${env.DISCORD_CLIENT_ID}&scope=applications.commands\n`,
    `- URL: https://discord.com/developers/applications/${env.DISCORD_CLIENT_ID}/information`,
  );

  // Start the server.
  const server = Deno.listen({ port: env.PORT });
  for await (const conn of server) {
    console.log("please work");
    serveHttp(conn);
  }
}

async function serveHttp(conn: Deno.Conn) {
  const httpConn = Deno.serveHttp(conn);
  console.log("u better get this far");
  for await (const requestEvent of httpConn) {
    console.log(":p");
    const response = await handle(requestEvent.request);
    requestEvent.respondWith(response);
  }
}

/**
 * handle is the HTTP handler for the Boardd application command.
 */
export async function handle(request: Request): Promise<Response> {
  const { error, body } = await verify(request, env.DISCORD_PUBLIC_KEY);
  if (error !== null) {
    return error;
  }

  // Parse the incoming request as JSON.
  const interaction = await JSON.parse(body) as discord.APIInteraction;
  switch (interaction.type) {
    case discord.InteractionType.Ping: {
      return Response.json({ type: discord.InteractionResponseType.Pong });
    }

    case discord.InteractionType.ApplicationCommand: {
      if (
        !discord.Utils.isContextMenuApplicationCommandInteraction(interaction)
      ) {
        return new Response("Invalid request", { status: 400 });
      }

      if (!interaction.member?.user) {
        return new Response("Invalid request", { status: 400 });
      }

      if (!interaction.message?.content) {
        return new Response("Invalid request", { status: 400 });
      }

      if (!interaction.member.roles.includes(env.DISCORD_ROLE_ID)) {
        return new Response("Invalid request", { status: 400 });
      }

      const options: TLDROptions = {
        apiKey: env.PALM_API_KEY!,
        author: interaction.member.user.username,
        message: interaction.message?.content,
      };

      tldr(options)
        .then((result) =>
          api.editOriginalInteractionResponse({
            botID: env.DISCORD_CLIENT_ID,
            botToken: env.DISCORD_TOKEN,
            interactionToken: interaction.token,
            content: `TLDR: ${result}`,
          })
        )
        .catch((err) => {
          if (err instanceof Error) {
            api.editOriginalInteractionResponse({
              botID: env.DISCORD_CLIENT_ID,
              botToken: env.DISCORD_TOKEN,
              interactionToken: interaction.token,
              content: `Error: ${err.message}`,
            });
          }
        });

      return Response.json(
        {
          type:
            discord.InteractionResponseType.DeferredChannelMessageWithSource,
          data: {
            flags: discord.MessageFlags.Ephemeral,
          },
        } satisfies discord.APIInteractionResponseDeferredChannelMessageWithSource,
      );
    }

    default: {
      return new Response("Invalid request", { status: 400 });
    }
  }
}
