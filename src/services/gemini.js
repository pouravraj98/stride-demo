import { systemPrompt } from '../data/systemPrompt';
import { toolDeclarations } from '../data/tools';

const API_KEY = import.meta.env.VITE_DEEPSEEK_KEY;
const MODEL = 'deepseek-chat';
const API_URL = 'https://api.deepseek.com/chat/completions';

// Convert our tool declarations from Gemini format to OpenAI format
function toOpenAITools(declarations) {
  return declarations.map((d) => ({
    type: 'function',
    function: {
      name: d.name,
      description: d.description,
      parameters: {
        type: 'object',
        properties: Object.fromEntries(
          Object.entries(d.parameters?.properties || {}).map(([key, val]) => {
            const prop = { description: val.description };
            if (val.type === 'INTEGER') prop.type = 'integer';
            else if (val.type === 'STRING') prop.type = 'string';
            else if (val.type === 'ARRAY') {
              prop.type = 'array';
              prop.items = { type: val.items?.type === 'INTEGER' ? 'integer' : 'string' };
            } else prop.type = 'string';
            if (val.enum) prop.enum = val.enum;
            return [key, prop];
          })
        ),
        required: d.parameters?.required || [],
      },
    },
  }));
}

const openAITools = toOpenAITools(toolDeclarations);

/**
 * Convert Gemini-format history to OpenAI-format messages
 */
function toOpenAIMessages(history) {
  const messages = [{ role: 'system', content: systemPrompt }];
  for (const msg of history) {
    if (msg.role === 'user') {
      const textContent = msg.parts
        ?.filter((p) => p.text)
        .map((p) => p.text)
        .join('\n');
      // DeepSeek doesn't support vision — skip image data, rely on text description
      if (textContent) messages.push({ role: 'user', content: textContent });
    } else if (msg.role === 'model') {
      // Model messages may have text and function calls
      const textParts = msg.parts?.filter((p) => p.text).map((p) => p.text).join('\n');
      if (textParts) messages.push({ role: 'assistant', content: textParts });
    }
  }
  return messages;
}

/**
 * Send a message to OpenAI and get a response with optional tool calls.
 */
export async function sendMessage(history) {
  const messages = toOpenAIMessages(history);

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      tools: openAITools,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('OpenAI API error:', err);
    throw new Error(`OpenAI API error: ${res.status}`);
  }

  const data = await res.json();
  const choice = data.choices?.[0];
  if (!choice) throw new Error('No response from OpenAI');

  const textParts = [];
  const toolCalls = [];
  const rawParts = [];

  // Extract text
  if (choice.message?.content) {
    textParts.push(choice.message.content);
    rawParts.push({ text: choice.message.content });
  }

  // Extract tool calls
  if (choice.message?.tool_calls) {
    for (const tc of choice.message.tool_calls) {
      if (tc.type === 'function') {
        let args = {};
        try { args = JSON.parse(tc.function.arguments); } catch (e) {}
        toolCalls.push({ name: tc.function.name, args });
        rawParts.push({ functionCall: { name: tc.function.name, args } });
      }
    }
  }

  return { textParts, toolCalls, rawParts };
}

/**
 * Build a user message for the conversation history (keeps Gemini format internally).
 */
export function userMessage(text, imageBase64 = null, imageMimeType = null) {
  const parts = [];
  if (imageBase64) {
    parts.push({ inlineData: { mimeType: imageMimeType || 'image/jpeg', data: imageBase64 } });
  }
  if (text) parts.push({ text });
  return { role: 'user', parts };
}

/**
 * Build a model message for the conversation history.
 */
export function modelMessage(parts) {
  return { role: 'model', parts };
}
