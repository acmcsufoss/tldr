/**
 * tldr creates a "TLDR" of a Discord message.
 */
export async function tldr(options: TLDROptions) {
  const text =
    `Create a "TLDR" of this Discord mesage: ${options.author}: ${options.message}\n\nTL;DR: `;
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText?key=" +
      options.apiKey,
    {
      method: "POST",
      headers: new Headers([
        ["Content-Type", "application/json"],
      ]),
      body: JSON.stringify({ prompt: { text } }),
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
