export async function fetchTLDR(API_KEY) {
	const headers = {
		"Content-Type": "application/json",
	};

	const body = {
		"prompt": {
			"text": "Create a \"TLDR\" of this Discord message: \"Ethan (he/Webmaster): I’m thinking of going back to the drawing board and instead of searching for how SvelteKit does it, we can think about it from scratch. There is a lot to think about, but if we properly limit the scope of the project then it should be fine. We should first figure out how to get SPAs to work which is an HTML shell with JavaScript that generates the entire UI client-side. We need this because even when we optimistically server side render a page, it still may use some progressive enhancements requiring the complete SPA feature set. From here, we can try optimistically/optimally rendering/bundling the HTML and JS.\"\n\nTLDR: ",
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

	const response = await fetch("https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText?key=" + API_KEY, {
		method: "POST",
		headers,
		body: JSON.stringify(body),
	});

	const data = await response.json();

	return data.generated_text;
}
