import { systemPrompt } from '../data/systemPrompt';
import { toolDeclarations } from '../data/tools';

const API_KEY = import.meta.env.VITE_GEMINI_KEY;
const MODEL = 'gemini-2.0-flash-lite';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

/**
 * Send a message to Gemini and get a response with optional tool calls.
 *
 * @param {Array} history - Conversation history in Gemini format
 * @param {string|null} imageBase64 - Optional base64 image data (for vision)
 * @param {string|null} imageMimeType - e.g. 'image/jpeg'
 * @returns {Object} { textParts: string[], toolCalls: Array<{name, args}> }
 */
export async function sendMessage(history, imageBase64 = null, imageMimeType = null) {
  // Build the request body
  const body = {
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: history,
    tools: [{ functionDeclarations: toolDeclarations }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  };

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Gemini API error:', err);
    throw new Error(`Gemini API error: ${res.status}`);
  }

  const data = await res.json();
  const candidate = data.candidates?.[0];

  if (!candidate) {
    throw new Error('No response from Gemini');
  }

  // Parse response parts into text and tool calls
  const textParts = [];
  const toolCalls = [];

  for (const part of candidate.content?.parts || []) {
    if (part.text) {
      textParts.push(part.text);
    }
    if (part.functionCall) {
      toolCalls.push({
        name: part.functionCall.name,
        args: part.functionCall.args || {},
      });
    }
  }

  return { textParts, toolCalls, rawParts: candidate.content?.parts || [] };
}

/**
 * Build a user message for the conversation history.
 */
export function userMessage(text, imageBase64 = null, imageMimeType = null) {
  const parts = [];
  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: imageMimeType || 'image/jpeg',
        data: imageBase64,
      },
    });
  }
  if (text) {
    parts.push({ text });
  }
  return { role: 'user', parts };
}

/**
 * Build a model message for the conversation history.
 */
export function modelMessage(parts) {
  return { role: 'model', parts };
}
