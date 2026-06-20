import { useCallback, useState } from 'react'

export const SIDEBAR_WIDTH_STORAGE_KEY = 'dashboard-sidebar-width'
export const SIDEBAR_DEFAULT_WIDTH = 288
export const SIDEBAR_MIN_WIDTH = 240
export const SIDEBAR_MAX_WIDTH = 440

function clampWidth(width: number): number {
  return Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, width))
}

export function readStoredSidebarWidth(): number {
  try {
    const stored = localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY)
    if (!stored) return SIDEBAR_DEFAULT_WIDTH

    const parsed = Number.parseInt(stored, 10)
    if (!Number.isFinite(parsed)) return SIDEBAR_DEFAULT_WIDTH

    return clampWidth(parsed)
  } catch {
    return SIDEBAR_DEFAULT_WIDTH
  }
}

function persistSidebarWidth(width: number) {
  try {
    localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, String(width))
  } catch {
    /* ignore */
  }
}

export function useSidebarWidth() {
  const [width, setWidth] = useState(readStoredSidebarWidth)
  const [isResizing, setIsResizing] = useState(false)

  const onResizePointerDown = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      event.preventDefault()

      const startX = event.clientX
      const startWidth = width
      const target = event.currentTarget

      target.setPointerCapture(event.pointerId)
      setIsResizing(true)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'

      function handlePointerMove(moveEvent: PointerEvent) {
        const nextWidth = clampWidth(startWidth + (moveEvent.clientX - startX))
        setWidth(nextWidth)
      }

      function finishResize(endEvent: PointerEvent) {
        const finalWidth = clampWidth(
          startWidth + (endEvent.clientX - startX),
        )

        setWidth(finalWidth)
        persistSidebarWidth(finalWidth)
        setIsResizing(false)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''

        target.releasePointerCapture(endEvent.pointerId)
        target.removeEventListener('pointermove', handlePointerMove)
        target.removeEventListener('pointerup', finishResize)
        target.removeEventListener('pointercancel', finishResize)
      }

      target.addEventListener('pointermove', handlePointerMove)
      target.addEventListener('pointerup', finishResize)
      target.addEventListener('pointercancel', finishResize)
    },
    [width],
  )

  return { width, isResizing, onResizePointerDown }
}
