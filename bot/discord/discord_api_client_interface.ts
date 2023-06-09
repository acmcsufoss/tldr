import type { discord } from "../../deps.ts";

/**
 * DiscordAPIClientInterface is the interface for the Discord API Client.
 */
export interface DiscordAPIClientInterface {
  /**
   * registerCommand overwrites the Discord Slash Commands associated with the server.
   *
   * Based on this cURL command:
   * ```bash
   * BOT_TOKEN='replace_me_with_bot_token'
   * CLIENT_ID='replace_me_with_client_id'
   * curl -X POST \
   * -H 'Content-Type: application/json' \
   * -H "Authorization: Bot $BOT_TOKEN" \
   * -d '{"name":"hello","description":"Greet a person","options":[{"name":"name","description":"The name of the person","type":3,"required":true}]}' \
   * "https://discord.com/api/v8/applications/$CLIENT_ID/commands"
   * ```
   */
  registerCommand(o: RegisterCommandOptions): Promise<void>;

  /**
   * editOriginalInteractionResponse edits the original interaction response.
   */
  editOriginalInteractionResponse(
    o: EditOriginalInteractionResponseOptions,
  ): Promise<void>;

  /**
   * retrieveGuildUser retrieves a guild user.
   */
  retrieveGuildUser(
    options: RetrieveGuildUserOptions,
  ): Promise<discord.APIGuildMember>;
}

/**
 * RegisterCommandOptions is the initialization to register a Discord application command.
 */
export interface RegisterCommandOptions {
  botID: string;
  botToken: string;
  app: discord.RESTPostAPIApplicationCommandsJSONBody;
}

/**
 * EditOriginalInteractionResponseOptions is the initialization to edit the original interaction response.
 */
export interface EditOriginalInteractionResponseOptions {
  botID: string;
  botToken: string;
  interactionToken: string;
  content: string;
}

/**
 * RetrieveGuildUserOptions is the initialization to retrieve a guild user.
 */
export interface RetrieveGuildUserOptions {
  botToken: string;
  guildID: string;
  userID: string;
}
