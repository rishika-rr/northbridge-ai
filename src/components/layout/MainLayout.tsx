import type { ReactNode } from "react";

import type { Page } from "../../navigation";
import Sidebar from "./Sidebar";

type Props = {
  children: ReactNode;
  activePage: Page;
  onPageChange: (page: Page) => void;
};

export default function MainLayout({ children, activePage, onPageChange }: Props) {
  return (
    <div className="min-h-screen px-8 py-7 flex gap-10">
      <Sidebar activePage={activePage} onPageChange={onPageChange} />

      <main className="flex-1 min-w-0 flex justify-center">
        <div className="w-full max-w-[980px]">{children}</div>
      </main>
    </div>
  );
}
