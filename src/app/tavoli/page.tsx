'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Tavoli() {
  const [tavoli, setTavoli] = useState<any[]>([])
  const [prenotazioniOggi, setPrenotazioniOggi] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [nome, setNome] = useState('')
  const [posti, setPosti] = useState('4')
  const [aggiunta, setAggiunta] = useState(false)
  const router = useRouter()

  const oggi = new Date().toISOString().split('T')[0]

  useEffect(() => {
    fetchTavoli()
    fetchPrenotazioniOggi()
  }, [])

  const fetchTavoli = async () => {
    const { data } = await supabase.from('tavoli').select('*').order('created_at')
    setTavoli(data || [])
    setLoading(false)
  }

  const fetchPrenotazioniOggi = async () => {
    const { data } = await supabase
      .from('prenotazioni')
      .select('*')
      .eq('data', oggi)
      .eq('stato', 'confermata')
    setPrenotazioniOggi(data || [])
  }

  const aggiungiTavolo = async () => {
    if (!nome.trim()) return
    const { data: ristorante } = await supabase.from('ristoranti').select('id').limit(1).single()
    await supabase.from('tavoli').insert([{
      nome,
      posti: parseInt(posti),
      ristorante_id: ristorante?.id
    }])
    setNome('')
    setPosti('4')
    setAggiunta(true)
    setTimeout(() => setAggiunta(false), 2000)
    fetchTavoli()
  }

  const eliminaTavolo = async (id: string) => {
    await supabase.from('tavoli').delete().eq('id', id)
    fetchTavoli()
  }

  const tavoloOccupato = (tavoloId: string) => {
    return prenotazioniOggi.some(p => p.tavolo_id === tavoloId)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xl">🪑</span>
            <h1 className="text-base font-bold text-gray-800">Gestione Tavoli</h1>
          </div>
          <button onClick={() => router.push('/dashboard')} className="text-gray-500 text-xs px-3 py-2 rounded-xl border border-gray-200">← Dashboard</button>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto">

        {/* Aggiungi tavolo */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-4">
          <h2 className="font-bold text-gray-800 mb-3">➕ Aggiungi tavolo</h2>
          <div className="flex gap-2">
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)}
              placeholder="Es. Tavolo 1, Terrazza..."
              className="flex-1 bg-gray-50 text-gray-800 rounded-xl px-3 py-2 border border-gray-200 focus:border-blue-500 focus:outline-none text-sm" />
            <select value={posti} onChange={(e) => setPosti(e.target.value)}
              className="bg-gray-50 text-gray-800 rounded-xl px-3 py-2 border border-gray-200 focus:border-blue-500 focus:outline-none text-sm">
              {[1,2,3,4,5,6,7,8,10,12].map(n => (
                <option key={n} value={n}>{n} posti</option>
              ))}
            </select>
            <button onClick={aggiungiTavolo}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium">
              {aggiunta ? '✓' : 'Aggiungi'}
            </button>
          </div>
        </div>

        {/* Lista tavoli */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-800 text-sm">I tuoi tavoli ({tavoli.length})</h2>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded-full inline-block"></span> Libero</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-400 rounded-full inline-block"></span> Occupato</span>
            </div>
          </div>

          {loading ? (
            <p className="text-gray-400 text-center py-8 text-sm">Caricamento...</p>
          ) : tavoli.length === 0 ? (
            <p className="text-gray-400 text-center py-8 text-sm">Nessun tavolo ancora — aggiungine uno!</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 p-4">
              {tavoli.map(t => {
                const occupato = tavoloOccupato(t.id)
                return (
                  <div key={t.id} className={`rounded-xl p-4 border flex flex-col gap-2 ${
                    occupato ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{t.nome}</p>
                        <p className="text-gray-500 text-xs">{t.posti} posti</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        occupato ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                      }`}>{occupato ? 'Occupato' : 'Libero'}</span>
                    </div>
                    <button onClick={() => eliminaTavolo(t.id)}
                      className="text-xs text-red-400 hover:text-red-600 text-left">
                      🗑 Elimina
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}