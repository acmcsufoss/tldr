import type { discord } from "../../deps.ts";
import type {
  DiscordAPIClientInterface,
  EditOriginalInteractionResponseOptions,
  RegisterCommandOptions,
  RetrieveGuildUserOptions,
} from "./discord_api_client_interface.ts";

/**
 * DiscordAPIClient is a client for the Discord API.
 */
export class DiscordAPIClient implements DiscordAPIClientInterface {
  async registerCommand(options: RegisterCommandOptions): Promise<void> {
    const url = makeRegisterCommandsURL(options.botID);
    const response = await fetch(url, {
      method: "POST",
      headers: new Headers([
        ["Content-Type", "application/json"],
        ["Authorization", makeBotAuthorization(options.botToken)],
      ]),
      body: JSON.stringify(options.app),
    });
    if (!response.ok) {
      console.error("text:", await response.text());
      throw new Error(
        `Failed to register command: ${response.status} ${response.statusText}`,
      );
    }
  }

  async editOriginalInteractionResponse(
    options: EditOriginalInteractionResponseOptions,
  ): Promise<void> {
    const url = makeEditOriginalInteractionResponseURL(
      options.botID,
      options.interactionToken,
    );
    const response = await fetch(url, {
      method: "PATCH",
      headers: new Headers([["Content-Type", "application/json"]]),
      body: JSON.stringify({ content: options.content }),
    });
    if (!response.ok) {
      console.error("text:", await response.text());
      throw new Error(
        `Failed to edit original interaction response: ${response.status} ${response.statusText}`,
      );
    }
  }

  async retrieveGuildUser(
    options: RetrieveGuildUserOptions,
  ): Promise<discord.APIGuildMember> {
    const url = makeRetrieveGuildUserURL(options.guildID, options.userID);
    const response = await fetch(url, {
      method: "GET",
      headers: new Headers([
        ["Content-Type", "application/json"],
        ["Authorization", makeBotAuthorization(options.botToken)],
      ]),
    });
    if (!response.ok) {
      console.error("text:", await response.text());
      throw new Error(
        `Failed to retrieve guild user: ${response.status} ${response.statusText}`,
      );
    }
    return await response.json();
  }
}

/**
 * makeBotAuthorization makes the Authorization header for a bot.
 */
export function makeBotAuthorization(botToken: string) {
  return botToken.startsWith("Bot ") ? botToken : `Bot ${botToken}`;
}

/**
 * makeRegisterCommandsURL makes the URL to register a Discord application command.
 */
export function makeRegisterCommandsURL(
  clientID: string,
  base = DISCORD_API_URL,
) {
  return new URL(`${base}/applications/${clientID}/commands`);
}

/**
 * makeEditOriginalInteractionResponseURL makes the URL to edit the original interaction response.
 */
export function makeEditOriginalInteractionResponseURL(
  clientID: string,
  interactionToken: string,
  base = DISCORD_API_URL,
) {
  return `${base}/webhooks/${clientID}/${interactionToken}/messages/@original`;
}

/**
 * makeRetrieveGuildUserURL makes the URL to retrieve a guild user.
 */
export function makeRetrieveGuildUserURL(
  guildID: string,
  userID: string,
  base = DISCORD_API_URL,
) {
  return `${base}/guilds/${guildID}/members/${userID}`;
}

/**
 * DISCORD_API_URL is the base URL for the Discord API.
 */
export const DISCORD_API_URL = "https://discord.com/api/v10";
