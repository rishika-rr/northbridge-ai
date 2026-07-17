import { useEffect, useRef, useState } from "react";
import { Upload, FileText } from "lucide-react";

import {
  uploadDocument,
  getDocuments,
} from "../services/knowledge";

type DocumentItem = {
  name: string;
  size: number;
};

export default function KnowledgeBasePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [uploading, setUploading] = useState(false);

  async function loadDocuments() {
    try {
      const data = await getDocuments();
      setDocuments(data.documents);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  async function handleFile(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      setUploading(true);

      await uploadDocument(file);

      await loadDocuments();
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-10">

      <div>

        <h1 className="text-4xl font-semibold text-white">
          Knowledge Base
        </h1>

        <p className="mt-3 text-zinc-500">
          Upload documents to build your enterprise knowledge base.
        </p>

      </div>

      <div
        className="
        rounded-3xl

        border
        border-white/5

        bg-white/[0.025]

        p-10
        "
      >
        <input
          ref={fileInputRef}
          type="file"
          hidden
          accept=".pdf,.txt,.docx,.md"
          onChange={handleFile}
        />

        <button
          onClick={() =>
            fileInputRef.current?.click()
          }
          disabled={uploading}
          className="
          flex
          items-center

          gap-3

          rounded-xl

          bg-blue-600

          px-6
          py-3

          text-white

          transition

          hover:bg-blue-500
          "
        >
          <Upload size={18} />

          {uploading
            ? "Uploading..."
            : "Upload Document"}
        </button>

        <p
          className="
          mt-5

          text-sm

          text-zinc-500
          "
        >
          Supported:
          PDF • DOCX • TXT • MD
        </p>
      </div>

      <div>

        <h2
          className="
          mb-5

          text-xl

          font-semibold
          "
        >
          Indexed Documents
        </h2>

        <div className="space-y-4">

          {documents.length === 0 && (
            <p className="text-zinc-500">
              No documents indexed yet.
            </p>
          )}

          {documents.map((doc) => (

            <div
              key={doc.name}
              className="
              flex
              items-center
              justify-between

              rounded-2xl

              border
              border-white/5

              bg-white/[0.02]

              px-6
              py-5
              "
            >

              <div className="flex items-center gap-4">

                <FileText
                  size={20}
                  className="text-blue-400"
                />

                <div>

                  <p className="font-medium">
                    {doc.name}
                  </p>

                  <p
                    className="
                    text-sm

                    text-zinc-500
                    "
                  >
                    {(doc.size / 1024).toFixed(1)} KB
                  </p>

                </div>

              </div>

              <span
                className="
                rounded-full

                bg-emerald-500/10

                px-3
                py-1

                text-xs

                text-emerald-400
                "
              >
                Indexed
              </span>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}