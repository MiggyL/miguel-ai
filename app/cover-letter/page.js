'use client';

import { useState } from 'react';

const MODELS = [
  { id: 'groq', label: 'Llama 3.3 70B (Groq)', short: 'Llama' },
  { id: 'mistral', label: 'Mistral Large', short: 'Mistral' },
  { id: 'gemini', label: 'Gemma 3 27B (Google)', short: 'Gemma' },
];

const TONES = [
  { id: 'professional', label: 'Professional' },
  { id: 'friendly', label: 'Friendly' },
  { id: 'enthusiastic', label: 'Enthusiastic' },
];

const EXAMPLE = {
  company: 'Cambridge University Press & Assessment',
  role: 'Senior Software Engineer (AI Tools)',
  jd:
    'We are looking for a senior engineer to build internal AI tooling. Strong Python, experience with LangChain or RAG, cloud (Azure preferred), and a track record of shipping end-to-end features. Bonus: computer vision or LLM fine-tuning.',
  recruiterName: 'Alex',
};

const MIGUEL_EMAIL = 'jeremias.lacanienta@cambridge.org';

export default function CoverLetterPage() {
  const [form, setForm] = useState({
    company: '',
    role: '',
    jd: '',
    recruiterName: '',
    tone: 'professional',
    language: 'EN',
    model: 'groq',
  });
  const [letter, setLetter] = useState('');
  const [usedModel, setUsedModel] = useState('');
  const [history, setHistory] = useState([]); // [{ kind: 'gen'|'refine', input, letter }]
  const [refinement, setRefinement] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const update = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const fillExample = () =>
    setForm((f) => ({ ...f, ...EXAMPLE }));

  const generate = async (e) => {
    e?.preventDefault();
    if (!form.company.trim() || !form.role.trim()) {
      setError('Company and role are required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const r = await fetch('/api/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'generate', ...form }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Request failed');
      setLetter(data.letter);
      setUsedModel(data.model || form.model);
      setHistory([{ kind: 'gen', input: { ...form }, letter: data.letter }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refine = async (e) => {
    e?.preventDefault();
    if (!refinement.trim() || !letter) return;
    setError('');
    setLoading(true);
    try {
      const r = await fetch('/api/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'refine',
          model: form.model,
          previousLetter: letter,
          refinement,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Request failed');
      setLetter(data.letter);
      setUsedModel(data.model || form.model);
      setHistory((h) => [
        ...h,
        { kind: 'refine', input: refinement, letter: data.letter },
      ]);
      setRefinement('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyLetter = async () => {
    try {
      await navigator.clipboard.writeText(letter);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const downloadLetter = () => {
    const blob = new Blob([letter], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safe = (form.company || 'cover-letter')
      .replace(/[^a-z0-9]+/gi, '-')
      .toLowerCase()
      .replace(/^-|-$/g, '');
    a.href = url;
    a.download = `cover-letter-${safe}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const mailtoHref = () => {
    const subject = encodeURIComponent(
      `Re: ${form.role || 'a role'} at ${form.company || 'your company'}`
    );
    const body = encodeURIComponent(
      `Hi Miguel,\n\nI work at ${form.company}. I tried your cover letter generator and would love to talk about ${form.role || 'a role'}.\n\n— Sent from miguelai.com`
    );
    return `mailto:${MIGUEL_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <main className="min-h-screen bg-[#F0F4F8] text-[#1f1f1f]">
      <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
        <Header />

        <div className="grid md:grid-cols-2 gap-6 md:gap-10">
          {/* Left: form */}
          <section className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Tell me about your role
              </h2>
              <button
                type="button"
                onClick={fillExample}
                className="text-xs text-blue-600 hover:underline"
              >
                Fill with example
              </button>
            </div>
            <form onSubmit={generate} className="space-y-4">
              <Field label="Company" required>
                <input
                  type="text"
                  value={form.company}
                  onChange={update('company')}
                  placeholder="ACME Corp"
                  maxLength={200}
                  className={inputCls}
                />
              </Field>
              <Field label="Role / Job title" required>
                <input
                  type="text"
                  value={form.role}
                  onChange={update('role')}
                  placeholder="Senior Software Engineer"
                  maxLength={200}
                  className={inputCls}
                />
              </Field>
              <Field
                label="Job description"
                hint="Paste the JD or key requirements — this dominates the letter quality."
              >
                <textarea
                  value={form.jd}
                  onChange={update('jd')}
                  placeholder="We are looking for…"
                  maxLength={6000}
                  rows={6}
                  className={`${inputCls} resize-y`}
                />
              </Field>
              <Field label="Recruiter name (optional)">
                <input
                  type="text"
                  value={form.recruiterName}
                  onChange={update('recruiterName')}
                  placeholder="Alex"
                  maxLength={120}
                  className={inputCls}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Tone">
                  <select
                    value={form.tone}
                    onChange={update('tone')}
                    className={inputCls}
                  >
                    {TONES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Language">
                  <div className="flex gap-2">
                    {['EN', 'DE'].map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, language: lang }))}
                        className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                          form.language === lang
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>

              <Field
                label="Model"
                hint="Different LLMs have different writing styles — try them all."
              >
                <select
                  value={form.model}
                  onChange={update('model')}
                  className={inputCls}
                >
                  {MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </Field>

              <button
                type="submit"
                disabled={loading || !form.company.trim() || !form.role.trim()}
                className="w-full py-3 rounded-lg bg-[#0f172a] text-white font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading
                  ? letter
                    ? 'Refining…'
                    : 'Drafting your letter…'
                  : letter
                  ? 'Regenerate'
                  : 'Generate cover letter'}
              </button>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
            </form>
          </section>

          {/* Right: output + refinement */}
          <section className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm min-h-[20rem]">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                  Letter
                </h2>
                {usedModel && letter && (
                  <span className="text-xs text-slate-400">
                    Drafted with{' '}
                    <span className="font-medium text-slate-600">
                      {MODELS.find((m) => m.id === usedModel)?.short || usedModel}
                    </span>
                  </span>
                )}
              </div>

              {!letter && !loading && (
                <p className="text-sm text-slate-400 italic">
                  Fill the form and click{' '}
                  <span className="not-italic font-medium text-slate-500">
                    Generate
                  </span>{' '}
                  — the letter will appear here.
                </p>
              )}

              {loading && !letter && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Spinner /> Drafting…
                </div>
              )}

              {letter && (
                <pre className="whitespace-pre-wrap font-serif text-[15px] leading-relaxed text-slate-800">
                  {letter}
                </pre>
              )}
            </div>

            {letter && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={copyLetter}
                  className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
                <button
                  onClick={downloadLetter}
                  className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Download .txt
                </button>
                <a
                  href={mailtoHref()}
                  className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
                >
                  Talk to Miguel about this role →
                </a>
              </div>
            )}

            {letter && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Refine it
                </h3>
                {history.filter((h) => h.kind === 'refine').length > 0 && (
                  <ul className="mb-3 space-y-1">
                    {history
                      .filter((h) => h.kind === 'refine')
                      .map((h, i) => (
                        <li
                          key={i}
                          className="text-xs text-slate-500 italic before:content-['→_']"
                        >
                          {h.input}
                        </li>
                      ))}
                  </ul>
                )}
                <form onSubmit={refine} className="flex gap-2">
                  <input
                    type="text"
                    value={refinement}
                    onChange={(e) => setRefinement(e.target.value)}
                    placeholder="Make it shorter / more enthusiastic / translate to German…"
                    maxLength={1000}
                    className={`${inputCls} flex-1`}
                  />
                  <button
                    type="submit"
                    disabled={loading || !refinement.trim()}
                    className="px-4 py-2 rounded-lg bg-[#0f172a] text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
                  >
                    {loading ? '…' : 'Refine'}
                  </button>
                </form>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {[
                    'Make it shorter',
                    'More enthusiastic',
                    'Translate to German',
                    'Add a line about Azure',
                  ].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRefinement(s)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        <Footer />
      </div>
    </main>
  );
}

function Header() {
  return (
    <header className="mb-8 md:mb-10">
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
        Hi, I'm Miguel.
      </h1>
      <p className="mt-2 text-slate-600 max-w-2xl text-sm md:text-base leading-relaxed">
        Tell me about your role and I'll draft you a cover letter on the spot —
        using the LLM you pick. Powered by my own{' '}
        <code className="px-1.5 py-0.5 rounded bg-slate-200/60 text-[0.85em]">
          /api/cover-letter
        </code>{' '}
        endpoint with Llama 3.3, Mistral Large, and Gemma. Your inputs are not
        stored.
      </p>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-10 pt-6 border-t border-slate-200 text-xs text-slate-500 leading-relaxed">
      <p>
        Letters are generated by an LLM; review carefully before sending. Some
        companies have policies about AI-assisted applications. The candidate
        profile this page draws from lives at{' '}
        <a
          href="/"
          className="text-blue-600 hover:underline"
        >
          miguel-ai
        </a>
        .
      </p>
    </footer>
  );
}

function Field({ label, required, hint, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-slate-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
      {children}
      {hint && <span className="block text-[11px] text-slate-500 mt-1">{hint}</span>}
    </label>
  );
}

function Spinner() {
  return (
    <span className="inline-flex">
      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce ml-0.5 [animation-delay:120ms]" />
      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce ml-0.5 [animation-delay:240ms]" />
    </span>
  );
}

const inputCls =
  'w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors';
