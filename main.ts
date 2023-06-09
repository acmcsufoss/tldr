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

  // Log the application command.
  console.log(
    "TLDR application command:\n",
    `- Local: http://localhost:${env.PORT}/\n`,
    `- Invite: https://discord.com/api/oauth2/authorize?client_id=${env.DISCORD_CLIENT_ID}&scope=applications.commands\n`,
    `- Info: https://discord.com/developers/applications/${env.DISCORD_CLIENT_ID}/information`,
  );

  // Start the server.
  const server = Deno.listen({ port: env.PORT });
  for await (const conn of server) {
    serveHttp(conn);
  }
}

async function serveHttp(conn: Deno.Conn) {
  const httpConn = Deno.serveHttp(conn);
  for await (const requestEvent of httpConn) {
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
      // Assert the interaction is a context menu interaction.
      if (
        !discord.Utils.isContextMenuApplicationCommandInteraction(interaction)
      ) {
        return new Response("Invalid request", { status: 400 });
      }

      // Assert the interaction member has the required role.
      if (!interaction.member?.roles.includes(env.DISCORD_ROLE_ID)) {
        return new Response("Invalid request", { status: 400 });
      }

      // Assert the interaction data is a message.
      if (interaction.data.type !== discord.ApplicationCommandType.Message) {
        return new Response("Invalid request", { status: 400 });
      }

      // Get the message.
      const message = Object.values(interaction.data.resolved.messages)[0];
      if (!message) {
        return new Response("Invalid request", { status: 400 });
      }

      // Assert the message is not from the bot.
      if (message.author.id === env.DISCORD_CLIENT_ID) {
        return new Response("Invalid request", { status: 400 });
      }

      // Create message URL.
      const messageURL =
        `https://discord.com/channels/${interaction.guild_id}/${message.channel_id}/${message.id}`;

      const guildMemberAuthor = await api.retrieveGuildUser({
        botToken: env.DISCORD_TOKEN,
        guildID: interaction.guild_id!,
        userID: message.author.id,
      }) as discord.APIGuildMember;

      // Make the TLDROptions.
      const options: TLDROptions = {
        apiKey: env.PALM_API_KEY!,
        author: guildMemberAuthor.nick ?? guildMemberAuthor.user!.username,
        message: message.content,
      };

      tldr(options)
        .then((result) => {
          api.editOriginalInteractionResponse({
            botID: env.DISCORD_CLIENT_ID,
            botToken: env.DISCORD_TOKEN,
            interactionToken: interaction.token,
            content: `TL;DR: ${result} \n\n ${messageURL}`,
          });
        })
        .catch((error) => {
          if (error instanceof Error) {
            api.editOriginalInteractionResponse({
              botID: env.DISCORD_CLIENT_ID,
              botToken: env.DISCORD_TOKEN,
              interactionToken: interaction.token,
              content: `Error: ${error.message}`,
            });
          }
        });

      return Response.json(
        {
          type:
            discord.InteractionResponseType.DeferredChannelMessageWithSource,
        } satisfies discord.APIInteractionResponseDeferredChannelMessageWithSource,
      );
    }

    default: {
      return new Response("Invalid request", { status: 400 });
    }
  }
}
