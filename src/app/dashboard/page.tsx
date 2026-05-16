'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [prenotazioni, setPrenotazioni] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [giornoSelezionato, setGiornoSelezionato] = useState(new Date().toISOString().split('T')[0])
  const router = useRouter()

  useEffect(() => {
    fetchPrenotazioni()
  }, [giornoSelezionato])

  const fetchPrenotazioni = async () => {
    const { data } = await supabase
      .from('prenotazioni')
      .select('*')
      .eq('data', giornoSelezionato)
      .order('ora', { ascending: true })
    setPrenotazioni(data || [])
    setLoading(false)
  }

  const aggiornaStato = async (id: string, stato: string) => {
    await supabase.from('prenotazioni').update({ stato }).eq('id', id)
    fetchPrenotazioni()
  }

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const pranzo = prenotazioni.filter(p => {
    const ora = p.ora?.substring(0, 5)
    return ora >= '10:00' && ora < '17:00'
  })

  const cena = prenotazioni.filter(p => {
    const ora = p.ora?.substring(0, 5)
    return ora >= '17:00' || ora < '10:00'
  })

  const CardPrenotazione = ({ p }: { p: any }) => (
    <div className={`rounded-xl p-4 border flex justify-between items-center shadow-sm ${
      p.stato === 'confermata' ? 'bg-green-50 border-green-200' :
      p.stato === 'rifiutata' ? 'bg-red-50 border-red-200' :
      'bg-white border-gray-200'
    }`}>
      <div>
        <p className="font-semibold text-gray-800">{p.nome_cliente}</p>
        <p className="text-gray-500 text-sm">{p.ora?.substring(0,5)} · {p.persone} persone · {p.telefono_cliente}</p>
        <div className="flex gap-2 mt-1">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            p.fonte === 'whatsapp' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
          }`}>{p.fonte === 'whatsapp' ? '💬 WhatsApp' : '✏️ Manuale'}</span>
          {p.note && <span className="text-gray-400 text-xs">📝 {p.note}</span>}
        </div>
      </div>
      <div className="flex flex-col gap-2 items-end">
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          p.stato === 'confermata' ? 'bg-green-100 text-green-700' :
          p.stato === 'rifiutata' ? 'bg-red-100 text-red-700' :
          'bg-yellow-100 text-yellow-700'
        }`}>{p.stato.replace('_', ' ')}</span>
        <div className="flex gap-1">
          <button onClick={() => aggiornaStato(p.id, 'confermata')} className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded-lg font-medium">✓</button>
          <button onClick={() => aggiornaStato(p.id, 'rifiutata')} className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-lg font-medium">✗</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🍽</span>
          <h1 className="text-xl font-bold text-gray-800">Dashboard Prenotazioni</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={() => router.push('/nuova')} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-xl font-medium">+ Nuova</button>
          <button onClick={() => router.push('/profilo')} className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-4 py-2 rounded-xl font-medium border border-gray-200">🏪 Profilo</button>
          <button onClick={logout} className="text-gray-500 hover:text-gray-800 text-sm px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100">Esci</button>
        </div>
      </div>

      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6 bg-white rounded-xl p-3 border border-gray-200 shadow-sm w-fit">
          <button onClick={() => {
            const d = new Date(giornoSelezionato)
            d.setDate(d.getDate() - 1)
            setGiornoSelezionato(d.toISOString().split('T')[0])
          }} className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-gray-600 font-bold">←</button>
          <input type="date" value={giornoSelezionato}
            onChange={(e) => setGiornoSelezionato(e.target.value)}
            className="bg-transparent text-gray-800 font-semibold px-2 py-1 outline-none" />
          <button onClick={() => {
            const d = new Date(giornoSelezionato)
            d.setDate(d.getDate() + 1)
            setGiornoSelezionato(d.toISOString().split('T')[0])
          }} className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-gray-600 font-bold">→</button>
          <button onClick={() => setGiornoSelezionato(new Date().toISOString().split('T')[0])}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded-lg font-medium">Oggi</button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <p className="text-gray-500 text-sm font-medium">Totale oggi</p>
            <p className="text-4xl font-bold text-gray-800 mt-1">{prenotazioni.length}</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-5 border border-orange-200 shadow-sm">
            <p className="text-orange-600 text-sm font-medium">☀️ Pranzo</p>
            <p className="text-4xl font-bold text-orange-500 mt-1">{pranzo.length}</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-5 border border-blue-200 shadow-sm">
            <p className="text-blue-600 text-sm font-medium">🌙 Cena</p>
            <p className="text-4xl font-bold text-blue-500 mt-1">{cena.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-orange-100 bg-orange-50 flex items-center gap-2">
              <span className="text-xl">☀️</span>
              <h2 className="font-bold text-orange-700">Pranzo</h2>
              <span className="ml-auto bg-orange-100 text-orange-600 text-xs px-3 py-1 rounded-full font-semibold">{pranzo.length}</span>
            </div>
            <div className="p-4 space-y-3">
              {loading ? <p className="text-gray-400 text-center py-4">Caricamento...</p> :
               pranzo.length === 0 ? <p className="text-gray-400 text-center py-8 text-sm">Nessuna prenotazione</p> :
               pranzo.map(p => <CardPrenotazione key={p.id} p={p} />)}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-blue-100 bg-blue-50 flex items-center gap-2">
              <span className="text-xl">🌙</span>
              <h2 className="font-bold text-blue-700">Cena</h2>
              <span className="ml-auto bg-blue-100 text-blue-600 text-xs px-3 py-1 rounded-full font-semibold">{cena.length}</span>
            </div>
            <div className="p-4 space-y-3">
              {loading ? <p className="text-gray-400 text-center py-4">Caricamento...</p> :
               cena.length === 0 ? <p className="text-gray-400 text-center py-8 text-sm">Nessuna prenotazione</p> :
               cena.map(p => <CardPrenotazione key={p.id} p={p} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}