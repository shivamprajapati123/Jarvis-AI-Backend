import { getGeneratedFile } from "../utils/generatedFiles.js"

export const downloadGeneratedFile = (req, res) => {
  const userId = req.headers["x-user-id"]
  if (typeof userId !== "string") {
    return res.status(401).json({ message: "Authentication required" })
  }

  const file = getGeneratedFile(req.params.fileId, userId)
  if (!file) {
    return res.status(404).json({ message: "Generated file is missing or has expired" })
  }

  const safeFilename = file.filename.replace(/["\\]/g, "_")
  res.setHeader("Content-Type", file.contentType)
  res.setHeader("Content-Length", file.buffer.length)
  res.setHeader("Content-Disposition", `attachment; filename="${safeFilename}"`)
  res.setHeader("Cache-Control", "private, no-store")
  return res.status(200).send(file.buffer)
}
