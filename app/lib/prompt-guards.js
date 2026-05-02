// Shared prompt-injection regexes for /api/chat and /api/cover-letter.
// Originally lived inline in app/api/chat/route.js — extracted here so the
// cover-letter route can reuse the same set plus its own additions.

const BASE_INJECTION_PATTERNS = [
  /ignore.*previous.*instructions?/i,
  /disregard.*above/i,
  /forget.*you.*are/i,
  /you.*are.*now/i,
  /new.*instructions?:/i,
  /system.*prompt/i,
  /override.*settings?/i,
  /\[system\]/i,
  /<system>/i,
  /act.*as.*different/i,
  /pretend.*you.*are/i,
];

// Cover-letter-specific extras: recruiters paste arbitrary JD text that
// might try to manipulate the model into revealing internals or acting
// outside the cover-letter task.
const COVER_LETTER_EXTRA_PATTERNS = [
  /reveal.*system/i,
  /reveal.*prompt/i,
  /show.*system/i,
  /act\s+as\s+(an?\s+)?(ai|assistant|model|llm|chatbot)/i,
  /jailbreak/i,
  /developer\s+mode/i,
  /\bdan\b/i,
];

export function hasPromptInjection(text, { extra = [] } = {}) {
  if (!text || typeof text !== 'string') return false;
  const all = [...BASE_INJECTION_PATTERNS, ...extra];
  return all.some((pattern) => pattern.test(text));
}

export function hasCoverLetterInjection(text) {
  return hasPromptInjection(text, { extra: COVER_LETTER_EXTRA_PATTERNS });
}

export const INJECTION_RESPONSE =
  "I'm here to discuss Miguel's qualifications. Please ask about his skills, projects, or certifications.";
