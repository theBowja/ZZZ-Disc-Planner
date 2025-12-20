import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Resolves a path relative to the Vite base URL
 * Handles both development (/) and production (/ZZZ-Disc-Planner/) base paths
 */
export function resolveAssetPath(path: string): string {
  const baseUrl = import.meta.env.BASE_URL || '/'
  // Remove leading slash from path if present, then join with baseUrl
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return `${baseUrl}${cleanPath}`
}
