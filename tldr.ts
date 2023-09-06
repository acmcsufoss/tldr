import { retry } from "./deps.ts";

/**
 * tldr creates a "TLDR" of a Discord message.
 */
export async function tldr(options: TLDROptions) {
  const text =
    `Create a "TLDR" of this Discord mesage: ${options.author}: ${options.message}\n\nTL;DR: `;

  const response = await retry(
    () =>
      fetch(
        "https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText?key=" +
          options.apiKey,
        {
          method: "POST",
          headers: new Headers([
            ["Content-Type", "application/json"],
          ]),
          body: JSON.stringify({ prompt: { text } }),
        },
      ),
    // Google's retry policy guidance:
    // https://github.com/googleapis/googleapis/blob/77c99e43177c76ae1c1edacee7b6ac4e35a42f3d/google/ai/generativelanguage/v1main/v1beta2/generativeai_grpc_service_config.json#L16
    {
      maxAttempts: 5,
      maxTimeout: 10e3,
      multiplier: 1.3,
    },
  );

  const data = await response.json();
  const result = data.candidates[0].output;
  return result;
}

/**
 * TLDROptions are the options for the tldr function.
 */
export interface TLDROptions {
  apiKey: string;
  author: string;
  message: string;
}
