export class RateLimitError extends Error {
  constructor() {
    super('Too Many Requests');
    this.name = 'RateLimitError';
  }
}

export async function scanReceipt(imageBase64, provider, apiKey) {
  let url;
  let options;

  const instruction =
    'Extract all food items from this receipt. Return a JSON object with an "items" array. ' +
    'Each item should have "name" (string), "expiry_days" (number, estimated days until expiry), ' +
    'and "category" (string). Return only valid JSON, no markdown.';

  if (provider === 'openai') {
    url = 'https://api.openai.com/v1/chat/completions';
    options = {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: instruction },
              {
                type: 'image_url',
                image_url: { url: 'data:image/jpeg;base64,' + imageBase64 },
              },
            ],
          },
        ],
      }),
    };
  } else if (provider === 'gemini') {
    url =
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' +
      apiKey;
    options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: instruction },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: imageBase64,
                },
              },
            ],
          },
        ],
      }),
    };
  } else if (provider === 'anthropic') {
    url = 'https://api.anthropic.com/v1/messages';
    options = {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: imageBase64,
                },
              },
              { type: 'text', text: instruction },
            ],
          },
        ],
      }),
    };
  } else {
    throw new Error('Unknown provider');
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    if (response.status === 429) {
      throw new RateLimitError();
    }
    throw new Error('HTTP ' + response.status);
  }

  const data = await response.json();

  let text;
  if (provider === 'openai') {
    text = data.choices[0].message.content;
  } else if (provider === 'gemini') {
    text = data.candidates[0].content.parts[0].text;
  } else if (provider === 'anthropic') {
    text = data.content[0].text;
  }

  const parsed = JSON.parse(text);

  if (!Array.isArray(parsed.items)) {
    throw new Error('Invalid response from AI');
  }

  return parsed;
}
