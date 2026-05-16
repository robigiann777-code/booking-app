'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Profilo() {
  const [loading, setLoading] = useState(false)
  const [salvato, setSalvato] = useState(false)
  const [menuFile, setMenuFile] = useState<File | null>(null)
  const [menuUrl, setMenuUrl] = useState('')
  const router = useRouter()

  const nomeRef = useRef<HTMLInputElement>(null)
  const indirizzoRef = useRef<HTMLInputElement>(null)
  const telefonoRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const orariRef = useRef<HTMLTextAreaElement>(null)
  const parcheggioRef = useRef<HTMLInputElement>(null)
  const wifiRef = useRef<HTMLInputElement>(null)
  const descrizioneRef = useRef<HTMLTextAreaElement>(null)
  const chatbotRef = useRef<HTMLTextAreaElement>(null)
  const [ristoranteId, setRistoranteId] = useState<string | null>(null)

  useEffect(() => {
    caricaProfilo()
  }, [])

  const caricaProfilo = async () => {
    const { data } = await supabase.from('ristoranti').select('*').limit(1).single()
    if (data) {
      setRistoranteId(data.id)
      if (nomeRef.current) nomeRef.current.value = data.nome || ''
      if (indirizzoRef.current) indirizzoRef.current.value = data.indirizzo || ''
      if (telefonoRef.current) telefonoRef.current.value = data.telefono || ''
      if (emailRef.current) emailRef.current.value = data.email || ''
      if (orariRef.current) orariRef.current.value = data.orari || ''
      if (parcheggioRef.current) parcheggioRef.current.value = data.parcheggio || ''
      if (wifiRef.current) wifiRef.current.value = data.wifi || ''
      if (descrizioneRef.current) descrizioneRef.current.value = data.descrizione || ''
      if (chatbotRef.current) chatbotRef.current.value = data.istruzioni_chatbot || ''
      setMenuUrl(data.menu_url || '')
    }
  }

  const salva = async () => {
    setLoading(true)

    let menu_url = menuUrl

    if (menuFile) {
      const fileName = `menu-${Date.now()}.pdf`
      const { data: uploadData } = await supabase.storage
        .from('menu')
        .upload(fileName, menuFile, { upsert: true })
      if (uploadData) {
        const { data: urlData } = supabase.storage.from('menu').getPublicUrl(fileName)
        menu_url = urlData.publicUrl
      }
    }

    const dati = {
      nome: nomeRef.current?.value || '',
      indirizzo: indirizzoRef.current?.value || '',
      telefono: telefonoRef.current?.value || '',
      email: emailRef.current?.value || '',
      orari: orariRef.current?.value || '',
      parcheggio: parcheggioRef.current?.value || '',
      wifi: wifiRef.current?.value || '',
      descrizione: descrizioneRef.current?.value || '',
      istruzioni_chatbot: chatbotRef.current?.value || '',
      menu_url,
    }

    if (ristoranteId) {
      await supabase.from('ristoranti').update(dati).eq('id', ristoranteId)
    } else {
      await supabase.from('ristoranti').insert([dati])
    }

    setMenuUrl(menu_url)
    setLoading(false)
    setSalvato(true)
    setTimeout(() => setSalvato(false), 3000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏪</span>
          <h1 className="text-xl font-bold text-gray-800">Profilo Ristorante</h1>
        </div>
        <button onClick={() => router.push('/dashboard')} className="text-gray-500 hover:text-gray-800 text-sm px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100">← Dashboard</button>
      </div>

      <div className="p-6 max-w-2xl mx-auto space-y-6">

        {/* INFO BASE */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-gray-800 text-lg">📋 Informazioni base</h2>
          <div>
            <label className="text-gray-700 text-sm font-medium mb-1.5 block">Nome ristorante *</label>
            <input ref={nomeRef} type="text" placeholder="Es. Ristorante Da Mario"
              className="w-full bg-gray-50 text-gray-800 rounded-xl px-4 py-3 border border-gray-200 focus:border-blue-500 focus:outline-none focus:bg-white transition-colors" />
          </div>
          <div>
            <label className="text-gray-700 text-sm font-medium mb-1.5 block">Indirizzo</label>
            <input ref={indirizzoRef} type="text" placeholder="Es. Via Roma 1, Milano"
              className="w-full bg-gray-50 text-gray-800 rounded-xl px-4 py-3 border border-gray-200 focus:border-blue-500 focus:outline-none focus:bg-white transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-700 text-sm font-medium mb-1.5 block">Telefono</label>
              <input ref={telefonoRef} type="text" placeholder="Es. 02 1234567"
                className="w-full bg-gray-50 text-gray-800 rounded-xl px-4 py-3 border border-gray-200 focus:border-blue-500 focus:outline-none focus:bg-white transition-colors" />
            </div>
            <div>
              <label className="text-gray-700 text-sm font-medium mb-1.5 block">Email</label>
              <input ref={emailRef} type="email" placeholder="info@ristorante.it"
                className="w-full bg-gray-50 text-gray-800 rounded-xl px-4 py-3 border border-gray-200 focus:border-blue-500 focus:outline-none focus:bg-white transition-colors" />
            </div>
          </div>
          <div>
            <label className="text-gray-700 text-sm font-medium mb-1.5 block">Descrizione</label>
            <textarea ref={descrizioneRef} placeholder="Es. Ristorante tipico toscano nel centro storico..."
              className="w-full bg-gray-50 text-gray-800 rounded-xl px-4 py-3 border border-gray-200 focus:border-blue-500 focus:outline-none focus:bg-white transition-colors resize-none" rows={3} />
          </div>
        </div>

        {/* ORARI E SERVIZI */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-gray-800 text-lg">🕐 Orari e servizi</h2>
          <div>
            <label className="text-gray-700 text-sm font-medium mb-1.5 block">Orari di apertura</label>
            <textarea ref={orariRef} placeholder={`Es. Lunedì-Venerdì: 12:00-15:00 / 19:00-23:00\nSabato: 19:00-23:30\nDomenica: chiuso`}
              className="w-full bg-gray-50 text-gray-800 rounded-xl px-4 py-3 border border-gray-200 focus:border-blue-500 focus:outline-none focus:bg-white transition-colors resize-none" rows={4} />
          </div>
          <div>
            <label className="text-gray-700 text-sm font-medium mb-1.5 block">🅿️ Parcheggio</label>
            <input ref={parcheggioRef} type="text" placeholder="Es. Parcheggio gratuito in Via Rossi, 50m dal locale"
              className="w-full bg-gray-50 text-gray-800 rounded-xl px-4 py-3 border border-gray-200 focus:border-blue-500 focus:outline-none focus:bg-white transition-colors" />
          </div>
          <div>
            <label className="text-gray-700 text-sm font-medium mb-1.5 block">📶 WiFi</label>
            <input ref={wifiRef} type="text" placeholder="Es. Rete: RistoranteMario — Password: mario2024"
              className="w-full bg-gray-50 text-gray-800 rounded-xl px-4 py-3 border border-gray-200 focus:border-blue-500 focus:outline-none focus:bg-white transition-colors" />
          </div>
        </div>

        {/* MENU PDF */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-gray-800 text-lg">📄 Menu PDF</h2>
          <p className="text-gray-500 text-sm">Il chatbot IA leggerà questo PDF per rispondere alle domande dei clienti sul menu.</p>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
            <input type="file" accept=".pdf" onChange={(e) => setMenuFile(e.target.files?.[0] || null)}
              className="hidden" id="menu-upload" />
            <label htmlFor="menu-upload" className="cursor-pointer">
              <span className="text-4xl block mb-2">📄</span>
              <p className="text-gray-600 font-medium">{menuFile ? menuFile.name : 'Clicca per caricare il menu PDF'}</p>
              <p className="text-gray-400 text-sm mt-1">Solo file PDF</p>
            </label>
          </div>
          {menuUrl && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <p className="text-green-700 text-sm font-medium">Menu caricato</p>
              <a href={menuUrl} target="_blank" className="ml-auto text-blue-600 text-sm hover:underline">Visualizza →</a>
            </div>
          )}
        </div>

        {/* ISTRUZIONI CHATBOT */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-gray-800 text-lg">🤖 Istruzioni per il Chatbot</h2>
          <p className="text-gray-500 text-sm">Scrivi qui tutto quello che vuoi che il chatbot sappia e dica ai clienti.</p>
          <textarea ref={chatbotRef}
            placeholder="Es. Rispondi sempre in italiano. Siamo specializzati in cucina toscana. Abbiamo opzioni vegetariane. Non accettiamo animali. Per gruppi superiori a 8 persone chiamare in anticipo..."
            className="w-full bg-gray-50 text-gray-800 rounded-xl px-4 py-3 border border-gray-200 focus:border-blue-500 focus:outline-none focus:bg-white transition-colors resize-none" rows={6} />
        </div>

        {/* SALVA */}
        <button onClick={salva} disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl py-4 transition-colors shadow-sm text-base">
          {loading ? '⏳ Salvataggio...' : salvato ? '✅ Salvato!' : '💾 Salva Profilo'}
        </button>

      </div>
    </div>
  )
}