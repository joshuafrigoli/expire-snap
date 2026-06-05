export class RateLimitError extends Error {
  constructor() {
    super('Too Many Requests');
    this.name = 'RateLimitError';
  }
}

export async function scanReceipt(imageBase64, provider, apiKey) {
  let url;
  let options;

  const today = new Date().toISOString().split('T')[0];
  const instruction =
    `Today is ${today}. Extract all food items from this grocery receipt image.\n\n` +
    'Return a JSON object in exactly this format (no markdown, no extra keys):\n' +
    '{"items":[{"name":"Clean Product Name","category":"Dairy","estimated_expiry_date":"YYYY-MM-DD","confidence_days":2}]}\n\n' +
    'Rules:\n' +
    '- category must be one of: Dairy, Meat & Fish, Fruits & Veggies, Frozen, Pantry\n' +
    `- estimated_expiry_date must be a future YYYY-MM-DD date calculated from today (${today})\n` +
    '- confidence_days is your uncertainty margin in days (1–5)\n' +
    '- Typical shelf life from purchase: Fresh Milk +6d, Yogurt +20d, Fresh Meat +3d, Fresh Fish +2d, Cold cuts/Hard cheese +15d, Pantry (pasta/rice/canned) +180d+';

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
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey;
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

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  let response;
  try {
    response = await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }

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

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Invalid response from AI: could not parse JSON');
  }

  if (!Array.isArray(parsed.items)) {
    throw new Error('Invalid response from AI: missing items array');
  }

  const ts = Date.now().toString(36);
  parsed.items = parsed.items.map((item, i) => ({
    ...item,
    id: ts + i.toString(36) + Math.random().toString(36).slice(2, 6),
  }));

  return parsed;
}
