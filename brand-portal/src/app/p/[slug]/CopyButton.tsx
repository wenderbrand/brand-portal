'use client'
import { useState } from 'react'

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault()
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button onClick={handleCopy}
      className="text-[10px] text-[#6b7280] hover:text-[#3b5bdb] border border-[#e5e7eb] rounded-[5px] px-2 py-1 transition-colors flex-shrink-0">
      {copied ? '✓' : 'Copiar'}
    </button>
  )
}
