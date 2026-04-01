import { spawn } from 'node:child_process'
import net from 'node:net'
import path from 'node:path'

function canListen(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const tester = net
      .createServer()
      .once('error', (error: NodeJS.ErrnoException) => {
        if (error.code === 'EADDRINUSE') return resolve(false)
        return resolve(false)
      })
      .once('listening', () => {
        tester.close(() => resolve(true))
      })
      .listen(port)
  })
}

async function findFreePort(startPort: number, maxTries: number): Promise<number> {
  for (let i = 0; i < maxTries; i++) {
    const port = startPort + i
    if (await canListen(port)) return port
  }
  throw new Error(`No free port found in range ${startPort}-${startPort + maxTries - 1}`)
}

const rawBasePort = process.env.BACKEND_PORT ?? process.env.PORT ?? '3001'
const basePort = Number.parseInt(rawBasePort, 10)
const resolvedBasePort = Number.isFinite(basePort) ? basePort : 3001
const backendPort = await findFreePort(resolvedBasePort, 50)
const proxyTarget = `http://localhost:${backendPort}`

console.log(`Backend: ${proxyTarget}`)

const localBin = path.join(process.cwd(), 'node_modules', '.bin')
const pathKey = 'PATH'
const PATH = `${localBin}${path.delimiter}${process.env[pathKey] ?? ''}`

const server = spawn(process.execPath, ['node_modules/nodemon/bin/nodemon.js'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    [pathKey]: PATH,
    PORT: String(backendPort),
  },
})

const client = spawn(process.execPath, ['node_modules/vite/bin/vite.js'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    [pathKey]: PATH,
    VITE_PROXY_TARGET: proxyTarget,
  },
})

let shuttingDown = false
const keepAlive = setInterval(() => {}, 1 << 30)

function shutdown(code: number): void {
  if (shuttingDown) return
  shuttingDown = true

  clearInterval(keepAlive)

  client.kill()
  server.kill()

  setTimeout(() => {
    process.exit(code)
  }, 250)
}

process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))

server.on('exit', (code) => {
  if (!shuttingDown) shutdown(code ?? 1)
})

server.on('error', () => {
  if (!shuttingDown) shutdown(1)
})

client.on('exit', (code) => {
  if (!shuttingDown) shutdown(code ?? 1)
})

client.on('error', () => {
  if (!shuttingDown) shutdown(1)
})
