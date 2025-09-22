/**
 * Get the correct asset path for both development and GitHub Pages deployment
 * @param path - The asset path starting with /
 * @returns The correct path with basePath prefix when needed
 */
export function getAssetPath(path: string): string {
  // In GitHub Actions (production), add basePath prefix
  if (process.env.GITHUB_ACTIONS || process.env.NODE_ENV === 'production') {
    return `/nexa-pdf${path}`
  }
  // In development, use path as-is
  return path
}

/**
 * Get the logo path for the current environment
 */
export function getLogoPath(): string {
  return getAssetPath('/logo.svg')
}