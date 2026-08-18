const GATEWAY_URL = "https://openrouter.ai/api/v1/chat/completions";

// List of free vision-capable models to try in order if one returns 404
const FREE_VISION_MODELS = [
  "google/gemini-2.0-flash-exp:free",
  "google/gemini-2.0-flash-lite-preview-02-05:free",
  "openrouter/free",
];

export type GatewayMessage = {
  role: "system" | "user" | "assistant";
  content: string | Array<Record<string, unknown>>;
};

// Generic call function expected by legacy components
export async function callGemini(options: { 
  messages: GatewayMessage[]; 
  model?: string; 
  jsonOnly?: boolean 
}) {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("VITE_OPENROUTER_API_KEY is missing from your .env file!");
  }

  const modelsToTry = options.model ? [options.model, ...FREE_VISION_MODELS] : FREE_VISION_MODELS;

  for (const model of modelsToTry) {
    try {
      const response = await fetch(GATEWAY_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: options.messages,
          ...(options.jsonOnly ? { response_format: { type: "json_object" } } : {}),
        }),
      });

      if (response.status === 404) {
        console.warn(`Model ${model} returned 404, trying fallback...`);
        continue;
      }

      if (!response.ok) {
        const body = await response.text();
        if (response.status === 429) {
          throw new Error("The oracle is busy — rate limit reached. Please try again in a moment.");
        }
        if (response.status === 402) {
          throw new Error("AI credits are exhausted. Add credits to continue generating readings.");
        }
        throw new Error(`AI request failed [${response.status}]: ${body.slice(0, 400)}`);
      }

      const payload = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };

      const text = payload.choices?.[0]?.message?.content;
      if (!text) throw new Error("The oracle returned an empty response.");

      return text;
    } catch (err: any) {
      if (model === modelsToTry[modelsToTry.length - 1]) throw err;
    }
  }

  throw new Error("All free model endpoints returned 404 or failed.");
}

// Vision function for palm reading analysis with fallback retry
export async function analyzePalm(
  imageBase64: string,
  options: { jsonOnly?: boolean; prompt?: string } = {}
) {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("VITE_OPENROUTER_API_KEY is missing from your .env file!");
  }

  const visionPrompt =
    options.prompt ||
    "Analyze the uploaded hand image carefully. First identify hand orientation (left vs right). Then detect the clear coordinates/path of the three primary palm creases: Heart Line, Head Line, and Life Line. Do not guess lines obscured by light/shadow.";

  for (const model of FREE_VISION_MODELS) {
    try {
      const response = await fetch(GATEWAY_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: visionPrompt,
                },
                {
                  type: "image_url",
                  image_url: {
                    url: imageBase64,
                  },
                },
              ],
            },
          ],
          ...(options.jsonOnly ? { response_format: { type: "json_object" } } : {}),
        }),
      });

      if (response.status === 404) {
        console.warn(`Model ${model} returned 404, trying fallback...`);
        continue;
      }

      if (!response.ok) {
        const body = await response.text();
        if (response.status === 429) {
          throw new Error("The oracle is busy — rate limit reached. Please try again in a moment.");
        }
        if (response.status === 402) {
          throw new Error("AI credits are exhausted. Add credits to continue generating readings.");
        }
        throw new Error(`AI request failed [${response.status}]: ${body.slice(0, 400)}`);
      }

      const payload = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };

      const text = payload.choices?.[0]?.message?.content;
      if (!text) throw new Error("The oracle returned an empty response.");

      return text;
    } catch (err: any) {
      if (model === FREE_VISION_MODELS[FREE_VISION_MODELS.length - 1]) throw err;
    }
  }

  throw new Error("All free vision model endpoints returned 404 or failed.");
}

export function parseJsonLoose<T>(raw: string): T {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1)) as T;
    }
    throw new Error("Could not parse the oracle's structured response.");
  }
}