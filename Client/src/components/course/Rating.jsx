import { useEffect, useState } from 'react'
import { courseService } from '../../services/course.service.js'

function readUser() {
  try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
}

export function RatingStars({ rating = 0, count = 0, size = 'text-lg', readonly = true }) {
  const stars = Array.from({ length: 5 }, (_, i) => i + 1)
  const avg = Math.round(rating * 10) / 10

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {stars.map((s) => (
          <span
            key={s}
            className={`text-gold-400 ${size} ${s <= avg ? 'text-gold-400' : 'text-stone-300'}`}
          >
            ★
          </span>
        ))}
      </div>
      {count > 0 && (
        <span className={`text-sm ${readonly ? 'text-stone-500' : 'text-ink-700'}`}>
          ({count}) {avg.toFixed(1)}
        </span>
      )}
    </div>
  )
}

export function CourseRating({ courseId }) {
  const user = readUser()
  const [ratings, setRatings] = useState([])
  const [stats, setStats] = useState({ avg: 0, count: 0 })
  const [myRating, setMyRating] = useState(null)
  const [hover, setHover] = useState(0)
  const [review, setReview] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const selected = myRating?.rating || hover || 0

  useEffect(() => {
    load()
  }, [])

  async function load() {
    try {
      const res = await courseService.ratings(courseId)
      const data = res.data || {}
      setRatings(data.ratings || [])
      setStats(data.stats || { avg: 0, count: 0 })
      if (user) {
        const mine = data.ratings?.find((r) => r.userId === user.id || r.user_id === user.id)
        if (mine) setMyRating(mine)
      }
    } catch {
      // silent
    }
  }

  async function submit() {
    if (!selected || !user) return
    setError('')
    setSuccess('')
    setSubmitting(true)
    try {
      await courseService.submitRating(courseId, { rating: selected, review })
      setSuccess('Thank you for your rating!')
      setMyRating({ rating: selected, review, userId: user.id })
      const res = await courseService.ratings(courseId)
      const data = res.data || {}
      setStats(data.stats || { avg: 0, count: 0 })
    } catch (e) {
      setError(e.message || 'Could not submit rating')
    } finally {
      setSubmitting(false)
    }
  }

  if (!user) return null

  const alreadyRated = !!myRating

  return (
    <section className="mt-12 border-t border-ink-200 pt-8">
      <h2 className="text-xl font-extrabold text-ink-950 mb-4">Course Rating</h2>

      <div className="flex items-center gap-4 mb-6">
        <RatingStars rating={stats.avg} count={stats.count} size="text-2xl" readonly />
        {!alreadyRated && (
          <div className="flex items-center gap-1 cursor-pointer" role="radiogroup" aria-label="Your rating">
            {[5, 4, 3, 2, 1].map((s) => (
              <span
                key={s}
                onClick={() => setMyRating({ rating: s, review })}
                onMouseEnter={() => setHover(s)}
                onMouseLeave={() => setHover(0)}
                className={`text-2xl transition-colors ${
                  s <= selected ? 'text-gold-400' : 'text-stone-300 hover:text-gold-300'
                }`}
                aria-label={`Rate ${s} star`}
              >
                ★
              </span>
            ))}
          </div>
        )}
      </div>

      {!alreadyRated && (
        <div className="space-y-3">
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Write a short review (optional)"
            rows={3}
            className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-ink-950 focus:ring-2 focus:ring-gold-400/60"
          />
          <button
            type="button"
            onClick={submit}
            disabled={submitting || !selected}
            className={`rounded-xl px-5 py-2.5 text-sm font-bold transition disabled:opacity-50 disabled:cursor-not-allowed ${
              submitting || !selected
                ? 'bg-stone-200 text-stone-500'
                : 'bg-gold-400 text-ink-950 hover:brightness-95'
            }`}
          >
            {submitting ? 'Submitting…' : 'Submit rating'}
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-pitch-700">{success}</p>}

      {ratings.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-bold text-ink-950 mb-3">Reviews</h3>
          <div className="space-y-4">
            {ratings.map((r) => (
              <div key={r._id} className="rounded-xl border border-ink-200 bg-white p-4">
                <div className="flex items-center gap-2 mb-2">
                  <RatingStars rating={r.rating} count={0} size="text-sm" readonly />
                  <span className="text-xs text-stone-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                {r.review && <p className="text-sm text-ink-700">{r.review}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
