'use client';

import { useEffect, useRef, useState } from 'react';

const MODELS = [
  {
    id: 'groq',
    name: 'Llama 3.3',
    sub: 'via Groq',
    blurb: 'Fast, sharp, opinionated.',
    accent: 'from-orange-500 to-pink-500',
    dot: '#F55036',
  },
  {
    id: 'mistral',
    name: 'Mistral Large',
    sub: 'mistral.ai',
    blurb: 'Balanced and structured.',
    accent: 'from-amber-500 to-rose-500',
    dot: '#FA520F',
  },
  {
    id: 'gemini',
    name: 'Gemma 3 27B',
    sub: 'via Google',
    blurb: 'Polished and verbose.',
    accent: 'from-sky-500 to-indigo-500',
    dot: '#1A73E8',
  },
];

const TONES = [
  { id: 'professional', emoji: '📋', label: 'Professional' },
  { id: 'friendly', emoji: '👋', label: 'Friendly' },
  { id: 'enthusiastic', emoji: '⚡', label: 'Enthusiastic' },
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
  const [picked, setPicked] = useState([]);
  const [refineHistory, setRefineHistory] = useState([]);
  const [refinement, setRefinement] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const resultRef = useRef(null);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const fillExample = () => setForm((f) => ({ ...f, ...EXAMPLE }));

  // Cmd/Ctrl+Enter on any input triggers Generate
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (!loading && form.company.trim() && form.role.trim()) {
          generate();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, loading]);

  const generate = async (e) => {
    e?.preventDefault();
    if (!form.company.trim() || !form.role.trim()) {
      setError('Company and role are required.');
      return;
    }
    setError('');
    setLoading(true);
    setLetter('');
    setPicked([]);
    setRefineHistory([]);
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
      setPicked(data.pickedProjects || []);
      // Smooth-scroll to the result
      requestAnimationFrame(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
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
      setRefineHistory((h) => [...h, refinement]);
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
      `Hi Miguel,\n\nI work at ${form.company}. I tried your cover-letter generator and would love to talk about ${form.role || 'a role'}.\n\n— Sent from miguel-ai.vercel.app`
    );
    return `mailto:${MIGUEL_EMAIL}?subject=${subject}&body=${body}`;
  };

  const wordCount = letter ? letter.trim().split(/\s+/).length : 0;
  const canGenerate = !loading && form.company.trim() && form.role.trim();

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-slate-900 antialiased">
      {/* Subtle gradient mesh in the hero only */}
      <div className="absolute inset-x-0 top-0 h-[420px] -z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-20 w-[36rem] h-[36rem] rounded-full bg-violet-200/40 blur-3xl" />
        <div className="absolute -top-20 right-0 w-[32rem] h-[32rem] rounded-full bg-sky-200/40 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-6 pt-14 sm:pt-20 pb-24">
        {/* Hero */}
        <header className="mb-12 sm:mb-16">
          <p className="text-xs uppercase tracking-[0.2em] text-violet-600 font-semibold mb-3">
            Cover-letter studio
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl tracking-tight text-slate-900 leading-[1.1]">
            Hi, I'm Miguel.
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
            Tell me about your role and I'll draft you a cover letter on the
            spot — using the LLM you pick. Powered by my own{' '}
            <code className="px-1.5 py-0.5 rounded bg-slate-200/70 font-mono text-[0.85em] text-slate-700">
              /api/cover-letter
            </code>{' '}
            with three different model providers.
          </p>
        </header>

        {/* Step 1 — The role */}
        <Card>
          <CardHeader
            step="1"
            title="The role"
            right={
              <button
                type="button"
                onClick={fillExample}
                className="text-xs text-violet-600 hover:text-violet-700 font-medium"
              >
                Fill with example →
              </button>
            }
          />
          <form onSubmit={generate} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Company"
                required
                value={form.company}
                onChange={update('company')}
                placeholder="ACME Corp"
                maxLength={200}
              />
              <Input
                label="Role"
                required
                value={form.role}
                onChange={update('role')}
                placeholder="Senior Software Engineer"
                maxLength={200}
              />
            </div>
            <Textarea
              label="Job description"
              hint="Paste the JD or key requirements — this is what makes the letter specific."
              value={form.jd}
              onChange={update('jd')}
              placeholder="We're looking for…"
              maxLength={6000}
              rows={5}
            />
            <Input
              label="Recruiter name"
              optional
              value={form.recruiterName}
              onChange={update('recruiterName')}
              placeholder="Alex"
              maxLength={120}
            />
          </form>
        </Card>

        {/* Step 2 — The voice */}
        <div className="mt-6">
          <Card>
            <CardHeader step="2" title="The voice" />
            <div className="space-y-6">
              {/* Tone chips */}
              <div>
                <Label>Tone</Label>
                <div className="grid grid-cols-3 gap-2.5">
                  {TONES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => set('tone', t.id)}
                      className={`group relative px-3 py-3 rounded-xl border text-sm font-medium transition-all ${
                        form.tone === t.id
                          ? 'border-violet-500 bg-violet-50 text-violet-900 ring-2 ring-violet-500/20'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span className="block text-lg mb-0.5">{t.emoji}</span>
                      <span className="block text-[13px]">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Language pills */}
              <div>
                <Label>Language</Label>
                <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200">
                  {[
                    { id: 'EN', label: 'English' },
                    { id: 'DE', label: 'Deutsch' },
                  ].map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => set('language', l.id)}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        form.language === l.id
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Model tiles */}
              <div>
                <Label>Model</Label>
                <div className="grid sm:grid-cols-3 gap-2.5">
                  {MODELS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => set('model', m.id)}
                      className={`group relative text-left p-3.5 rounded-xl border transition-all ${
                        form.model === m.id
                          ? 'border-violet-500 bg-violet-50 ring-2 ring-violet-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: m.dot }}
                        />
                        <span className="font-medium text-slate-900 text-sm">
                          {m.name}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mb-1">{m.sub}</div>
                      <div className="text-[11px] text-slate-400 leading-snug">
                        {m.blurb}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* CTA */}
        <div className="mt-8 sm:mt-10">
          <button
            type="button"
            onClick={generate}
            disabled={!canGenerate}
            className={`group relative w-full overflow-hidden rounded-2xl px-6 py-4 text-base font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              canGenerate
                ? 'text-white shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 hover:-translate-y-0.5'
                : 'text-white shadow-md'
            }`}
            style={{
              background:
                'linear-gradient(120deg, #7c3aed 0%, #6366f1 50%, #2563eb 100%)',
            }}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <Spinner /> {letter ? 'Refining…' : 'Drafting your letter…'}
                </>
              ) : (
                <>
                  <SparkleIcon />{' '}
                  {letter ? 'Regenerate' : 'Draft the letter'}
                  <kbd className="hidden sm:inline-flex items-center gap-0.5 ml-2 px-1.5 py-0.5 rounded bg-white/20 text-[10px] font-mono">
                    ⌘↵
                  </kbd>
                </>
              )}
            </span>
            {/* Shimmer */}
            {canGenerate && (
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            )}
          </button>

          {error && (
            <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {error}
            </p>
          )}
        </div>

        {/* Result */}
        {(letter || loading) && (
          <section ref={resultRef} className="mt-12 sm:mt-16">
            {/* Matched-on chips */}
            {picked.length > 0 && (
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-slate-500 font-medium">
                  Matched on
                </span>
                {picked.map((p) => (
                  <span
                    key={p}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-slate-200 text-xs font-medium text-slate-700"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                    {p}
                  </span>
                ))}
                {usedModel && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 text-white text-xs font-medium ml-auto">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor:
                          MODELS.find((m) => m.id === usedModel)?.dot || '#fff',
                      }}
                    />
                    {MODELS.find((m) => m.id === usedModel)?.name || usedModel}
                  </span>
                )}
              </div>
            )}

            {/* Letterhead */}
            <Letterhead loading={loading && !letter}>
              {letter && (
                <p className="whitespace-pre-wrap font-serif text-[16.5px] leading-[1.75] text-slate-800">
                  {letter}
                </p>
              )}
            </Letterhead>

            {/* Word count + actions */}
            {letter && (
              <>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>{wordCount} words</span>
                  <span className="font-mono">
                    {wordCount < 200
                      ? '↓ short'
                      : wordCount > 280
                      ? '↑ long'
                      : '✓ standard length'}
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <ActionButton onClick={copyLetter}>
                    {copied ? '✓ Copied' : 'Copy'}
                  </ActionButton>
                  <ActionButton onClick={downloadLetter}>
                    Download .txt
                  </ActionButton>
                  <a
                    href={mailtoHref()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
                  >
                    Talk to Miguel about this role
                    <span aria-hidden>→</span>
                  </a>
                </div>

                {/* Refine */}
                <div className="mt-8 p-5 sm:p-6 rounded-2xl bg-white border border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-900 mb-1">
                    Refine it
                  </h3>
                  <p className="text-xs text-slate-500 mb-3">
                    Iteratively rewrite the letter — chat-style.
                  </p>
                  {refineHistory.length > 0 && (
                    <ul className="mb-3 space-y-1">
                      {refineHistory.map((h, i) => (
                        <li
                          key={i}
                          className="text-xs text-slate-500 italic before:content-['→_']"
                        >
                          {h}
                        </li>
                      ))}
                    </ul>
                  )}
                  <form onSubmit={refine} className="flex gap-2">
                    <input
                      type="text"
                      value={refinement}
                      onChange={(e) => setRefinement(e.target.value)}
                      placeholder="Make it shorter / translate to German / add a line about Azure…"
                      maxLength={1000}
                      className="flex-1 px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
                    />
                    <button
                      type="submit"
                      disabled={loading || !refinement.trim()}
                      className="px-4 py-2.5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors"
                    >
                      {loading ? '…' : 'Refine'}
                    </button>
                  </form>
                  <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
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
                        className="text-xs text-violet-600 hover:text-violet-700 hover:underline"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </section>
        )}

        <footer className="mt-16 pt-6 border-t border-slate-200 text-xs text-slate-500 leading-relaxed">
          Letters are generated by an LLM; review carefully before sending. Some
          companies have policies about AI-assisted applications. Inputs aren't
          stored. The candidate profile this page draws from lives at{' '}
          <a href="/" className="text-violet-600 hover:underline">
            miguel-ai
          </a>
          .
        </footer>
      </div>
    </main>
  );
}

/* ----- Sub-components ----- */

function Card({ children }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 p-5 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.08)]">
      {children}
    </div>
  );
}

function CardHeader({ step, title, right }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-[11px] font-semibold">
          {step}
        </span>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      </div>
      {right}
    </div>
  );
}

function Label({ children }) {
  return (
    <span className="block text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2.5">
      {children}
    </span>
  );
}

function Input({ label, required, optional, hint, ...rest }) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between mb-1.5">
        <span className="text-xs font-medium text-slate-700">
          {label}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </span>
        {optional && (
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">
            optional
          </span>
        )}
      </span>
      <input
        {...rest}
        className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 transition-colors"
      />
      {hint && (
        <span className="block text-[11px] text-slate-500 mt-1.5">{hint}</span>
      )}
    </label>
  );
}

function Textarea({ label, hint, value, maxLength, ...rest }) {
  const len = (value || '').length;
  return (
    <label className="block">
      <span className="flex items-baseline justify-between mb-1.5">
        <span className="text-xs font-medium text-slate-700">{label}</span>
        {maxLength && (
          <span
            className={`text-[10px] font-mono ${
              len > maxLength * 0.9 ? 'text-rose-500' : 'text-slate-400'
            }`}
          >
            {len.toLocaleString()} / {maxLength.toLocaleString()}
          </span>
        )}
      </span>
      <textarea
        value={value}
        maxLength={maxLength}
        {...rest}
        className="w-full px-3.5 py-3 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 transition-colors resize-y"
      />
      {hint && (
        <span className="block text-[11px] text-slate-500 mt-1.5">{hint}</span>
      )}
    </label>
  );
}

function ActionButton({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
    >
      {children}
    </button>
  );
}

function Letterhead({ loading, children }) {
  return (
    <div
      className="relative rounded-2xl border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04),0_24px_48px_-24px_rgba(0,0,0,0.12)] overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, #FDFCF8 0%, #FAF8F1 100%)',
      }}
    >
      {/* Faint top ruled line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-300/60 to-transparent" />
      <div className="px-6 sm:px-12 py-10 sm:py-14 min-h-[20rem]">
        {loading ? (
          <div className="space-y-3">
            {[100, 95, 88, 92, 80, 70].map((w, i) => (
              <div
                key={i}
                className="h-3 rounded bg-slate-200/80 animate-pulse"
                style={{ width: `${w}%`, animationDelay: `${i * 80}ms` }}
              />
            ))}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" />
      <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:120ms]" />
      <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:240ms]" />
    </span>
  );
}

function SparkleIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2l1.8 5.4L19 9l-5.2 1.6L12 16l-1.8-5.4L5 9l5.2-1.6L12 2zM19 14l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3zM5 14l.7 2.3L8 17l-2.3.7L5 20l-.7-2.3L2 17l2.3-.7L5 14z" />
    </svg>
  );
}
