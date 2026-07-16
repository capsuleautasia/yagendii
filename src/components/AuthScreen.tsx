import { useState, type FormEvent } from 'react'
import { ArrowRight, CheckCircle2, Eye, EyeOff, Sparkles } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Logo } from './Logo'

export function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)

    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail || password.length < 6) {
      setError('Usa un correo válido y una contraseña de al menos 6 caracteres.')
      setLoading(false)
      return
    }

    const result =
      mode === 'login'
        ? await supabase.auth.signInWithPassword({ email: normalizedEmail, password })
        : await supabase.auth.signUp({ email: normalizedEmail, password })

    if (result.error) {
      setError(result.error.message)
    } else if (mode === 'signup' && !result.data.session) {
      setMessage('Cuenta creada. Revisa tu correo para confirmar el acceso.')
    }

    setLoading(false)
  }

  return (
    <main className="auth-shell">
      <section className="auth-hero">
        <div className="auth-hero__glow auth-hero__glow--one" />
        <div className="auth-hero__glow auth-hero__glow--two" />
        <div className="auth-hero__content">
          <Logo />
          <span className="eyebrow"><Sparkles size={15} /> Agenda inteligente</span>
          <h1>Organiza oportunidades. Convierte ventas.</h1>
          <p>Una experiencia rápida y limpia para mantener cada cliente, contacto y fecha bajo control.</p>
          <div className="auth-benefits">
            <span><CheckCircle2 size={17} /> Mobile-first</span>
            <span><CheckCircle2 size={17} /> Datos protegidos</span>
            <span><CheckCircle2 size={17} /> Conversión en un toque</span>
          </div>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <div className="auth-card__heading">
            <p className="section-kicker">{mode === 'login' ? 'Bienvenido' : 'Nueva cuenta'}</p>
            <h2>{mode === 'login' ? 'Ingresa a Yagendii' : 'Crea tu espacio de trabajo'}</h2>
            <p>{mode === 'login' ? 'Continúa gestionando tus ventas.' : 'Tus registros quedarán separados y protegidos por usuario.'}</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <label className="field">
              <span>Correo electrónico</span>
              <input
                type="email"
                autoComplete="email"
                placeholder="nombre@correo.cl"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            <label className="field">
              <span>Contraseña</span>
              <div className="password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={6}
                />
                <button type="button" className="icon-button icon-button--inside" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </label>

            {error && <div className="inline-alert inline-alert--error">{error}</div>}
            {message && <div className="inline-alert inline-alert--success">{message}</div>}

            <button className="primary-button primary-button--wide" disabled={loading}>
              {loading ? 'Procesando…' : mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
              {!loading && <ArrowRight size={19} />}
            </button>
          </form>

          <button
            type="button"
            className="auth-switch"
            onClick={() => {
              setMode((value) => (value === 'login' ? 'signup' : 'login'))
              setError(null)
              setMessage(null)
            }}
          >
            {mode === 'login' ? '¿No tienes cuenta? Crear una' : 'Ya tengo cuenta. Ingresar'}
          </button>
        </div>
      </section>
    </main>
  )
}
