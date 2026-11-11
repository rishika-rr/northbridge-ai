import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

type Tone = "error" | "info" | "success";

const STYLES: Record<Tone, string> = {
  error: "border-red-500/25 bg-red-500/[0.07] text-red-200",
  info: "border-blue-500/25 bg-blue-500/[0.06] text-blue-100",
  success: "border-emerald-500/25 bg-emerald-500/[0.07] text-emerald-200",
};

const ICONS = { error: AlertTriangle, info: Info, success: CheckCircle2 };

/** Inline status message. Errors are announced to assistive technology. */
export default function Notice({
  tone = "error",
  children,
  action,
}: {
  tone?: Tone;
  children: ReactNode;
  action?: ReactNode;
}) {
  const Icon = ICONS[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`flex items-start gap-3 rounded-2xl border px-5 py-4 text-[14px] leading-6 ${STYLES[tone]}`}
    >
      <Icon size={18} className="mt-0.5 shrink-0" aria-hidden />
      <div className="flex-1">{children}</div>
      {action}
    </div>
  );
}
