import { api } from '../lib/api.js'

/* Public website. The old get() called '/api/courses/...' and the helper adds '/api' too,
   so the URL became '/api/api/courses/...' (404). It also asked for an id, not a slug. */
export const courseService = {
  list: () => api('/courses'),
  get: (slug) => api(`/courses/slug/${encodeURIComponent(slug)}`),

  /* Ratings */
  ratings: (courseId) => api(`/ratings/${courseId}/ratings`),
  submitRating: (courseId, { rating, review }) =>
    api(`/ratings/${courseId}/ratings`, { method: 'POST', body: JSON.stringify({ rating, review }) }),
}