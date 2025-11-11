// frontend/src/hooks/useAutoSave.ts
import { useEffect, useRef } from 'react'

interface UseAutoSaveOptions {
  hasChanges: boolean
  onSave: () => void | Promise<void>
  interval?: number
  enabled?: boolean
}

export function useAutoSave({
  hasChanges,
  onSave,
  interval = 8000,
  enabled = true,
}: UseAutoSaveOptions) {
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    if (!enabled || !hasChanges) return

    // Clear existing timeout
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
    }

    // Set new timeout
    timeoutRef.current = window.setTimeout(() => {
      onSave()
    }, interval)

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [hasChanges, onSave, interval, enabled])
}