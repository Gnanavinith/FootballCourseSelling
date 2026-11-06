const BUNNY_API = 'https://video.bunnycdn.com/library'

export async function createBunnyVideo(title) {
  const libraryId = process.env.BUNNY_LIBRARY_ID
  const apiKey = process.env.BUNNY_API_KEY
  if (!libraryId || !apiKey) return { guid: `mock-${Date.now()}`, uploadUrl: '' }
  const res = await fetch(`${BUNNY_API}/${libraryId}/videos`, {
    method: 'POST',
    headers: { AccessKey: apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  })
  if (!res.ok) throw new Error('Bunny create video failed')
  return res.json()
}

export async function deleteBunnyVideo(videoId) {
  const libraryId = process.env.BUNNY_LIBRARY_ID
  const apiKey = process.env.BUNNY_API_KEY
  if (!libraryId || !apiKey || !videoId) return
  await fetch(`${BUNNY_API}/${libraryId}/videos/${videoId}`, {
    method: 'DELETE',
    headers: { AccessKey: apiKey },
  })
}

export function signedBunnyPlaybackUrl(bunnyVideoId, expiresAt) {
  const libraryId = process.env.BUNNY_LIBRARY_ID
  const tokenKey = process.env.BUNNY_TOKEN_KEY
  const hostname = process.env.BUNNY_CDN_HOSTNAME
  const expiry = Math.floor(expiresAt.getTime() / 1000)
  // Simple token format; adjust to Bunny docs if needed.
  const token = tokenKey ? `${tokenKey}-${bunnyVideoId}-${expiry}` : 'mock-token'
  return `https://${hostname}/${libraryId}/${bunnyVideoId}/playlist.m3u8?token=${token}&expires=${expiry}`
}
