// POST /api/cover-letter
//
// Body: {
//   mode: 'generate' | 'refine',
//   model: 'groq' | 'gemini' | 'mistral',
//   // generate mode:
//   company, role, jd?, recruiterName?, tone?, language?, hook?,
//   // refine mode:
//   previousLetter, refinement,
// }
//
// Reuses the model adapter shapes from app/api/chat/route.js but with a
// cover-letter-specific system prompt and longer max_tokens.

import { NextResponse } from 'next/server';

import { hasCoverLetterInjection } from '../../lib/prompt-guards.js';
import {
  buildSystemPrompt,
  rankProjects,
  appendSignature,
} from '../../lib/profile-context.js';
import {
  buildCoverLetterUserPrompt,
  buildRefinementUserPrompt,
} from '../../lib/cover-letter-prompt.js';
import { checkRateLimit, getClientIp } from '../../lib/rate-limit.js';

const MODELS = new Set(['groq', 'gemini', 'mistral']);
const TONES = new Set(['professional', 'friendly', 'enthusiastic']);
const LANGUAGES = new Set(['EN', 'DE']);

const FIELD_LIMITS = {
  company: 200,
  role: 200,
  recruiterName: 120,
  hook: 500,
  jd: 6000,
  refinement: 1000,
  previousLetter: 6000,
};

const REFUSAL =
  "I'm here to draft a cover letter from Miguel. Please share company, role, and a job description.";

function bad(status, error) {
  return NextResponse.json({ error }, { status });
}

function trimAll(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj || {})) {
    out[k] = typeof v === 'string' ? v.trim() : v;
  }
  return out;
}

function checkFieldLimits(fields) {
  for (const [k, max] of Object.entries(FIELD_LIMITS)) {
    if (fields[k] && fields[k].length > max) {
      return `${k} exceeds ${max} characters`;
    }
  }
  return null;
}

function anyInjection(strings) {
  return strings.filter(Boolean).some((s) => hasCoverLetterInjection(s));
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return bad(400, 'Invalid JSON');
  }

  const ip = getClientIp(req);
  const rl = checkRateLimit(ip);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Try again later.', retryAfterSec: rl.retryAfterSec },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } }
    );
  }

  const fields = trimAll(body);
  const model = fields.model || 'groq';
  if (!MODELS.has(model)) return bad(400, 'Invalid model');

  const limitError = checkFieldLimits(fields);
  if (limitError) return bad(400, limitError);

  const mode = fields.mode || 'generate';
  let systemPrompt;
  let userPrompt;
  let pickedProjects = [];

  if (mode === 'generate') {
    const { company, role, jd, recruiterName, hook } = fields;
    if (!company || !role) return bad(400, 'company and role are required');

    if (anyInjection([company, role, jd, recruiterName, hook])) {
      return NextResponse.json({ letter: REFUSAL, pickedProjects: [] });
    }

    const tone = TONES.has(fields.tone) ? fields.tone : 'professional';
    const language = LANGUAGES.has(fields.language) ? fields.language : 'EN';

    pickedProjects = rankProjects(jd, 2).map((p) => p.title);
    systemPrompt = buildSystemPrompt({ jd, tone, language });
    userPrompt = buildCoverLetterUserPrompt({
      company,
      role,
      jd,
      recruiterName,
      hook,
    });
  } else if (mode === 'refine') {
    const { previousLetter, refinement } = fields;
    if (!previousLetter || !refinement) {
      return bad(400, 'previousLetter and refinement are required');
    }
    if (anyInjection([refinement])) {
      return NextResponse.json({ letter: REFUSAL });
    }
    // Use a neutral system prompt (no JD-relevant project re-ranking) — the
    // previous letter already contains the picked projects.
    systemPrompt = buildSystemPrompt({ jd: '', tone: 'professional', language: 'EN' });
    userPrompt = buildRefinementUserPrompt({ previousLetter, refinement });
  } else {
    return bad(400, 'Invalid mode');
  }

  try {
    let letter;
    if (model === 'groq') letter = await callGroq(systemPrompt, userPrompt);
    else if (model === 'gemini') letter = await callGemini(systemPrompt, userPrompt);
    else letter = await callMistral(systemPrompt, userPrompt);
    letter = appendSignature(letter);
    return NextResponse.json({ letter, model, pickedProjects });
  } catch (err) {
    console.error('cover-letter error', err);
    return bad(502, err.message || 'Upstream model error');
  }
}

async function callGroq(system, user) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('GROQ_API_KEY not configured');
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.7,
      max_tokens: 700,
    }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.error?.message || 'Groq request failed');
  return data.choices[0].message.content.trim();
}

async function callMistral(system, user) {
  const key = process.env.MISTRAL_API_KEY;
  if (!key) throw new Error('MISTRAL_API_KEY not configured');
  const r = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'mistral-large-latest',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.7,
      max_tokens: 700,
    }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.error?.message || 'Mistral request failed');
  return data.choices[0].message.content.trim();
}

async function callGemini(system, user) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY not configured');
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${system}\n\nUser:\n${user}` }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 700 },
      }),
    }
  );
  const data = await r.json();
  if (!r.ok) throw new Error(data?.error?.message || 'Gemini request failed');
  return data.candidates[0].content.parts[0].text.trim();
}
