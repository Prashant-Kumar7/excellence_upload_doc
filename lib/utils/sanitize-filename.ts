/**
 * Sanitizes a filename to be safe for use in storage paths
 * Removes or replaces special characters, emojis, and invalid path characters
 */
export function sanitizeFilename(filename: string): string {
  // Extract extension
  const lastDot = filename.lastIndexOf('.')
  const name = lastDot > 0 ? filename.substring(0, lastDot) : filename
  const extension = lastDot > 0 ? filename.substring(lastDot) : ''

  // Remove emojis and special characters
  // Keep only alphanumeric, spaces, hyphens, underscores, and dots
  const sanitized = name
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Remove emojis
    .replace(/[^\w\s.-]/g, '-') // Replace special chars with hyphen
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .toLowerCase() // Convert to lowercase for consistency

  // Ensure we have a valid name (at least 1 character)
  const finalName = sanitized || 'file'

  return `${finalName}${extension}`
}

/**
 * Sanitizes a file path for storage
 * Preserves the directory structure but sanitizes each segment
 */
export function sanitizeStoragePath(path: string): string {
  const parts = path.split('/')
  return parts.map((part, index) => {
    // Don't sanitize the first part if it's a UUID (user ID)
    if (index === 0 && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(part)) {
      return part
    }
    return sanitizeFilename(part)
  }).join('/')
}

