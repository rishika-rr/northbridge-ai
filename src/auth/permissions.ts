import type { DocumentItem, Role, User } from "../services/api";

/**
 * What each role may do. This only decides what the interface offers
 * (UI-004); the server enforces the same rules on every request.
 */
export type Capability = "manageDocuments" | "administer";

const CAPABILITIES: Record<Role, Capability[]> = {
  reader: [],
  document_manager: ["manageDocuments"],
  administrator: ["manageDocuments", "administer"],
};

export function can(user: User | null, capability: Capability): boolean {
  return !!user && user.is_active && CAPABILITIES[user.role].includes(capability);
}

export const ROLE_LABELS: Record<Role, string> = {
  reader: "Reader",
  document_manager: "Document Manager",
  administrator: "Administrator",
};

/** Who may delete a document or change who can read it. */
export function canManageDocument(user: User | null, doc: DocumentItem): boolean {
  if (!can(user, "manageDocuments")) return false;
  if (user!.role === "administrator") return true;
  return doc.visibility === "tenant" || doc.owner_id === user!.id;
}
