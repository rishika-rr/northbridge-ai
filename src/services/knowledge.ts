const BASE_URL = import.meta.env.VITE_API_URL;
const API = `${BASE_URL}/v1`;

export async function uploadDocument(
  file: File
) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(
    `${API}/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Upload failed");
  }

  return response.json();
}

export async function getDocuments() {
  const response = await fetch(
    `${API}/documents`
  );

  if (!response.ok) {
    throw new Error("Failed");
  }

  return response.json();
}