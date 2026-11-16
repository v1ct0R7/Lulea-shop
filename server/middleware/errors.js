export function notFound(_req, res) {
  res.status(404).json({ message: 'Burimi nuk u gjet.' });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  const status = err.status || (err.code === 'LIMIT_FILE_SIZE' ? 400 : 500);
  if (status >= 500) console.error(err);
  res.status(status).json({
    message: err.code === 'LIMIT_FILE_SIZE' ? 'Imazhi është më i madh se 5MB.' : err.message || 'Gabim në server.',
  });
}
