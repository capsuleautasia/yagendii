import { useMemo, useState } from 'react'
import { CalendarClock, CircleDollarSign, LogOut, Plus, Sparkles, Target, TrendingUp, UserRound } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import { useAuth } from './hooks/useAuth'
import { useYagendiiData } from './hooks/useYagendiiData'
import type { EntityKind, FormMode, PosibleVenta, PosibleVentaInput, Section, Venta, VentaInput } from './types/models'
import { isToday, isUpcoming } from './utils/date'
import { AuthScreen } from './components/AuthScreen'
import { BottomNav } from './components/BottomNav'
import { ConfirmDialog } from './components/ConfirmDialog'
import { ConvertModal } from './components/ConvertModal'
import { EmptyState } from './components/EmptyState'
import { LoadingScreen } from './components/LoadingScreen'
import { RecordCard } from './components/RecordCard'
import { RecordFormModal } from './components/RecordFormModal'
import { SearchBar } from './components/SearchBar'
import { StatCard } from './components/StatCard'
import { Toast } from './components/Toast'
import { TopBar } from './components/TopBar'

const sectionCopy: Record<Section, { title: string; subtitle: string }> = {
  inicio: { title: 'Hola', subtitle: 'Este es el pulso de tu agenda comercial.' },
  ventas: { title: 'Ventas', subtitle: 'Clientes que ya concretaron su compra.' },
  posibles: { title: 'Posibles ventas', subtitle: 'Contactos agendados y oportunidades activas.' },
  cuenta: { title: 'Cuenta', subtitle: 'Preferencias y seguridad de tu espacio.' },
}

type FormState = {
  open: boolean
  kind: EntityKind
  mode: FormMode
  record: Venta | PosibleVenta | null
}

type DeleteState = {
  open: boolean
  kind: EntityKind
  record: Venta | PosibleVenta | null
}

function includesSearch(record: Venta | PosibleVenta, search: string) {
  const haystack = [record.nombre_cliente, record.numero_cliente, record.telefono, record.observaciones ?? ''].join(' ').toLowerCase()
  return haystack.includes(search.trim().toLowerCase())
}

function Dashboard({ user, ventas, posibles, onOpenVentas, onOpenPosibles, onAddPosible }: {
  user: User
  ventas: Venta[]
  posibles: PosibleVenta[]
  onOpenVentas: () => void
  onOpenPosibles: () => void
  onAddPosible: () => void
}) {
  const todayCount = posibles.filter((item) => isToday(item.fecha_agendada)).length
  const upcoming = posibles.filter((item) => isUpcoming(item.fecha_agendada)).slice(0, 3)
  const displayName = user.email?.split('@')[0] ?? 'usuario'

  return (
    <div className="page-stack">
      <section className="hero-card">
        <div>
          <span className="eyebrow"><Sparkles size={15} /> Agenda inteligente</span>
          <h2>Todo claro. Todo a tiempo.</h2>
          <p>Hola, <strong>{displayName}</strong>. Mantén el seguimiento comercial ordenado desde cualquier dispositivo.</p>
        </div>
        <button type="button" className="hero-card__action" onClick={onAddPosible}><Plus size={19} /> Agendar contacto</button>
      </section>

      <section className="stats-grid">
        <StatCard label="Ventas" value={ventas.length} detail="registros concretados" icon={CircleDollarSign} tone="green" />
        <StatCard label="Posibles ventas" value={posibles.length} detail="oportunidades activas" icon={Target} tone="blue" />
        <StatCard label="Agendadas hoy" value={todayCount} detail="seguimientos del día" icon={CalendarClock} tone="orange" />
      </section>

      <section className="content-card">
        <div className="section-heading">
          <div><p className="section-kicker">Próximos contactos</p><h2>Agenda cercana</h2></div>
          <button type="button" className="text-button" onClick={onOpenPosibles}>Ver todos</button>
        </div>
        {upcoming.length ? (
          <div className="mini-list">
            {upcoming.map((item) => (
              <button type="button" key={item.id} onClick={onOpenPosibles} className="mini-list__item">
                <span className="avatar avatar--posible">{item.nombre_cliente.slice(0, 1).toUpperCase()}</span>
                <span><strong>{item.nombre_cliente}</strong><small>{item.fecha_agendada} · {item.hora_agendada.slice(0, 5)}</small></span>
                <span className="mini-list__status">Pendiente</span>
              </button>
            ))}
          </div>
        ) : <EmptyState title="Sin contactos próximos" description="Agrega una posible venta para comenzar tu agenda." />}
      </section>

      <section className="quick-grid">
        <button type="button" className="quick-card" onClick={onOpenVentas}>
          <span><TrendingUp size={22} /></span><strong>Revisar ventas</strong><small>Consulta el historial concretado.</small>
        </button>
        <button type="button" className="quick-card" onClick={onOpenPosibles}>
          <span><Target size={22} /></span><strong>Gestionar oportunidades</strong><small>Edita, llama o convierte.</small>
        </button>
      </section>
    </div>
  )
}

function AccountView({ user }: { user: User }) {
  return (
    <div className="page-stack">
      <section className="account-card">
        <span className="account-card__avatar"><UserRound size={28} /></span>
        <div><p className="section-kicker">Sesión activa</p><h2>{user.email}</h2><p>Tu información está protegida mediante autenticación y políticas RLS de Supabase.</p></div>
      </section>

      <section className="content-card settings-list">
        <div className="settings-row"><span>Aplicación</span><strong>Yagendii 1.0</strong></div>
        <div className="settings-row"><span>Base de datos</span><strong>Supabase PostgreSQL</strong></div>
        <div className="settings-row"><span>Privacidad</span><strong>Datos separados por usuario</strong></div>
      </section>

      <button type="button" className="logout-button" onClick={() => void supabase.auth.signOut()}><LogOut size={19} /> Cerrar sesión</button>
    </div>
  )
}

export default function App() {
  const { user, loading: authLoading } = useAuth()
  const data = useYagendiiData(user)
  const [section, setSection] = useState<Section>('inicio')
  const [search, setSearch] = useState('')
  const [formState, setFormState] = useState<FormState>({ open: false, kind: 'venta', mode: 'create', record: null })
  const [deleteState, setDeleteState] = useState<DeleteState>({ open: false, kind: 'venta', record: null })
  const [convertRecord, setConvertRecord] = useState<PosibleVenta | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string | null; tone: 'success' | 'error' }>({ message: null, tone: 'success' })

  const filteredVentas = useMemo(() => data.ventas.filter((record) => includesSearch(record, search)), [data.ventas, search])
  const filteredPosibles = useMemo(() => data.posibles.filter((record) => includesSearch(record, search)), [data.posibles, search])

  if (authLoading) return <LoadingScreen />
  if (!user) return <AuthScreen />

  function showToast(message: string, tone: 'success' | 'error' = 'success') {
    setToast({ message, tone })
    window.setTimeout(() => setToast((current) => current.message === message ? { ...current, message: null } : current), 3200)
  }

  function openCreate(kind: EntityKind) {
    setFormState({ open: true, kind, mode: 'create', record: null })
  }

  function openEdit(kind: EntityKind, record: Venta | PosibleVenta) {
    setFormState({ open: true, kind, mode: 'edit', record })
  }

  async function handleFormSubmit(payload: VentaInput | PosibleVentaInput) {
    setActionLoading(true)
    try {
      if (formState.kind === 'venta') {
        if (formState.mode === 'create') await data.createVenta(payload as VentaInput)
        else await data.updateVenta(formState.record!.id, payload as VentaInput)
      } else {
        if (formState.mode === 'create') await data.createPosible(payload as PosibleVentaInput)
        else await data.updatePosible(formState.record!.id, payload as PosibleVentaInput)
      }
      setFormState((current) => ({ ...current, open: false }))
      showToast(formState.mode === 'create' ? 'Registro guardado correctamente.' : 'Cambios guardados correctamente.')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'No fue posible guardar el registro.', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleDelete() {
    if (!deleteState.record) return
    setActionLoading(true)
    try {
      if (deleteState.kind === 'venta') await data.deleteVenta(deleteState.record.id)
      else await data.deletePosible(deleteState.record.id)
      setDeleteState((current) => ({ ...current, open: false }))
      showToast('Registro eliminado.')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'No fue posible eliminar.', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleConvert(fecha: string) {
    if (!convertRecord) return
    setActionLoading(true)
    try {
      await data.convertToVenta(convertRecord.id, fecha)
      setConvertRecord(null)
      setSection('ventas')
      showToast('La oportunidad fue convertida en venta.')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'No fue posible convertir la venta.', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const copy = sectionCopy[section]

  return (
    <div className="app-shell">
      <TopBar title={copy.title} subtitle={copy.subtitle} onRefresh={() => void data.refresh()} refreshing={data.loading} />

      <main className="app-content">
        {data.error && <div className="inline-alert inline-alert--error">{data.error}</div>}

        {section === 'inicio' && (
          <Dashboard
            user={user}
            ventas={data.ventas}
            posibles={data.posibles}
            onOpenVentas={() => { setSearch(''); setSection('ventas') }}
            onOpenPosibles={() => { setSearch(''); setSection('posibles') }}
            onAddPosible={() => openCreate('posible')}
          />
        )}

        {section === 'ventas' && (
          <div className="page-stack">
            <div className="list-toolbar">
              <SearchBar value={search} onChange={setSearch} placeholder="Buscar nombre, número o teléfono" />
              <button type="button" className="primary-button primary-button--compact" onClick={() => openCreate('venta')}><Plus size={18} /> Nueva venta</button>
            </div>
            <div className="list-summary"><span>{filteredVentas.length} {filteredVentas.length === 1 ? 'venta' : 'ventas'}</span><small>Ordenadas desde la fecha más reciente</small></div>
            {data.loading ? <div className="card-skeletons"><div /><div /><div /></div> : filteredVentas.length ? (
              <section className="record-grid">
                {filteredVentas.map((record) => (
                  <RecordCard key={record.id} kind="venta" record={record} onEdit={() => openEdit('venta', record)} onDelete={() => setDeleteState({ open: true, kind: 'venta', record })} />
                ))}
              </section>
            ) : <EmptyState title="No hay ventas para mostrar" description={search ? 'Prueba con otra búsqueda.' : 'Registra tu primera venta para comenzar.'} />}
          </div>
        )}

        {section === 'posibles' && (
          <div className="page-stack">
            <div className="list-toolbar">
              <SearchBar value={search} onChange={setSearch} placeholder="Buscar oportunidad o cliente" />
              <button type="button" className="primary-button primary-button--compact" onClick={() => openCreate('posible')}><Plus size={18} /> Agendar</button>
            </div>
            <div className="list-summary"><span>{filteredPosibles.length} {filteredPosibles.length === 1 ? 'oportunidad' : 'oportunidades'}</span><small>Ordenadas por fecha y hora agendada</small></div>
            {data.loading ? <div className="card-skeletons"><div /><div /><div /></div> : filteredPosibles.length ? (
              <section className="record-grid">
                {filteredPosibles.map((record) => (
                  <RecordCard key={record.id} kind="posible" record={record} onEdit={() => openEdit('posible', record)} onDelete={() => setDeleteState({ open: true, kind: 'posible', record })} onConvert={() => setConvertRecord(record)} />
                ))}
              </section>
            ) : <EmptyState title="No hay posibles ventas" description={search ? 'Prueba con otra búsqueda.' : 'Agenda un contacto y comienza el seguimiento.'} />}
          </div>
        )}

        {section === 'cuenta' && <AccountView user={user} />}
      </main>

      <BottomNav section={section} onChange={(next) => { setSearch(''); setSection(next) }} />

      <button
        type="button"
        className="floating-action"
        aria-label={section === 'ventas' ? 'Agregar venta' : 'Agregar posible venta'}
        onClick={() => openCreate(section === 'ventas' ? 'venta' : 'posible')}
      >
        <Plus size={25} />
      </button>

      <RecordFormModal
        open={formState.open}
        kind={formState.kind}
        mode={formState.mode}
        record={formState.record}
        loading={actionLoading}
        onClose={() => setFormState((current) => ({ ...current, open: false }))}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={deleteState.open}
        title="Eliminar registro"
        description={`Esta acción eliminará a ${deleteState.record?.nombre_cliente ?? 'este cliente'} de forma permanente.`}
        confirmLabel="Eliminar"
        loading={actionLoading}
        onCancel={() => setDeleteState((current) => ({ ...current, open: false }))}
        onConfirm={() => void handleDelete()}
      />

      <ConvertModal record={convertRecord} loading={actionLoading} onClose={() => setConvertRecord(null)} onConfirm={handleConvert} />
      <Toast message={toast.message} tone={toast.tone} onClose={() => setToast((current) => ({ ...current, message: null }))} />
    </div>
  )
}
