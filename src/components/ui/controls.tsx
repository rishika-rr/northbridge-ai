import { useId } from "react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-blue-400">{children}</p>
  );
}

export function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h1 className="text-4xl font-semibold text-white">{title}</h1>
      <p className="mt-3 text-zinc-500">{description}</p>
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl border border-white/5 bg-white/[0.025] ${className}`}>{children}</div>
  );
}

type Variant = "primary" | "secondary" | "danger";

const BUTTONS: Record<Variant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-500",
  secondary: "border border-white/10 bg-white/[0.03] text-zinc-200 hover:bg-white/[0.07]",
  danger: "border border-red-500/30 bg-red-500/10 text-red-200 hover:bg-red-500/20",
};

export function Button({
  variant = "primary",
  small = false,
  className = "",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; small?: boolean }) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition
        disabled:cursor-not-allowed disabled:opacity-50
        ${small ? "h-9 px-3 text-[13px]" : "h-11 px-5 text-[14px]"}
        ${BUTTONS[variant]} ${className}`}
      {...props}
    />
  );
}

const FIELD =
  "h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-[14px] text-white " +
  "placeholder:text-zinc-600 outline-none transition focus:border-blue-500/50 focus:bg-white/[0.05] " +
  "disabled:opacity-50";

export function Field({
  label,
  hint,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  const hintId = useId();
  return (
    <div>
      <label className="block">
        <span className="mb-2 block text-[13px] font-medium text-zinc-300">{label}</span>
        <input className={FIELD} aria-describedby={hint ? hintId : undefined} {...props} />
      </label>
      {hint && (
        <p id={hintId} className="mt-1.5 text-[12px] text-zinc-500">
          {hint}
        </p>
      )}
    </div>
  );
}

export function Select({
  label,
  children,
  className = "",
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-medium text-zinc-300">{label}</span>
      <select className={`${FIELD} appearance-none [&>option]:bg-zinc-900 ${className}`} {...props}>
        {children}
      </select>
    </label>
  );
}

export function Badge({
  tone,
  children,
}: {
  tone: "green" | "amber" | "red" | "blue" | "zinc";
  children: ReactNode;
}) {
  const tones = {
    green: "bg-emerald-500/10 text-emerald-400",
    amber: "bg-amber-500/10 text-amber-300",
    red: "bg-red-500/10 text-red-300",
    blue: "bg-blue-500/10 text-blue-300",
    zinc: "bg-white/[0.06] text-zinc-300",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs ${tones[tone]}`}>
      {children}
    </span>
  );
}
