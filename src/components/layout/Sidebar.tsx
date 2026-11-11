import { FolderOpen, LogOut, MessageSquare, ShieldCheck, UserRound } from "lucide-react";

import { useAuth } from "../../auth/context";
import { can, ROLE_LABELS } from "../../auth/permissions";
import type { Page } from "../../navigation";
import NorthbridgeLogo from "../branding/NorthbridgeLogo";

type SidebarProps = {
  activePage: Page;
  onPageChange: (page: Page) => void;
};

const navigation = [
  { label: "Chat", page: "chat" as const, icon: MessageSquare, adminOnly: false },
  { label: "Knowledge Base", page: "knowledge" as const, icon: FolderOpen, adminOnly: false },
  { label: "Administration", page: "admin" as const, icon: ShieldCheck, adminOnly: true },
  { label: "Account", page: "account" as const, icon: UserRound, adminOnly: false },
];

export default function Sidebar({ activePage, onPageChange }: SidebarProps) {
  const { user, signOut } = useAuth();
  const isAdmin = can(user, "administer");

  return (
    <aside
      className="
      sticky top-7 h-[calc(100vh-56px)] w-[250px] shrink-0
      rounded-[30px] border border-white/5 bg-white/[0.025] backdrop-blur-xl
      flex flex-col px-7 py-8
      "
    >
      {/* ---------------- Brand ---------------- */}

      <div className="flex flex-col items-center pb-14">
        <NorthbridgeLogo />

        <p className="mt-5 text-center text-[20px] font-semibold leading-none tracking-[-0.04em] text-white">
          Northbridge AI
        </p>

        <p className="mt-2 text-center text-[13px] tracking-wide text-zinc-600">Enterprise Search</p>
      </div>

      {/* ---------------- Navigation ---------------- */}

      <nav aria-label="Main" className="flex flex-col gap-3">
        {navigation
          .filter((item) => !item.adminOnly || isAdmin)
          .map((item) => {
            const Icon = item.icon;
            const active = activePage === item.page;

            return (
              <button
                key={item.label}
                onClick={() => onPageChange(item.page)}
                aria-current={active ? "page" : undefined}
                className={`
                group h-11 rounded-xl px-4 flex items-center gap-3.5
                transition-all duration-200
                ${
                  active
                    ? "bg-blue-500/[0.04] border border-blue-500/15 text-white shadow-[0_0_16px_rgba(59,130,246,.06)]"
                    : "text-zinc-500 hover:bg-white/[0.03] hover:text-white"
                }
                `}
              >
                <Icon
                  size={19}
                  aria-hidden
                  className="transition-all duration-200 group-hover:translate-x-[2px]"
                />
                <span className="whitespace-nowrap text-left text-[15px] font-medium">{item.label}</span>
              </button>
            );
          })}
      </nav>

      <div className="flex-1" />

      {/* ---------------- Signed-in user ---------------- */}

      {user && (
        <div className="border-t border-white/5 pt-6">
          <p className="truncate text-[14px] font-medium text-white" title={user.username}>
            {user.username}
          </p>
          <p className="mt-1 text-xs text-zinc-500">{ROLE_LABELS[user.role]}</p>

          <button
            onClick={() => void signOut()}
            className="
            mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl
            border border-white/8 text-[13px] font-medium text-zinc-400
            transition hover:bg-white/[0.05] hover:text-white
            "
          >
            <LogOut size={15} aria-hidden />
            Sign out
          </button>
        </div>
      )}
    </aside>
  );
}
