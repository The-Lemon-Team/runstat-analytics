import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  DASHBOARD_NAV,
  VIEW_ENABLED_PAGES,
  dashboardPath,
  isViewPath,
  navFromPath,
} from '@/features/dashboard/lib/nav'

type PresentationModeContextValue = {
  isPresentationMode: boolean
  togglePresentationMode: () => void
  setPresentationMode: (value: boolean) => void
}

const PresentationModeContext =
  createContext<PresentationModeContextValue | null>(null)

function resolvePathForPresentationMode(
  pathname: string,
  view: boolean,
): string {
  const nav = navFromPath(pathname)
  const targetNav = VIEW_ENABLED_PAGES.has(nav) ? nav : DASHBOARD_NAV.content
  return dashboardPath(targetNav, { view })
}

export function PresentationModeProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()

  const isPresentationMode = isViewPath(location.pathname)

  const setPresentationMode = useCallback(
    (value: boolean) => {
      const nextPath = resolvePathForPresentationMode(
        location.pathname,
        value,
      )

      if (nextPath === location.pathname) return

      navigate(
        {
          pathname: nextPath,
          search: location.search,
        },
        { replace: true },
      )
    },
    [location.pathname, location.search, navigate],
  )

  const togglePresentationMode = useCallback(() => {
    setPresentationMode(!isPresentationMode)
  }, [isPresentationMode, setPresentationMode])

  const value = useMemo(
    () => ({
      isPresentationMode,
      togglePresentationMode,
      setPresentationMode,
    }),
    [isPresentationMode, togglePresentationMode, setPresentationMode],
  )

  return (
    <PresentationModeContext.Provider value={value}>
      {children}
    </PresentationModeContext.Provider>
  )
}

export function usePresentationMode() {
  const context = useContext(PresentationModeContext)
  if (!context) {
    throw new Error(
      'usePresentationMode must be used within PresentationModeProvider',
    )
  }
  return context
}
