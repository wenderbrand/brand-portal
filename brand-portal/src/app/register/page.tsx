'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4">
      <div className="w-full max-w-[360px]">
        <div className="mb-8">
          <div className="w-8 h-8 bg-[#3b5bdb] rounded-[7px] mb-5" />
          <h1 className="text-[22px] font-semibold text-[#0f0f0f] tracking-tight">Criar conta</h1>
          <p className="text-[13px] text-[#6b7280] mt-1">Comece a criar portais de marca</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-3">
          <div>
            <label className="label">E-mail</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="voce@empresa.com" required className="input-field"
            />
          </div>
          <div>
            <label className="label">Senha</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres" required minLength={6} className="input-field"
            />
          </div>

          {error && (
            <p className="text-[12px] text-red-500 bg-red-50 border border-red-100 rounded-[6px] px-3 py-2">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full mt-1">
            {loading ? 'Criando conta...' : 'Criar conta →'}
          </button>
        </form>

        <p className="mt-4 text-[12px] text-[#6b7280] text-center">
          Já tem conta?{' '}
          <Link href="/login" className="text-[#3b5bdb] hover:underline">Entrar</Link>
        </p>
      </div>
    </div>
  )
}
