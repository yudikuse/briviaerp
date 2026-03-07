import type { ReactNode } from "react";

type PanelProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
};

type FieldProps = {
  label: string;
  placeholder?: string;
  type?: string;
};

type SelectFieldProps = {
  label: string;
  options: string[];
};

export function Panel({ title, subtitle, children }: PanelProps) {
  return (
    <section className="rounded-[28px] border border-[var(--line)] bg-white/6 p-5 shadow-xl shadow-black/10">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-[var(--muted)]">{subtitle}</p>
        ) : null}
      </div>

      {children}
    </section>
  );
}

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className="rounded-[24px] border border-[var(--line)] bg-black/10 p-4">
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      {hint ? <p className="mt-2 text-xs text-[var(--gold-soft)]">{hint}</p> : null}
    </div>
  );
}

export function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-[var(--line)] bg-white/7 px-3 py-1 text-xs text-[var(--gold-soft)]">
      {children}
    </span>
  );
}

export function Field({
  label,
  placeholder = "",
  type = "text",
}: FieldProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm text-[var(--muted)]">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        className="h-12 rounded-2xl border border-[var(--line)] bg-[#f8f2ea] px-4 text-sm text-[var(--dark-text)] outline-none transition focus:border-[var(--gold)]"
      />
    </label>
  );
}

export function SelectField({ label, options }: SelectFieldProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm text-[var(--muted)]">{label}</span>
      <select className="h-12 rounded-2xl border border-[var(--line)] bg-[#f8f2ea] px-4 text-sm text-[var(--dark-text)] outline-none transition focus:border-[var(--gold)]">
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
