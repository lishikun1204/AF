/**
 * local server entry file, for local development
 */
import app from './app.js'

/**
 * start server with port
 */
const rawPort = process.env.PORT
const PORT = rawPort ? Number.parseInt(rawPort, 10) : 3001

const server = app.listen(PORT, () => {
  console.log(`Server ready on port ${PORT}`)
})

server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Set PORT to a free port and retry.`)
    process.exit(1)
  }
  console.error(error)
  process.exit(1)
})

/**
 * close server
 */
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('SIGINT signal received')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

export default app
