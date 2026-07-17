import {
  MessageSquare,
  FolderOpen,
  BarChart3,
  Settings,
} from "lucide-react";

import NorthbridgeLogo from "../branding/NorthbridgeLogo";

type Page =
  | "chat"
  | "knowledge"
  | "analytics"
  | "settings";

type SidebarProps = {
  activePage: Page;
  onPageChange: (page: Page) => void;
};

const navigation = [
  {
    label: "Chat",
    page: "chat" as const,
    icon: MessageSquare,
  },
  {
    label: "Knowledge Base",
    page: "knowledge" as const,
    icon: FolderOpen,
  },
  {
    label: "Analytics",
    page: "analytics" as const,
    icon: BarChart3,
  },
  {
    label: "Settings",
    page: "settings" as const,
    icon: Settings,
  },
];

export default function Sidebar({
  activePage,
  onPageChange,
}: SidebarProps) {
  return (
    <aside
      className="
      sticky
      top-7

      h-[calc(100vh-56px)]
      w-[250px]

      rounded-[30px]

      border
      border-white/5

      bg-white/[0.025]

      backdrop-blur-xl

      flex
      flex-col

      px-7
      py-8
      "
    >
      {/* ---------------- Brand ---------------- */}

      <div
        className="
        flex
        flex-col
        items-center

        pb-14
        "
      >
        <NorthbridgeLogo />

        <h1
          className="
          mt-5

          text-[20px]

          font-semibold

          tracking-[-0.04em]

          text-white

          text-center

          leading-none
          "
        >
          Northbridge AI
        </h1>

        <p
          className="
          mt-2

          text-[13px]

          tracking-wide

          text-zinc-600

          text-center
          "
        >
          Enterprise Search
        </p>
      </div>

      {/* ---------------- Navigation ---------------- */}

      <nav
        className="
        flex
        flex-col
        gap-3
        "
      >
        {navigation.map((item) => {
          const Icon = item.icon;

          const active =
            activePage === item.page;

          return (
            <button
              key={item.label}
              onClick={() =>
                onPageChange(item.page)
              }
              className={`
              group

              h-11

              rounded-xl

              px-5

              flex
              items-center

              gap-4

              transition-all
              duration-200

              ${
                active
                  ? `
                    bg-blue-500/[0.04]

                    border
                    border-blue-500/15

                    text-white

                    shadow-[0_0_16px_rgba(59,130,246,.06)]
                  `
                  : `
                    text-zinc-500

                    hover:bg-white/[0.03]

                    hover:text-white
                  `
              }
              `}
            >
              <Icon
                size={19}
                className="
                transition-all
                duration-200
                group-hover:translate-x-[2px]
                "
              />

              <span
                className="
                text-[15px]

                font-medium
                "
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="flex-1" />

      {/* ---------------- Footer ---------------- */}

      <div
        className="
        border-t
        border-white/5

        pt-6
        "
      >
        <div
          className="
          flex
          items-center

          gap-2

          text-[13px]

          text-zinc-500
          "
        >
          <div
            className="
            h-2
            w-2

            rounded-full

            bg-emerald-400
            "
          />

          Connected
        </div>

        <p
          className="
          mt-2

          text-xs

          text-zinc-600
          "
        >
          DeepSeek Chat V3
        </p>
      </div>
    </aside>
  );
}