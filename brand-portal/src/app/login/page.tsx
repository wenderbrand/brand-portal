'use client'
import { useRef, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const emailRef = useRef(null)
  const passwordRef = useRef(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    const email = emailRef.current?.value || ''
    const password = passwordRef.current?.value || ''

    if (!email || !password) {
      setError('Preencha e-mail e senha.')
      return
    }

    setError('')
    setLoading(true)

    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4">
      <div className="w-full max-w-[360px]">
        <div className="mb-8">
          <div className="w-8 h-8 bg-[#3b5bdb] rounded-[7px] mb-5" />
          <h1 className="text-[22px] font-semibold text-[#0f0f0f] tracking-tight">Entrar</h1>
          <p className="text-[13px] text-[#6b7280] mt-1">Acesse seu Brand Portal</p>
        </div>
        <div className="space-y-3">
          <div>
            <label className="label">E-mail</label>
            <input ref={emailRef} type="email" placeholder="voce@empresa.com" className="input-field" />
          </div>
          <div>
            <label className="label">Senha</label>
            <input ref={passwordRef} type="password" placeholder="********" className="input-field" />
          </div>
          {error && (
            <p className="text-[12px] text-red-500 bg-red-50 border border-red-100 rounded-[6px] px-3 py-2">{error}</p>
          )}
          <button type="button" disabled={loading} onClick={handleLogin} className="btn-primary w-full mt-1">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </div>
        <div className="mt-4 flex items-center justify-between text-[12px] text-[#6b7280]">
          <Link href="/register" className="hover:text-[#3b5bdb] transition-colors">Criar conta</Link>
          <Link href="/forgot-password" className="hover:text-[#3b5bdb] transition-colors">Esqueci a senha</Link>
        </div>
      </div>
    </div>
  )
}
