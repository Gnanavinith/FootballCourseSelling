export function errorHandler(err, req, res, next) {
  let status = err.status || 500
  let message = err.message || 'Something went wrong'

  if (err.code === 11000) {
    status = 409
    const key = Object.keys(err.keyPattern || {})[0]
    message = key === 'slug' ? 'This URL name is already used by another course.' : 'This value already exists.'
  } else if (err.name === 'ValidationError') {
    status = 400
    message = Object.values(err.errors).map((e) => e.message).join(' ')
  } else if (err.name === 'CastError') {
    status = 400
    message = 'Invalid id.'
  } else if (err.name === 'MulterError') {
    status = 400
    message = err.code === 'LIMIT_FILE_SIZE' ? 'The image is larger than 5 MB.' : err.message
  }

  if (status >= 500) console.error(err)
  res.status(status).json({
    success: false,
    message: status >= 500 && process.env.NODE_ENV === 'production' ? 'Something went wrong' : message,
  })
}
