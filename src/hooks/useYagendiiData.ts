import { useCallback, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { PosibleVenta, PosibleVentaInput, Venta, VentaInput } from '../types/models'

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return 'Ocurrió un error inesperado.'
}

export function useYagendiiData(user: User | null) {
  const [ventas, setVentas] = useState<Venta[]>([])
  const [posibles, setPosibles] = useState<PosibleVenta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!user) {
      setVentas([])
      setPosibles([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const [ventasResult, posiblesResult] = await Promise.all([
      supabase.from('ventas').select('*').order('fecha_venta', { ascending: false }).order('created_at', { ascending: false }),
      supabase
        .from('posibles_ventas')
        .select('*')
        .order('fecha_agendada', { ascending: true })
        .order('hora_agendada', { ascending: true }),
    ])

    if (ventasResult.error || posiblesResult.error) {
      setError(errorMessage(ventasResult.error ?? posiblesResult.error))
    } else {
      setVentas((ventasResult.data ?? []) as Venta[])
      setPosibles((posiblesResult.data ?? []) as PosibleVenta[])
    }

    setLoading(false)
  }, [user])

  useEffect(() => {
    void refresh()
  }, [refresh])

  async function createVenta(input: VentaInput) {
    if (!user) throw new Error('No existe una sesión activa.')
    const { error: insertError } = await supabase.from('ventas').insert({ ...input, user_id: user.id })
    if (insertError) throw insertError
    await refresh()
  }

  async function updateVenta(id: string, input: VentaInput) {
    const { error: updateError } = await supabase.from('ventas').update(input).eq('id', id)
    if (updateError) throw updateError
    await refresh()
  }

  async function deleteVenta(id: string) {
    const { error: deleteError } = await supabase.from('ventas').delete().eq('id', id)
    if (deleteError) throw deleteError
    await refresh()
  }

  async function createPosible(input: PosibleVentaInput) {
    if (!user) throw new Error('No existe una sesión activa.')
    const { error: insertError } = await supabase.from('posibles_ventas').insert({ ...input, user_id: user.id })
    if (insertError) throw insertError
    await refresh()
  }

  async function updatePosible(id: string, input: PosibleVentaInput) {
    const { error: updateError } = await supabase.from('posibles_ventas').update(input).eq('id', id)
    if (updateError) throw updateError
    await refresh()
  }

  async function deletePosible(id: string) {
    const { error: deleteError } = await supabase.from('posibles_ventas').delete().eq('id', id)
    if (deleteError) throw deleteError
    await refresh()
  }

  async function convertToVenta(id: string, fechaVenta: string) {
    const { error: rpcError } = await supabase.rpc('convertir_posible_venta', {
      p_posible_id: id,
      p_fecha_venta: fechaVenta,
    })
    if (rpcError) throw rpcError
    await refresh()
  }

  return {
    ventas,
    posibles,
    loading,
    error,
    refresh,
    createVenta,
    updateVenta,
    deleteVenta,
    createPosible,
    updatePosible,
    deletePosible,
    convertToVenta,
  }
}
