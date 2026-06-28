import { Presentation, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePresentationMode } from './PresentationModeContext'

export function PresentationModeToggle() {
  const { isPresentationMode, togglePresentationMode } = usePresentationMode()

  return (
    <Button
      size="sm"
      variant={isPresentationMode ? 'secondary' : 'outline'}
      onClick={togglePresentationMode}
      title={
        isPresentationMode
          ? 'Выйти из режима просмотра'
          : 'Режим просмотра для встреч'
      }
    >
      {isPresentationMode ? (
        <X className="size-4" />
      ) : (
        <Presentation className="size-4" />
      )}
      <span className="hidden md:inline">
        {isPresentationMode ? 'Выйти' : 'Просмотр'}
      </span>
    </Button>
  )
}
