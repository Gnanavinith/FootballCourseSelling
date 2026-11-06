import { useState } from 'react'

export default function Field({ id, label, labelRight, as: Component = 'input', type = 'text', error, hint, className = '', children, ...rest }) {
  const [show, setShow] = useState(false)
  const isPassword = Component === 'input' && type === 'password'
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <div className={className}>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label className="label !mb-0" htmlFor={id}>
          {label}
        </label>
        {labelRight}
      </div>

      <div className="relative">
        <Component
          id={id}
          {...(Component === 'input' ? { type: isPassword && show ? 'text' : type } : {})}
          className={`input ${isPassword ? 'pr-12' : ''}`}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          {...rest}
        >
          {Component !== 'input' ? children : null}
        </Component>
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-fg-3 hover:bg-surface-2 hover:text-fg transition-colors"
            aria-label={show ? 'Hide password' : 'Show password'}
            aria-pressed={show}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {show ? (
                <path d="M10.7 5.1A10.4 10.4 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3 3.9M6.6 6.6A17 17 0 0 0 2 12s3.6 7 10 7a9.7 9.7 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2M3 3l18 18" />
              ) : (
                <>
                  <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
                  <circle cx="12" cy="12" r="3" />
                </>
              )}
            </svg>
          </button>
        )}
      </div>

      {error ? (
        <p id={`${id}-error`} className="form-error">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="form-hint">{hint}</p>
      ) : null}
    </div>
  )
}
