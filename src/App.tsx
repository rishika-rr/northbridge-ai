import { useState } from "react";

import MainLayout from "./components/layout/MainLayout";

import ChatPage from "./pages/ChatPage";
import KnowledgeBasePage from "./pages/KnowledgeBasePage";

export type Page =
  | "chat"
  | "knowledge"
  | "analytics"
  | "settings";

export default function App() {
  const [activePage, setActivePage] =
    useState<Page>("chat");

  return (
    <MainLayout
      activePage={activePage}
      onPageChange={setActivePage}
    >
      {activePage === "chat" && (
        <ChatPage />
      )}

      {activePage === "knowledge" && (
        <KnowledgeBasePage />
      )}

      {/* Coming Soon */}

      {activePage === "analytics" && (
        <div className="text-zinc-500">
          Analytics
        </div>
      )}

      {activePage === "settings" && (
        <div className="text-zinc-500">
          Settings
        </div>
      )}
    </MainLayout>
  );
}