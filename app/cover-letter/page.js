'use client';

import { useEffect, useRef, useState } from 'react';

const MODELS = [
  {
    id: 'groq',
    name: 'Llama 3.3 70B',
    provider: 'Groq',
    description: 'Fast and efficient',
    dot: '#F55036',
  },
  {
    id: 'mistral',
    name: 'Mistral Large',
    provider: 'Mistral AI',
    description: 'European AI powerhouse',
    dot: '#FA520F',
  },
  {
    id: 'gemini',
    name: 'Gemma 3 27B',
    provider: 'Google',
    description: "Google's Gemma model",
    dot: '#1A73E8',
  },
];

const MODELS_BY_ID = Object.fromEntries(MODELS.map((m) => [m.id, m]));

const EXAMPLE = {
  company: 'Cambridge University Press & Assessment',
  role: 'Senior Software Engineer (AI Tools)',
  jd:
    'We are looking for a senior engineer to build internal AI tooling. Strong Python, experience with LangChain or RAG, cloud (Azure preferred), and a track record of shipping end-to-end features. Bonus: computer vision or LLM fine-tuning.',
  recruiterName: 'Alex',
};

function FlagUK() {
  return (
    <svg viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice" className="w-full h-full block" aria-hidden="true">
      <clipPath id="cl-uk-clip"><rect width="60" height="30" /></clipPath>
      <g clipPath="url(#cl-uk-clip)">
        <rect width="60" height="30" fill="#012169" />
        <path d="M0,0 60,30 M60,0 0,30" stroke="white" strokeWidth="6" />
        <path d="M0,0 60,30 M60,0 0,30" stroke="#C8102E" strokeWidth="3" clipPath="url(#cl-uk-clip)" />
        <path d="M30,0 v30 M0,15 h60" stroke="white" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  );
}

function FlagDE() {
  return (
    <svg viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice" className="w-full h-full block" aria-hidden="true">
      <rect y="0" width="60" height="10" fill="#000000" />
      <rect y="10" width="60" height="10" fill="#DD0000" />
      <rect y="20" width="60" height="10" fill="#FFCE00" />
    </svg>
  );
}

function FlagToggle({ language, onChange }) {
  const opts = [
    { id: 'EN', flag: <FlagUK />, label: 'English' },
    { id: 'DE', flag: <FlagDE />, label: 'Deutsch' },
  ];
  return (
    <div className="inline-flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 border border-slate-200">
      {opts.map((o) => {
        const active = language === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            title={`Output language: ${o.label}`}
            aria-pressed={active}
            className={`flex items-center justify-center w-7 h-7 rounded-md overflow-hidden transition-all ${
              active
                ? 'ring-2 ring-violet-500 ring-offset-1 ring-offset-slate-100'
                : 'opacity-40 hover:opacity-80'
            }`}
          >
            {o.flag}
          </button>
        );
      })}
    </div>
  );
}

const MIGUEL_EMAIL = 'mmlacanienta@gmail.com';

export default function CoverLetterPage() {
  const [form, setForm] = useState({
    company: '',
    role: '',
    jd: '',
    recruiterName: '',
    language: 'EN',
    model: 'groq',
    // tone is always "professional" — sent server-side, not user-controlled
  });
  const [letter, setLetter] = useState('');
  const [usedModel, setUsedModel] = useState('');
  const [picked, setPicked] = useState([]);
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
    try {
      const r = await fetch('/api/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'generate', tone: 'professional', ...form }),
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
      <div className="absolute inset-x-0 top-0 h-[280px] -z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-20 w-[32rem] h-[32rem] rounded-full bg-violet-200/40 blur-3xl" />
        <div className="absolute -top-20 right-0 w-[28rem] h-[28rem] rounded-full bg-sky-200/40 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-6 pb-12">
        {/* Hero */}
        <header className="mb-6">
          <p className="text-xs uppercase tracking-[0.2em] text-violet-600 font-semibold mb-2">
            Cover-letter studio
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl tracking-tight text-slate-900 leading-[1.1]">
            Hi, I'm Miguel.
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
            Tell me about your role and I'll draft you a cover letter on the
            spot — using the LLM you pick.
          </p>
        </header>

        {/* Single compact card with all inputs */}
        <Card>
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <h2 className="text-sm font-semibold text-slate-900">
                Tell me about your role
              </h2>
              <button
                type="button"
                onClick={fillExample}
                className="text-xs text-violet-600 hover:text-violet-700 font-medium shrink-0"
              >
                Fill with example →
              </button>
            </div>
            <FlagToggle
              language={form.language}
              onChange={(v) => set('language', v)}
            />
          </div>
          <form onSubmit={generate} className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
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
            <Input
              label="Recruiter name"
              optional
              value={form.recruiterName}
              onChange={update('recruiterName')}
              placeholder="Hiring Manager"
              maxLength={120}
            />
            <Textarea
              label="Job description"
              value={form.jd}
              onChange={update('jd')}
              placeholder="Paste the JD — it's what makes the letter specific."
              maxLength={6000}
              rows={4}
            />
          </form>

        </Card>

        {/* Split-button: gradient Draft CTA on the left, inline model picker on the right */}
        <div
          className={`group mt-4 relative flex items-stretch rounded-xl transition-all ${
            canGenerate
              ? 'shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30'
              : 'shadow-md'
          } ${!canGenerate ? 'opacity-60' : ''}`}
          style={{
            background:
              'linear-gradient(120deg, #7c3aed 0%, #6366f1 50%, #2563eb 100%)',
          }}
        >
          <button
            type="button"
            onClick={generate}
            disabled={!canGenerate}
            className="relative flex-1 overflow-hidden rounded-l-xl px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed transition-transform hover:bg-white/5 active:scale-[0.99]"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <Spinner /> Drafting your letter…
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
            {canGenerate && (
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            )}
          </button>
          <div className="w-px bg-white/25 my-2.5" />
          <InlineModelMenu
            value={form.model}
            onChange={(m) => set('model', m)}
          />
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* Result */}
        {(letter || loading) && (
          <section ref={resultRef} className="mt-8">
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
                          MODELS_BY_ID[usedModel]?.dot || '#fff',
                      }}
                    />
                    {MODELS_BY_ID[usedModel]?.name || usedModel}
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
              </>
            )}
          </section>
        )}

        <footer className="mt-10 pt-5 border-t border-slate-200 text-xs text-slate-500 leading-relaxed">
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
    <div className="rounded-2xl bg-white border border-slate-200/80 p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.08)]">
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

function Label({ children, inline }) {
  return (
    <span
      className={`text-[11px] uppercase tracking-wider text-slate-500 font-semibold ${
        inline ? 'inline' : 'block mb-2.5'
      }`}
    >
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

function InlineModelMenu({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);
  const current = MODELS_BY_ID[value] || MODELS[0];
  return (
    <div ref={ref} className="relative flex items-stretch">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="flex items-center gap-2 px-3.5 sm:px-4 rounded-r-xl text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors"
      >
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: current.dot }}
        />
        <span className="hidden sm:inline">{current.name}</span>
        <span className="sm:hidden">{current.name.split(' ')[0]}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="absolute bottom-full right-0 mb-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden p-2">
          {MODELS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                onChange(m.id);
                setOpen(false);
              }}
              className={`w-full text-left p-3 rounded-xl transition-colors ${
                value === m.id
                  ? 'bg-violet-50 ring-2 ring-violet-200'
                  : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between mb-0.5">
                <div>
                  <div className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: m.dot }}
                    />
                    {m.name}
                  </div>
                  <div className="text-xs text-slate-500 ml-3">{m.provider}</div>
                </div>
                {value === m.id && (
                  <svg
                    className="w-4 h-4 text-violet-600 shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <p className="text-xs text-slate-600 ml-3">{m.description}</p>
            </button>
          ))}
        </div>
      )}
    </div>
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
