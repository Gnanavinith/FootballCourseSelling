import { useEffect } from 'react'

/* Sets the browser tab title and, if asked, tells search engines not to index the page
   (login, register and other private pages should not appear on Google). */
export function usePageMeta({ title, noindex = false }) {
  useEffect(() => {
    const previousTitle = document.title
    if (title) document.title = title

    let tag
    if (noindex) {
      tag = document.createElement('meta')
      tag.name = 'robots'
      tag.content = 'noindex, nofollow'
      document.head.appendChild(tag)
    }

    return () => {
      document.title = previousTitle
      if (tag) tag.remove()
    }
  }, [title, noindex])
}
