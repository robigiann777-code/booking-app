'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  'https://peevprlodvjbrtvzlygw.supabase.co',
  'sb_publishable_jJJLJdp9dvr7DZ0WIVhhmA_Tn-j4cr1'
)

export default function Tavoli() {
  const [tavoli, setTavoli] = useState<any[]>([])
  const [nome, setNome] = useState('')
  const [posti, setPosti] = useState('4')
  const router = useRouter()

  useEffect(() => {
    fetchTavoli()
  }, [])

  const fetchTavoli = async () => {
    const { data } = await supabase.from('tavoli').select('*').order('created_at', { ascending: true })
    setTavoli(data || [])
  }

  const aggiungi = async () => {
    if (!nome) return
    await supabase.from('tavoli').insert([{ nome, posti: parseInt(posti) }])
    setNome('')
    setPosti('4')
    fetchTavoli()
  }

  const elimina = async (id: string) => {
    await supabase.from('tavoli').delete().eq('id', id)
    fetchTavoli()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🪑</span>
          <h1 className="text-xl font-bold text-gray-800">Gestione Tavoli</h1>
        </div>
        <button onClick={() => router.push('/dashboard')} className="text-gray-500 hover:text-gray-800 text-sm px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100">← Dashboard</button>
      </div>

      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-bold text-gray-800 text-lg mb-4">➕ Aggiungi tavolo</h2>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-gray-700 text-sm font-medium mb-1.5 block">Nome tavolo</label>
              <input type="text" value={nome} onChange={(e) => setNome(e.target.value)}
                placeholder="Es. Tavolo 1, Terrazza, Bancone"
                className="w-full bg-gray-50 text-gray-800 rounded-xl px-4 py-3 border border-gray-200 focus:border-blue-500 focus:outline-none focus:bg-white transition-colors" />
            </div>
            <div className="w-32">
              <label className="text-gray-700 text-sm font-medium mb-1.5 block">Posti</label>
              <select value={posti} onChange={(e) => setPosti(e.target.value)}
                className="w-full bg-gray-50 text-gray-800 rounded-xl px-4 py-3 border border-gray-200 focus:border-blue-500 focus:outline-none focus:bg-white transition-colors">
                {[1,2,3,4,5,6,7,8,10,12,15,20].map(n => (
                  <option key={n} value={n}>{n} posti</option>
                ))}
              </select>
            </div>
          </div>
          <button onClick={aggiungi} disabled={!nome}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-xl py-3 transition-colors">
            + Aggiungi Tavolo
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-800 text-lg">🪑 I tuoi tavoli</h2>
            <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-semibold">{tavoli.length} tavoli</span>
          </div>
          <div className="p-4 space-y-3">
            {tavoli.length === 0 ? (
              <p className="text-gray-400 text-center py-8 text-sm">Nessun tavolo aggiunto ancora</p>
            ) : (
              tavoli.map(t => (
                <div key={t.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                  <div>
                    <p className="font-semibold text-gray-800">{t.nome}</p>
                    <p className="text-gray-500 text-sm">{t.posti} posti</p>
                  </div>
                  <button onClick={() => elimina(t.id)} className="text-red-400 hover:text-red-600 text-sm px-3 py-1 rounded-lg hover:bg-red-50">
                    🗑 Elimina
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {tavoli.length > 0 && (
          <div className="bg-blue-50 rounded-2xl border border-blue-200 p-4">
            <p className="text-blue-700 text-sm font-medium">
              📊 Capacità totale: <span className="font-bold">{tavoli.reduce((acc, t) => acc + t.posti, 0)} posti</span> su {tavoli.length} tavoli
            </p>
          </div>
        )}
      </div>
    </div>
  )
}