import React, { useEffect, useId, useState } from 'react';

// Local replacements for the platform components used by App.tsx,
// so Elhdad Fit can run as a standalone site.

export function FileRouter({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function FileCard({ children, lang, dir }: { children: React.ReactNode; lang?: string; dir?: string }) {
  return <div className="file-card" lang={lang} dir={dir as 'ltr' | 'rtl' | undefined}>{children}</div>;
}

export function Header({ title, intro }: { title: string; intro?: string }) {
  return <header className="file-header"><h1>{title}</h1>{intro && <p>{intro}</p>}</header>;
}

export function FileButton({ children, onClick, variant, compact, selected, disabled, ...rest }: {
  children: React.ReactNode; onClick?: () => void; variant?: string; compact?: boolean; selected?: boolean; disabled?: boolean;
  [key: string]: unknown;
}) {
  const cls = ['file-button', compact ? 'is-compact' : ''].filter(Boolean).join(' ');
  return <button type="button" className={cls} data-variant={variant} aria-pressed={selected || undefined} disabled={disabled} onClick={onClick} {...rest}>{children}</button>;
}

export function ChoiceRow({ label, options, value, onChange }: {
  label: string; options: { value: string; label: string }[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <fieldset className="file-choice-field">
      <legend>{label}</legend>
      <div className="file-choice-row">
        {options.map(o => (
          <button key={o.value} type="button" aria-pressed={o.value === value} onClick={() => onChange(o.value)}>{o.label}</button>
        ))}
      </div>
    </fieldset>
  );
}

export function Slider({ label, min, max, value, onChange, describe }: {
  label: string; min: number; max: number; value: number; onChange: (n: number) => void; describe?: (n: number) => string;
}) {
  const id = useId();
  return (
    <div className="file-control">
      <div className="file-slider-head">
        <label className="file-control-label file-slider" htmlFor={id}>{label}</label>
        <span className="file-slider-value">{describe ? describe(value) : value}</span>
      </div>
      <input id={id} type="range" min={min} max={max} value={value} aria-label={label}
        onChange={e => onChange(Number(e.target.value))} />
    </div>
  );
}

export function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const id = useId();
  return (
    <div className="file-control">
      <label className="file-control-label" htmlFor={id}>{label}</label>
      <input id={id} type="text" value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

export function TextLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} target="_blank" rel="noreferrer">{children}</a>;
}

export function Caption({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p className="file-caption">{children}</p>;
}

export function Closing({ children }: { children?: React.ReactNode }) {
  return <footer className="file-closing">{children}</footer>;
}

export function CloseButton({ label, onClick }: { label: string; onClick: () => void }) {
  return <button type="button" className="file-close-button" aria-label={label} onClick={onClick}>
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 2l12 12M14 2L2 14" />
    </svg>
  </button>;
}

export function Callout({ children }: { children?: React.ReactNode }) {
  return <div className="file-callout">{children}</div>;
}

export function useLocalState<T>(key: string, initial: T): [T, (v: T) => void, { ready: boolean; message: string }] {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw != null) setValue(JSON.parse(raw));
    } catch { /* private mode etc. */ }
    setReady(true);
  }, [key]);
  const set = (v: T) => {
    setValue(v);
    try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* ignore */ }
  };
  return [value, set, { ready, message: ready ? 'Saved on this device.' : '' }];
}
