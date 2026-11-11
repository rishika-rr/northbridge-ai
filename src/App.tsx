import { useState } from "react";

import { useAuth } from "./auth/context";
import { can } from "./auth/permissions";
import MainLayout from "./components/layout/MainLayout";
import type { Page } from "./navigation";
import AccountPage from "./pages/AccountPage";
import AdminPage from "./pages/AdminPage";
import ChatPage from "./pages/ChatPage";
import KnowledgeBasePage from "./pages/KnowledgeBasePage";
import LoginPage from "./pages/LoginPage";
import type { User } from "./services/api";

export default function App() {
  const auth = useAuth();

  if (auth.status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center text-zinc-500" role="status">
        Loading…
      </div>
    );
  }

  if (auth.status === "anonymous") {
    return <LoginPage />;
  }

  // Keyed by user: every signed-in session starts fresh on the chat page and
  // nothing from one account's session (answers, open page) carries over.
  return <Workspace key={auth.user.id} user={auth.user} />;
}

function Workspace({ user }: { user: User }) {
  const [activePage, setActivePage] = useState<Page>("chat");

  // A role change can remove access to the page that is open.
  const page: Page = activePage === "admin" && !can(user, "administer") ? "chat" : activePage;

  return (
    <MainLayout activePage={page} onPageChange={setActivePage}>
      {/* The chat stays mounted so an answer survives a visit to another page. */}
      <div hidden={page !== "chat"}>
        <ChatPage />
      </div>
      {page === "knowledge" && <KnowledgeBasePage />}
      {page === "admin" && <AdminPage />}
      {page === "account" && <AccountPage />}
    </MainLayout>
  );
}
