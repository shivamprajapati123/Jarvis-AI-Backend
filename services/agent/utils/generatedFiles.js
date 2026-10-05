import { randomUUID } from "node:crypto"

const FILE_TTL_MS = 10 * 60 * 1000
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024
const MAX_STORED_BYTES = 50 * 1024 * 1024
const files = new Map()

const pruneExpiredFiles = (now = Date.now()) => {
  for (const [id, file] of files) {
    if (file.expiresAt <= now) {
      files.delete(id)
    }
  }
}

const cleanupTimer = setInterval(pruneExpiredFiles, FILE_TTL_MS)
cleanupTimer.unref()

export const registerGeneratedFile = ({ buffer, filename, contentType, userId }) => {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new Error("Generated file must contain data")
  }
  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    throw new Error("Generated file exceeds the 15 MB download limit")
  }
  if (!userId) {
    throw new Error("Cannot register generated file without a user")
  }

  const now = Date.now()
  pruneExpiredFiles(now)
  const storedBytes = [...files.values()].reduce((total, file) => total + file.buffer.length, 0)
  if (storedBytes + buffer.length > MAX_STORED_BYTES) {
    throw new Error("Temporary generated-file storage is full; try again later")
  }

  const id = randomUUID()
  files.set(id, {
    buffer,
    filename,
    contentType,
    userId: String(userId),
    expiresAt: now + FILE_TTL_MS,
  })

  return id
}

export const getGeneratedFile = (id, userId) => {
  pruneExpiredFiles()
  const file = files.get(id)
  if (!file || file.userId !== String(userId)) {
    return null
  }
  return file
}
