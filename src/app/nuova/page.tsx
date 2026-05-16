'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  'https://peevprlodvjbrtvzlygw.supabase.co',
  'sb_publishable_jJJLJdp9dvr7DZ0WIVhhmA_Tn-j4cr1'
)

export default function NuovaPrenotazione() {
  const [nome, setNome] = useState('')
  const [telefono, setTelefono] = useState('')
  const [data, setData] = useState('')
  const [ora, setOra] = useState('')
  const [persone, setPersone] = useState('2')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [errore, setErrore] = useState('')
  const [tavoloAssegnato, setTavoloAssegnato] = useState<any>(null)
  const router = useRouter()

  const trovaTavoloDisponibile = async (data: string, ora: string, persone: number) => {
    // Carica tutti i tavoli con abbastanza posti
    const { data: tavoli } = await supabase
      .from('tavoli')
      .select('*')
      .gte('posti', persone)
      .order('posti', { ascending: true })

    if (!tavoli || tavoli.length === 0) return null

    // Per ogni tavolo controlla se è libero nell'orario richiesto
    const oraRichiesta = new Date(`${data}T${ora}`)

    for (const tavolo of tavoli) {
      const { data: prenotazioni } = await supabase
        .from('prenotazioni')
        .select('*')
        .eq('tavolo_id', tavolo.id)
        .eq('data', data)
        .neq('stato', 'rifiutata')

      let disponibile = true

      for (const pren of (prenotazioni || [])) {
        const oraEsistente = new Date(`${data}T${pren.ora}`)
        const diffMinuti = Math.abs((oraRichiesta.getTime() - oraEsistente.getTime()) / 60000)
        
        if (diffMinuti < 90) { // meno di 1,5 ore di distanza
          disponibile = false
          break
        }
      }

      if (disponibile) return tavolo
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrore('')
    setTavoloAssegnato(null)

    if (!data || !ora) {
      setErrore('Inserisci data e ora')
      setLoading(false)
      return
    }

    const nPersone = parseInt(persone)
    const tavolo = await trovaTavoloDisponibile(data, ora, nPersone)

    if (!tavolo) {
      setErrore(`Nessun tavolo disponibile per ${nPersone} persone in questo orario. Prova un altro orario.`)
      setLoading(false)
      return
    }

    const { error } = await supabase.from('prenotazioni').insert([{
      nome_cliente: nome,
      telefono_cliente: telefono,
      data,
      ora,
      persone: nPersone,
      note,
      tavolo_id: tavolo.id
    }])

    if (!error) {
      setTavoloAssegnato(tavolo)
      setTimeout(() => router.push('/dashboard'), 2000)
    } else {
      setErrore('Errore nel salvataggio: ' + error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-2xl">➕</span>
          <h1 className="text-xl font-bold text-gray-800">Nuova Prenotazione</h1>
        </div>
        <button onClick={() => router.push('/dashboard')} className="text-gray-500 hover:text-gray-800 text-sm px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100">← Torna</button>
      </div>

      <div className="p-6 max-w-lg mx-auto">
        {tavoloAssegnato ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
            <span className="text-5xl block mb-4">✅</span>
            <h2 className="text-xl font-bold text-green-700 mb-2">Prenotazione salvata!</h2>
            <p className="text-green-600">Tavolo assegnato: <span className="font-bold">{tavoloAssegnato.nome}</span> ({tavoloAssegnato.posti} posti)</p>
            <p className="text-gray-400 text-sm mt-2">Torno alla dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
            <div>
              <label className="text-gray-700 text-sm font-medium mb-1.5 block">Nome cliente *</label>
              <input type="text" value={nome} onChange={(e) => setNome(e.target.value)}
                placeholder="Es. Mario Rossi"
                className="w-full bg-gray-50 text-gray-800 rounded-xl px-4 py-3 border border-gray-200 focus:border-blue-500 focus:outline-none focus:bg-white transition-colors" required />
            </div>

            <div>
              <label className="text-gray-700 text-sm font-medium mb-1.5 block">Telefono</label>
              <input type="text" value={telefono} onChange={(e) => setTelefono(e.target.value)}
                placeholder="Es. 333 1234567"
                className="w-full bg-gray-50 text-gray-800 rounded-xl px-4 py-3 border border-gray-200 focus:border-blue-500 focus:outline-none focus:bg-white transition-colors" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-700 text-sm font-medium mb-1.5 block">Data *</label>
                <input type="date" value={data} onChange={(e) => setData(e.target.value)}
                  className="w-full bg-gray-50 text-gray-800 rounded-xl px-4 py-3 border border-gray-200 focus:border-blue-500 focus:outline-none focus:bg-white transition-colors" required />
              </div>
              <div>
                <label className="text-gray-700 text-sm font-medium mb-1.5 block">Ora *</label>
                <input type="time" value={ora} onChange={(e) => setOra(e.target.value)}
                  className="w-full bg-gray-50 text-gray-800 rounded-xl px-4 py-3 border border-gray-200 focus:border-blue-500 focus:outline-none focus:bg-white transition-colors" required />
              </div>
            </div>

            <div>
              <label className="text-gray-700 text-sm font-medium mb-1.5 block">Numero persone *</label>
              <div className="flex gap-2">
                {[1,2,3,4,5,6,7,8].map(n => (
                  <button key={n} type="button" onClick={() => setPersone(n.toString())}
                    className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-colors ${
                      persone === n.toString()
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-gray-700 text-sm font-medium mb-1.5 block">Note</label>
              <textarea value={note} onChange={(e) => setNote(e.target.value)}
                placeholder="Es. Allergie, occasioni speciali..."
                className="w-full bg-gray-50 text-gray-800 rounded-xl px-4 py-3 border border-gray-200 focus:border-blue-500 focus:outline-none focus:bg-white transition-colors resize-none" rows={3} />
            </div>

            {errore && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-red-600 text-sm">⚠️ {errore}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl py-4 transition-colors shadow-sm text-base">
              {loading ? '⏳ Cerco tavolo disponibile...' : '✓ Salva Prenotazione'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}