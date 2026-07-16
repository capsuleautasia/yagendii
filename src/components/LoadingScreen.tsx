import { Logo } from './Logo'

export function LoadingScreen() {
  return (
    <main className="loading-screen">
      <Logo />
      <div className="spinner" aria-label="Cargando" />
    </main>
  )
}
