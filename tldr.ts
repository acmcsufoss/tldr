export async function tldr(options: TLDROptions) {
  const headers = {
    "Content-Type": "application/json",
  };

  const text =
    `Create a "TLDR" of this Discord mesage: ${options.author}: ${options.message}\n\nTLDR: `;

  const body = {
    "prompt": {
      "text": text,
      "temperature": 0.7,
      "top_k": 40,
      "top_p": 0.95,
      "candidate_count": 1,
      "max_output_tokens": 1024,
      "stop_sequences": [],
      "safety_settings": [
        {
          "category": "HARM_CATEGORY_DEROGATORY",
          "threshold": 1,
        },
        {
          "category": "HARM_CATEGORY_TOXICITY",
          "threshold": 1,
        },
        {
          "category": "HARM_CATEGORY_VIOLENCE",
          "threshold": 2,
        },
        {
          "category": "HARM_CATEGORY_SEXUAL",
          "threshold": 2,
        },
        {
          "category": "HARM_CATEGORY_MEDICAL",
          "threshold": 2,
        },
        {
          "category": "HARM_CATEGORY_DANGEROUS",
          "threshold": 2,
        },
      ],
    },
  };

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText?key=" +
      options.apiKey,
    {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    },
  );

  const data = await response.json();

  return data.generated_text;
}

export interface TLDROptions {
  apiKey: string;
  author: string;
  message: string;
}
