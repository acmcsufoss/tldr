import { discord } from "../../deps.ts";

export const TLDR = "TLDR";

/**
 * APP_TLDR is the top-level command for the TLDR Application Command.
 */
export const APP_TLDR: discord.RESTPostAPIApplicationCommandsJSONBody = {
  type: discord.ApplicationCommandType.Message,
  name: TLDR,
};
