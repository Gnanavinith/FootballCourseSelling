export async function uploadToCloudinary(file, ticket, onProgress) {
  const chunkSize = 20 * 1024 * 1024;
  const total = file.size;
  const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  let offset = 0;
  let result = {};
  while (offset < total) {
    const end = Math.min(offset + chunkSize, total);
    const chunk = file.slice(offset, end);
    const form = new FormData();
    form.append("file", chunk);
    form.append("api_key", ticket.apiKey);
    form.append("timestamp", String(ticket.params.timestamp));
    form.append("signature", ticket.signature);
    form.append("public_id", ticket.params.public_id);
    if (ticket.params.type) form.append("type", ticket.params.type);
    const res = await fetch(ticket.uploadUrl, {
      method: "POST",
      headers: {
        "Content-Range": `bytes ${offset}-${end - 1}/${total}`,
        "X-Unique-Upload-Id": uniqueId,
      },
      body: form,
    });
    if (!res.ok) throw new Error(await res.text());
    result = await res.json();
    offset = end;
    if (onProgress) onProgress(Math.round((offset / total) * 100));
  }
  return result;
}
