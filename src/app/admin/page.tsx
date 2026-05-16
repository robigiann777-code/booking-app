'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Admin() {
  const [ristoranti, setRistoranti] = useState<any[]>([])
  const [prenotazioni, setPrenotazioni] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchDati()
  }, [])

  const fetchDati = async () => {
    const { data: r } = await supabase.from('ristoranti').select('*')
    const { data: p } = await supabase.from('prenotazioni').select('*')
    setRistoranti(r || [])
    setPrenotazioni(p || [])
    setLoading(false)
  }

  const prenotazioniRistorante = (ristoranteId: string) => {
    return prenotazioni.filter(p => p.ristorante_id === ristoranteId).length
  }

  const oggi = new Date().toISOString().split('T')[0]

  const prenotazioniOggi = prenotazioni.filter(p => p.data === oggi).length
  const totaleConfermate = prenotazioni.filter(p => p.stato === 'confermata').length
  const totaleInAttesa = prenotazioni.filter(p => p.stato === 'in_attesa').length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xl">👑</span>
            <h1 className="text-base font-bold text-gray-800">Admin Panel</h1>
          </div>
          <button onClick={() => router.push('/dashboard')} className="text-gray-500 text-xs px-3 py-2 rounded-xl border border-gray-200">← Dashboard</button>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto">

        {/* Stats globali */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <p className="text-gray-500 text-xs">Ristoranti attivi</p>
            <p className="text-3xl font-bold text-gray-800">{ristoranti.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <p className="text-gray-500 text-xs">Prenotazioni oggi</p>
            <p className="text-3xl font-bold text-blue-600">{prenotazioniOggi}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4 border border-green-200 shadow-sm">
            <p className="text-green-600 text-xs">✅ Confermate totali</p>
            <p className="text-3xl font-bold text-green-600">{totaleConfermate}</p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200 shadow-sm">
            <p className="text-yellow-600 text-xs">⏳ In attesa</p>
            <p className="text-3xl font-bold text-yellow-600">{totaleInAttesa}</p>
          </div>
        </div>

        {/* Ricavi stimati */}
        <div className="bg-blue-600 rounded-2xl p-4 mb-4 text-white">
          <p className="text-blue-200 text-xs mb-1">💰 Ricavi mensili stimati</p>
          <p className="text-4xl font-bold">{ristoranti.length * 200}€</p>
          <p className="text-blue-200 text-xs mt-1">{ristoranti.length} ristoranti × 200€/mese</p>
        </div>

        {/* Lista ristoranti */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 text-sm">I tuoi clienti ({ristoranti.length})</h2>
          </div>

          {loading ? (
            <p className="text-gray-400 text-center py-8 text-sm">Caricamento...</p>
          ) : ristoranti.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-2">🍽</p>
              <p className="text-gray-500 text-sm font-medium">Nessun ristorante ancora</p>
              <p className="text-gray-400 text-xs mt-1">Vai a vendere il tuo primo cliente!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {ristoranti.map(r => (
                <div key={r.id} className="px-4 py-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{r.nome}</p>
                    <p className="text-gray-500 text-xs">{r.indirizzo}</p>
                    <p className="text-gray-400 text-xs">{r.telefono}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                        {prenotazioniRistorante(r.id)} prenotazioni
                      </span>
                      <span className="bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded-full">
                        200€/mese
                      </span>
                    </div>
                  </div>
                  <button onClick={() => router.push('/dashboard')}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-3 py-2 rounded-xl border border-gray-200 font-medium">
                    Gestisci →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}