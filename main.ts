import { doNgrok } from "./ngrok.ts";
import * as env from "./env.ts";
import { discord } from "./deps.ts";
import { DiscordAPIClient, verify } from "./bot/discord/mod.ts";

const api = new DiscordAPIClient();

if (import.meta.main) {
	await main();
}

export async function main() {
	// TODO: Overwrite the Discord Application Command.

	console.log(
		"Add TLDR to your server:",
		`https://discord.com/api/oauth2/authorize?client_id=${env.DISCORD_CLIENT_ID}&scope=applications.commands`,
	);

	// In development mode, we use ngrok to expose the server to the Internet.
	if (env.DEV) {
		doNgrok().then((url) => {
			console.log("Interactions endpoint URL:", url);
		});
	}

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
    default: {
      return new Response("Invalid request", { status: 400 });
    }
  }
}
