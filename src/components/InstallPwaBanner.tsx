import { useEffect, useMemo, useState } from 'react'
import { Download, Share, X } from 'lucide-react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const DISMISSED_KEY = 'yagendii:pwa-banner-dismissed'

function isStandaloneMode() {
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean }
  return window.matchMedia('(display-mode: standalone)').matches || navigatorWithStandalone.standalone === true
}

export function InstallPwaBanner() {
  const [visible, setVisible] = useState(false)
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  const isIOS = useMemo(() => /iphone|ipad|ipod/i.test(navigator.userAgent), [])

  useEffect(() => {
    if (isStandaloneMode() || window.localStorage.getItem(DISMISSED_KEY) === 'true') return

    const showTimer = window.setTimeout(() => setVisible(true), 1400)

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEvent)
      setVisible(true)
    }

    const handleInstalled = () => {
      setVisible(false)
      setInstallPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleInstalled)

    return () => {
      window.clearTimeout(showTimer)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  function dismiss() {
    window.localStorage.setItem(DISMISSED_KEY, 'true')
    setVisible(false)
  }

  async function install() {
    if (!installPrompt) return
    await installPrompt.prompt()
    const choice = await installPrompt.userChoice
    if (choice.outcome === 'accepted') setVisible(false)
    setInstallPrompt(null)
  }

  if (!visible || isStandaloneMode()) return null

  return (
    <aside className="pwa-banner" aria-label="Instalar Yagendii">
      <button type="button" className="pwa-banner__close" onClick={dismiss} aria-label="Cerrar aviso">
        <X size={17} />
      </button>

      <span className="pwa-banner__icon" aria-hidden="true">
        <Download size={22} />
      </span>

      <div className="pwa-banner__content">
        <strong>Instala Yagendii</strong>
        {isIOS ? (
          <p>
            En Safari toca <Share size={15} aria-hidden="true" /> <b>Compartir</b> y después
            <b> Agregar a pantalla de inicio</b>.
          </p>
        ) : (
          <p>Úsala como una aplicación independiente desde tu teléfono o computador.</p>
        )}
      </div>

      {installPrompt && !isIOS && (
        <button type="button" className="pwa-banner__button" onClick={() => void install()}>
          Instalar
        </button>
      )}
    </aside>
  )
}
