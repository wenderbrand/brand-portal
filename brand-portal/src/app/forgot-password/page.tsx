'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    })
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4">
      <div className="w-full max-w-[360px]">
        <div className="mb-8">
          <div className="w-8 h-8 bg-[#3b5bdb] rounded-[7px] mb-5" />
          <h1 className="text-[22px] font-semibold text-[#0f0f0f] tracking-tight">Recuperar senha</h1>
          <p className="text-[13px] text-[#6b7280] mt-1">Enviaremos um link para seu e-mail</p>
        </div>

        {sent ? (
          <div className="bg-green-50 border border-green-100 rounded-[8px] p-4 text-[13px] text-green-700">
            ✓ Link enviado! Verifique sua caixa de entrada.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="label">E-mail</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="voce@empresa.com" required className="input-field"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Enviando...' : 'Enviar link'}
            </button>
          </form>
        )}

        <p className="mt-4 text-[12px] text-[#6b7280] text-center">
          <Link href="/login" className="hover:text-[#3b5bdb] transition-colors">← Voltar para o login</Link>
        </p>
      </div>
    </div>
  )
}
