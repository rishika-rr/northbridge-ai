import { useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Lock, RefreshCw, Search, Trash2, Upload, Users, X } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "../auth/context";
import { can, canManageDocument } from "../auth/permissions";
import Notice from "../components/ui/Notice";
import { Badge, Button, Card, PageHeader, Select } from "../components/ui/controls";
import { formatBytes, formatDateTime, plural } from "../lib/format";
import {
  deleteDocument,
  getDocuments,
  setDocumentVisibility,
  SUPPORTED_EXTENSIONS,
  uploadDocuments,
} from "../services/api";
import type { BatchIngestResponse, DocumentItem, Visibility } from "../services/api";
import { describeError } from "../services/http";

const DOCUMENTS_KEY = ["documents"];

function isSupported(file: File): boolean {
  const name = file.name.toLowerCase();
  return SUPPORTED_EXTENSIONS.some((extension) => name.endsWith(extension));
}

export default function KnowledgeBasePage() {
  const { user } = useAuth();
  const canManage = can(user, "manageDocuments");

  const documents = useQuery({
    queryKey: DOCUMENTS_KEY,
    queryFn: getDocuments,
    // keep polling while an ingestion job is still running
    refetchInterval: (query) =>
      query.state.data?.some((doc) => doc.status === "processing") ? 3000 : false,
  });

  const [filter, setFilter] = useState("");
  const visible = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    const all = documents.data ?? [];
    return needle ? all.filter((doc) => doc.name.toLowerCase().includes(needle)) : all;
  }, [documents.data, filter]);

  const total = documents.data?.length ?? 0;
  const failed = documents.data?.filter((doc) => doc.status === "failed").length ?? 0;

  return (
    <div className="space-y-10 pb-24">
      <PageHeader
        title="Knowledge Base"
        description={
          canManage
            ? "Upload documents and manage who can search them."
            : "The documents you can search. Ask a document manager to add or remove documents."
        }
      />

      {canManage && <UploadCard />}

      <section aria-labelledby="documents-heading">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="documents-heading" className="text-xl font-semibold">
              Documents
            </h2>
            {documents.data && (
              <p className="mt-1 text-[13px] text-zinc-500">
                {plural(total, "document")}
                {failed > 0 && ` · ${failed} failed to index`}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {total > 8 && (
              <label className="relative block">
                <span className="sr-only">Filter documents by name</span>
                <Search
                  size={15}
                  aria-hidden
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
                />
                <input
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Filter by name"
                  className="
                  h-10 w-56 rounded-xl border border-white/10 bg-white/[0.03] pl-10 pr-3
                  text-[14px] text-white placeholder:text-zinc-600 outline-none
                  focus:border-blue-500/50
                  "
                />
              </label>
            )}
            <Button
              variant="secondary"
              small
              onClick={() => void documents.refetch()}
              disabled={documents.isFetching}
            >
              <RefreshCw size={14} aria-hidden className={documents.isFetching ? "animate-spin" : ""} />
              Refresh
            </Button>
          </div>
        </div>

        {documents.isPending && (
          <p role="status" className="text-zinc-500">
            Loading documents…
          </p>
        )}

        {documents.isError && (
          <Notice
            action={
              <Button variant="secondary" small onClick={() => void documents.refetch()}>
                Try again
              </Button>
            }
          >
            <p className="font-medium">The document list couldn't be loaded.</p>
            <p className="mt-1">{describeError(documents.error)}</p>
          </Notice>
        )}

        {documents.data && total === 0 && (
          <p className="text-zinc-500">
            {canManage
              ? "No documents yet. Upload one above to get started."
              : "No documents are available to you yet."}
          </p>
        )}

        {documents.data && total > 0 && visible.length === 0 && (
          <p className="text-zinc-500">No document name contains “{filter.trim()}”.</p>
        )}

        <ul className="space-y-3">
          {visible.map((doc) => (
            <DocumentRow key={doc.doc_id} doc={doc} />
          ))}
        </ul>
      </section>
    </div>
  );
}

// ------------------------------------------------------------------ upload

function UploadCard() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [visibility, setVisibility] = useState<Visibility>("tenant");
  const [problem, setProblem] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<BatchIngestResponse | null>(null);

  const upload = useMutation({
    mutationFn: (files: File[]) => uploadDocuments(files, visibility),
    onSuccess: (result) => {
      setOutcome(result);
      void queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEY });
    },
    onError: (error) => setProblem(describeError(error)),
  });

  function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = ""; // allow choosing the same file again
    if (files.length === 0) return;

    setOutcome(null);
    const unsupported = files.filter((file) => !isSupported(file));
    if (unsupported.length > 0) {
      setProblem(
        `${unsupported.map((file) => file.name).join(", ")} can't be uploaded. ` +
          `Supported types: ${SUPPORTED_EXTENSIONS.join(", ")}.`
      );
      return;
    }
    setProblem(null);
    upload.mutate(files);
  }

  return (
    <Card className="p-8">
      <input
        ref={fileInputRef}
        type="file"
        hidden
        multiple
        accept={SUPPORTED_EXTENSIONS.join(",")}
        onChange={handleFiles}
      />

      <div className="flex flex-wrap items-end gap-5">
        <div className="w-64">
          <Select
            label="Who can search these documents"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as Visibility)}
            disabled={upload.isPending}
          >
            <option value="tenant">Everyone in my organisation</option>
            <option value="private">Only me</option>
          </Select>
        </div>

        <Button onClick={() => fileInputRef.current?.click()} disabled={upload.isPending}>
          <Upload size={17} aria-hidden />
          {upload.isPending ? "Uploading and indexing…" : "Upload documents"}
        </Button>
      </div>

      <p className="mt-5 text-sm text-zinc-500">
        Supported: {SUPPORTED_EXTENSIONS.join(" · ")}. You can select several files at once.
      </p>

      <div className="mt-5 space-y-4 empty:hidden" aria-live="polite">
        {upload.isPending && (
          <p role="status" className="text-[14px] text-zinc-400">
            Reading and indexing your files. Large documents can take a minute; keep this page open.
          </p>
        )}

        {problem && (
          <Notice>
            <p className="font-medium">Upload didn't start.</p>
            <p className="mt-1">{problem}</p>
          </Notice>
        )}

        {outcome && <UploadOutcome outcome={outcome} onDismiss={() => setOutcome(null)} />}
      </div>
    </Card>
  );
}

const ITEM_LABELS = {
  indexed: { text: "Indexed", tone: "green" },
  duplicate: { text: "Already indexed", tone: "blue" },
  failed: { text: "Failed", tone: "red" },
  rejected: { text: "Not accepted", tone: "red" },
} as const;

function UploadOutcome({
  outcome,
  onDismiss,
}: {
  outcome: BatchIngestResponse;
  onDismiss: () => void;
}) {
  const allGood = outcome.failed === 0;

  return (
    <Notice
      tone={allGood ? "success" : "error"}
      action={
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss upload result"
          className="rounded-lg p-1 opacity-70 hover:bg-white/10 hover:opacity-100"
        >
          <X size={16} aria-hidden />
        </button>
      }
    >
      <p className="font-medium">
        {allGood
          ? `${plural(outcome.processed, "file")} processed.`
          : `${outcome.processed} of ${plural(outcome.received, "file")} processed, ${outcome.failed} not indexed.`}
      </p>
      <ul className="mt-3 space-y-2">
        {outcome.results.map((item, index) => {
          const label = ITEM_LABELS[item.status];
          return (
            <li key={`${item.filename}-${index}`} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <Badge tone={label.tone}>{label.text}</Badge>
              <span className="break-all text-zinc-100">{item.filename}</span>
              {item.reason && <span className="text-zinc-300">— {item.reason}</span>}
              {item.status === "indexed" && (
                <span className="text-zinc-400">{plural(item.chunks, "passage")}</span>
              )}
            </li>
          );
        })}
      </ul>
    </Notice>
  );
}

// --------------------------------------------------------------- one document

const STATUS = {
  indexed: { text: "Indexed", tone: "green" },
  processing: { text: "Processing", tone: "amber" },
  failed: { text: "Failed", tone: "red" },
} as const;

function DocumentRow({ doc }: { doc: DocumentItem }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const manageable = canManageDocument(user, doc);

  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const refresh = () => queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEY });

  const remove = useMutation({
    mutationFn: () => deleteDocument(doc.doc_id),
    onSuccess: () => {
      toast.success(`“${doc.name}” was deleted.`);
      void refresh();
    },
    onError: (error) => {
      setConfirmingDelete(false);
      toast.error(`“${doc.name}” couldn't be deleted. ${describeError(error)}`);
      void refresh();
    },
  });

  const share = useMutation({
    mutationFn: (visibility: Visibility) => setDocumentVisibility(doc.doc_id, visibility),
    onSuccess: (updated) => {
      toast.success(
        updated.visibility === "private"
          ? `“${doc.name}” is now private.`
          : `“${doc.name}” is now shared with your organisation.`
      );
      void refresh();
    },
    onError: (error) => {
      toast.error(`Sharing for “${doc.name}” couldn't be changed. ${describeError(error)}`);
      void refresh();
    },
  });

  const busy = remove.isPending || share.isPending;
  const status = STATUS[doc.status];
  const isPrivate = doc.visibility === "private";

  return (
    <li className="rounded-2xl border border-white/5 bg-white/[0.02] px-6 py-5">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <FileText size={20} className="shrink-0 text-blue-400" aria-hidden />

          <div className="min-w-0">
            <p className="font-medium break-all">{doc.name}</p>
            <p className="mt-0.5 text-sm text-zinc-500">
              {formatBytes(doc.size)}
              {doc.status === "indexed" && ` · ${plural(doc.chunks, "passage")}`}
              {` · added ${formatDateTime(doc.created_at)}`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={isPrivate ? "zinc" : "blue"}>
            {isPrivate ? <Lock size={12} aria-hidden /> : <Users size={12} aria-hidden />}
            {isPrivate ? "Private" : "Shared"}
          </Badge>
          <Badge tone={status.tone}>{status.text}</Badge>

          {manageable && !confirmingDelete && (
            <>
              {doc.status === "indexed" && (
                <Button
                  variant="secondary"
                  small
                  disabled={busy}
                  onClick={() => share.mutate(isPrivate ? "tenant" : "private")}
                >
                  {isPrivate ? "Share with organisation" : "Make private"}
                </Button>
              )}
              <Button
                variant="secondary"
                small
                disabled={busy}
                onClick={() => setConfirmingDelete(true)}
                aria-label={`Delete ${doc.name}`}
              >
                <Trash2 size={14} aria-hidden />
                Delete
              </Button>
            </>
          )}

          {manageable && confirmingDelete && (
            <span className="flex items-center gap-2" role="group" aria-label={`Confirm deleting ${doc.name}`}>
              <span className="text-[13px] text-zinc-300">Delete permanently?</span>
              <Button variant="danger" small disabled={busy} onClick={() => remove.mutate()}>
                {remove.isPending ? "Deleting…" : "Yes, delete"}
              </Button>
              <Button variant="secondary" small disabled={busy} onClick={() => setConfirmingDelete(false)}>
                Cancel
              </Button>
            </span>
          )}
        </div>
      </div>

      {doc.status === "failed" && (
        <p className="mt-4 rounded-xl bg-red-500/[0.07] px-4 py-3 text-[13px] leading-6 text-red-200">
          This document isn't searchable. {doc.error ?? "Indexing failed."} Fix the file and upload it
          again, or delete this entry.
        </p>
      )}
    </li>
  );
}
