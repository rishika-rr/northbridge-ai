import { request } from "./http";

// ------------------------------------------------------------------ types

export type Role = "reader" | "document_manager" | "administrator";
export type Visibility = "tenant" | "private";
export type DocumentStatus = "processing" | "indexed" | "failed";

export interface User {
  id: string;
  username: string;
  role: Role;
  tenant_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
  user: User;
}

export interface Source {
  title: string;
  /** cross-encoder relevance, 0-1; null when reranking is off */
  score: number | null;
  /** matches the [n] markers in the answer */
  citation: number | null;
  page: number | null;
  snippet: string | null;
  doc_id: string | null;
}

export interface CitationDetail {
  claim: string;
  citation: number;
  supported: boolean;
  reason: string;
}

export interface AskResponse {
  answer: string;
  confidence: number | null;
  model: string | null;
  latency_ms: number | null;
  retrieved_chunks: number;
  /** number of claim-citation pairs checked */
  citations: number;
  sources: Source[];
  verified_citations: number;
  citation_details: CitationDetail[];
  no_evidence: boolean;
  request_id: string | null;
}

export interface DocumentItem {
  doc_id: string;
  name: string;
  chunks: number;
  size: number | null;
  status: DocumentStatus;
  visibility: Visibility;
  owner_id: string | null;
  error: string | null;
  created_at: string;
  updated_at: string;
}

export interface IngestResponse {
  message: string;
  doc_id: string;
  filename: string;
  status: "indexed" | "duplicate";
  chunks: number;
}

export interface BatchItem {
  filename: string;
  status: "indexed" | "duplicate" | "failed" | "rejected";
  doc_id: string | null;
  chunks: number;
  reason: string | null;
}

export interface BatchIngestResponse {
  received: number;
  accepted: number;
  processed: number;
  failed: number;
  results: BatchItem[];
}

export interface AuditEvent {
  id: number;
  ts: string;
  actor_id: string | null;
  actor_name: string | null;
  action: string;
  target: string | null;
  outcome: string;
  detail: string | null;
  request_id: string | null;
}

// --------------------------------------------------------------- limits

/** Mirrors the backend defaults; the server remains the authority. */
export const MAX_QUESTION_CHARS = 2000;
export const SUPPORTED_EXTENSIONS = [".pdf", ".txt", ".md", ".html", ".htm"];

// ------------------------------------------------------------------ auth

export function login(username: string, password: string) {
  return request<TokenResponse>("/v1/auth/login", {
    method: "POST",
    form: { username, password },
    auth: false,
  });
}

export function logout() {
  return request<{ message: string }>("/v1/auth/logout", { method: "POST" });
}

export function getMe() {
  return request<User>("/v1/auth/me");
}

export function changePassword(currentPassword: string, newPassword: string) {
  return request<{ message: string }>("/v1/auth/password", {
    method: "POST",
    json: { current_password: currentPassword, new_password: newPassword },
  });
}

// ------------------------------------------------------------------- ask

export function askQuestion(question: string) {
  return request<AskResponse>("/v1/ask", { method: "POST", json: { question } });
}

// ------------------------------------------------------------- documents

export async function getDocuments() {
  const data = await request<{ documents: DocumentItem[] }>("/v1/documents");
  return data.documents;
}

export function uploadDocuments(files: File[], visibility: Visibility) {
  const body = new FormData();
  for (const file of files) body.append("files", file);
  body.append("visibility", visibility);
  return request<BatchIngestResponse>("/v1/upload/batch", { method: "POST", body });
}

export function setDocumentVisibility(docId: string, visibility: Visibility) {
  return request<DocumentItem>(`/v1/documents/${encodeURIComponent(docId)}`, {
    method: "PATCH",
    json: { visibility },
  });
}

export function deleteDocument(docId: string) {
  return request<{ message: string; doc_id: string; chunks_removed: number }>(
    `/v1/documents/${encodeURIComponent(docId)}`,
    { method: "DELETE" }
  );
}

// ------------------------------------------------------------ administration

export function getUsers() {
  return request<User[]>("/v1/admin/users");
}

export function createUser(username: string, password: string, role: Role) {
  return request<User>("/v1/admin/users", {
    method: "POST",
    json: { username, password, role },
  });
}

export function updateUser(
  userId: string,
  changes: { role?: Role; is_active?: boolean; password?: string }
) {
  return request<User>(`/v1/admin/users/${encodeURIComponent(userId)}`, {
    method: "PATCH",
    json: changes,
  });
}

export async function getAuditEvents(action?: string, limit = 200) {
  const data = await request<{ events: AuditEvent[] }>("/v1/admin/audit", {
    query: { action, limit },
  });
  return data.events;
}
