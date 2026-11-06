const rawApiUrl = import.meta.env.VITE_API_URL || ''
const BASE = rawApiUrl
  ? (rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl.replace(/\/$/, '')}/api`)
  : '/api'

/*
  api('/courses')                                   GET
  api('/courses', { method: 'POST', body: {...} })  JSON body (object is stringified for you)
  api('/courses/1/thumbnail', { method: 'POST', body: formData })   file upload

  - FormData must NOT get a "Content-Type: application/json" header; the browser sets
    "multipart/form-data; boundary=..." itself.
  - "...options" is applied BEFORE headers so options.headers cannot wipe auth/content-type.
  - Object bodies are JSON.stringify-ed automatically; non-ok responses include the server message.
*/
export async function api(path, { body, headers, ...options } = {}) {
  const token = localStorage.getItem('token')
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData
  const hasJson = body !== undefined && !isForm

  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      ...(hasJson ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    body: hasJson && typeof body !== 'string' ? JSON.stringify(body) : body,
  })

  let data
  const text = await res.text().catch(() => '')
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    data = { message: `Server returned invalid JSON (${res.status}): ${text.slice(0, 200)}` }
  }

  if (!res.ok) {
    const err = new Error(data.message || `Request failed (${res.status})`)
    err.status = res.status
    throw err
  }
  return data
}
