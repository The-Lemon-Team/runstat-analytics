import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import type { AuthTokensDto, UserDto } from '@spt/shared'
import { setCredentials } from '@/features/auth/authSlice'
import { Button } from '@/components/ui/button'

function parseHashTokens(): AuthTokensDto | null {
  const hash = window.location.hash.replace(/^#/, '')
  if (!hash) return null

  const params = new URLSearchParams(hash)
  const accessToken = params.get('access_token')
  const refreshToken = params.get('refresh_token')
  const userRaw = params.get('user')

  if (!accessToken || !refreshToken || !userRaw) return null

  try {
    const user = JSON.parse(userRaw) as UserDto
    return { accessToken, refreshToken, user }
  } catch {
    return null
  }
}

export function VkAuthCallbackPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const query = new URLSearchParams(window.location.search)
    const queryError = query.get('message')
    if (query.get('oauth') === 'error') {
      setError(queryError ?? 'Не удалось войти через VK')
      return
    }

    const tokens = parseHashTokens()
    if (!tokens) {
      setError('Не удалось получить данные авторизации')
      return
    }

    dispatch(setCredentials(tokens))
    navigate('/', { replace: true })
  }, [dispatch, navigate])

  if (error) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="max-w-md text-sm text-destructive">{error}</p>
        <Button variant="outline" onClick={() => navigate('/login')}>
          Вернуться ко входу
        </Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh items-center justify-center text-sm text-muted-foreground">
      Завершаем вход через VK…
    </div>
  )
}
