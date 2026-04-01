'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

/* ── Tipos ────────────────────────────────────────────────────── */
type Section = 'cover' | 'logo' | 'colors' | 'typography' | 'texts' | 'files'

type ContentMap = {
  cover: { title?: string; description?: string; logo_url?: string }
  logo: { primary_url?: string; variations?: string[] }
  colors: { items?: { hex: string; name: string }[] }
  typography: { items?: { family: string; description: string }[] }
  texts: { body?: string }
  files: { items?: { name: string; url: string; size?: string }[] }
}

type Project = {
  id: string
  name: string
  logo_url: string | null
  slug: string | null
  is_published: boolean
}

const SECTIONS: { id: Section; label: string; icon: string }[] = [
  { id: 'cover',      label: 'Capa',        icon: '◉' },
  { id: 'logo',       label: 'Logotipo',    icon: '⊡' },
  { id: 'colors',     label: 'Cores',       icon: '◈' },
  { id: 'typography', label: 'Tipografia',  icon: 'Aa' },
  { id: 'texts',      label: 'Textos',      icon: '¶' },
  { id: 'files',      label: 'Arquivos',    icon: '↓' },
]

/* ── Editor page ────────────────────────────────────────────────── */
export default function EditorPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const supabase = createClient()

  const [project, setProject] = useState<Project | null>(null)
  const [content, setContent] = useState<ContentMap>({
    cover: {}, logo: {}, colors: {}, typography: {}, texts: {}, files: {},
  })
  const [activeSection, setActiveSection] = useState<Section>('cover')
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => { loadData() }, [id])

  const loadData = async () => {
    const { data: proj } = await supabase
      .from('projects').select('*').eq('id', id).single()
    if (!proj) { router.push('/dashboard'); return }
    setProject(proj)

    const { data: rows } = await supabase
      .from('project_content').select('*').eq('project_id', id)

    const map: any = { cover: {}, logo: {}, colors: {}, typography: {}, texts: {}, files: {} }
    rows?.forEach(row => { map[row.section] = row.content || {} })
    setContent(map)
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const handleSave = async () => {
    setSaving(true)
    // Upsert cada seção
    for (const section of Object.keys(content) as Section[]) {
      const { data: existing } = await supabase
        .from('project_content')
        .select('id')
        .eq('project_id', id)
        .eq('section', section)
        .single()

      if (existing) {
        await supabase.from('project_content')
          .update({ content: content[section] })
          .eq('id', existing.id)
      } else {
        await supabase.from('project_content')
          .insert({ project_id: id, section, content: content[section] })
      }
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handlePublish = async () => {
    setPublishing(true)
    await handleSave()

    let slug = project?.slug
    if (!slug) {
      const { nanoid } = await import('nanoid')
      slug = nanoid(8).toLowerCase()
      await supabase.from('projects')
        .update({ slug, is_published: true })
        .eq('id', id)
      setProject(p => p ? { ...p, slug: slug ?? null, is_published: true } : p)
    } else {
      await supabase.from('projects').update({ is_published: true }).eq('id', id)
      setProject(p => p ? { ...p, is_published: true } : p)
    }

    setPublishing(false)
    showToast(`Portal publicado! /p/${slug}`)
  }

  const updateContent = (section: Section, data: any) => {
    setContent(c => ({ ...c, [section]: { ...c[section], ...data } }))
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-[13px] text-[#6b7280]">Carregando...</div>
      </div>
    )
  }

  const publicUrl = project.slug ? `${window.location.origin}/p/${project.slug}` : null

  return (
    <div className="h-screen flex flex-col bg-[#fafafa] overflow-hidden">
      {/* ── Topbar ── */}
      <header className="h-[52px] bg-white border-b border-[#e5e7eb] flex items-center justify-between px-4 flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="btn-ghost py-1.5 px-2 text-[12px] flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M7.5 1.5L3 6l4.5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Projetos
          </Link>
          <span className="text-[#e5e7eb]">/</span>
          <span className="text-[13px] font-medium text-[#0f0f0f] truncate max-w-[180px]">{project.name}</span>
          {project.is_published && (
            <span className="text-[11px] bg-green-50 text-green-600 border border-green-100 rounded-full px-2 py-0.5">
              Publicado
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {publicUrl && (
            <a href={publicUrl} target="_blank"
              className="btn-ghost text-[12px] py-1.5 flex items-center gap-1.5">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M7 1h4v4M11 1L5 7M3 2H2a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Ver portal
            </a>
          )}
          <button onClick={handleSave} disabled={saving} className="btn-secondary text-[12px] py-1.5">
            {saved ? '✓ Salvo' : saving ? 'Salvando...' : 'Salvar'}
          </button>
          <button onClick={handlePublish} disabled={publishing} className="btn-primary text-[12px] py-1.5">
            {publishing ? 'Publicando...' : project.is_published ? 'Atualizar portal' : 'Publicar →'}
          </button>
        </div>
      </header>

      {/* ── Layout 3 colunas ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Esquerda — menu de seções */}
        <nav className="w-[180px] bg-white border-r border-[#e5e7eb] flex-shrink-0 py-4 overflow-y-auto">
          <p className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wider px-4 mb-2">Seções</p>
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`w-full text-left flex items-center gap-3 px-4 py-2.5 text-[13px] transition-colors ${
                activeSection === s.id
                  ? 'text-[#3b5bdb] bg-[#f0f4ff] font-medium'
                  : 'text-[#374151] hover:bg-[#f9fafb]'
              }`}
            >
              <span className="text-[15px] w-5 text-center opacity-60 font-mono">{s.icon}</span>
              {s.label}
            </button>
          ))}
        </nav>

        {/* Centro — preview */}
        <div className="flex-1 overflow-y-auto bg-[#f3f4f6] flex flex-col items-center py-8 px-4">
          <div className="w-full max-w-[480px]">
            <div className="text-[10px] text-[#9ca3af] text-center mb-3 uppercase tracking-wider">Preview do portal</div>
            <PortalPreview content={content} project={project} />
          </div>
        </div>

        {/* Direita — formulário da seção */}
        <aside className="w-[300px] bg-white border-l border-[#e5e7eb] flex-shrink-0 overflow-y-auto">
          <SectionEditor
            section={activeSection}
            content={content}
            projectId={id}
            onUpdate={updateContent}
          />
        </aside>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-[#0f0f0f] text-white text-[12px] px-4 py-2.5 rounded-[8px] shadow-lg z-50 flex items-center gap-2">
          <span className="text-green-400">✓</span>
          {toast}
          {project.slug && (
            <button
              onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/p/${project.slug}`); showToast('Link copiado!') }}
              className="ml-2 underline text-[#9ca3af] hover:text-white">
              Copiar link
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Portal Preview ──────────────────────────────────────────── */
function PortalPreview({ content, project }: { content: ContentMap; project: Project }) {
  const { cover, logo, colors, typography, texts, files } = content

  return (
    <div className="bg-white rounded-[12px] border border-[#e5e7eb] overflow-hidden shadow-sm">
      {/* Header do portal */}
      <div className="px-6 py-5 border-b border-[#e5e7eb] flex items-center gap-3">
        {(logo.primary_url || project.logo_url) && (
          <img src={logo.primary_url || project.logo_url!} alt="" className="h-8 object-contain" />
        )}
        <span className="text-[15px] font-semibold text-[#0f0f0f]">
          {cover.title || project.name}
        </span>
      </div>

      <div className="p-6 space-y-6">
        {/* Capa */}
        {cover.description && (
          <div>
            <p className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wider mb-2">Sobre</p>
            <p className="text-[13px] text-[#374151] leading-relaxed">{cover.description}</p>
          </div>
        )}

        {/* Cores */}
        {colors.items && colors.items.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wider mb-3">Cores</p>
            <div className="flex flex-wrap gap-2">
              {colors.items.map((c, i) => (
                <div key={i} className="flex items-center gap-2 border border-[#e5e7eb] rounded-[7px] p-2 pr-3">
                  <div className="w-7 h-7 rounded-[5px] border border-black/10" style={{ background: c.hex }} />
                  <div>
                    <p className="text-[11px] font-medium text-[#0f0f0f]">{c.name || 'Cor'}</p>
                    <p className="text-[10px] text-[#6b7280] font-mono">{c.hex}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tipografia */}
        {typography.items && typography.items.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wider mb-3">Tipografia</p>
            {typography.items.map((t, i) => (
              <div key={i} className="border border-[#e5e7eb] rounded-[7px] p-3 mb-2">
                <p className="text-[14px] font-semibold text-[#0f0f0f]">{t.family}</p>
                {t.description && <p className="text-[11px] text-[#6b7280] mt-0.5">{t.description}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Textos */}
        {texts.body && (
          <div>
            <p className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wider mb-2">Texto</p>
            <p className="text-[13px] text-[#374151] leading-relaxed whitespace-pre-wrap">{texts.body}</p>
          </div>
        )}

        {/* Arquivos */}
        {files.items && files.items.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wider mb-3">Arquivos</p>
            <div className="space-y-1.5">
              {files.items.map((f, i) => (
                <div key={i} className="flex items-center justify-between border border-[#e5e7eb] rounded-[7px] px-3 py-2.5">
                  <span className="text-[12px] text-[#374151] truncate">{f.name}</span>
                  <a href={f.url} download target="_blank" className="text-[11px] text-[#3b5bdb] hover:underline flex-shrink-0 ml-2">
                    ↓
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Section Editor ──────────────────────────────────────────── */
function SectionEditor({ section, content, projectId, onUpdate }: {
  section: Section
  content: ContentMap
  projectId: string
  onUpdate: (section: Section, data: any) => void
}) {
  const supabase = createClient()
  const label = SECTIONS.find(s => s.id === section)?.label || ''

  const inp = "input-field text-[13px]"

  return (
    <div className="p-5">
      <h3 className="text-[13px] font-semibold text-[#0f0f0f] mb-4">{label}</h3>

      {/* CAPA */}
      {section === 'cover' && (
        <div className="space-y-3">
          <div>
            <label className="label">Nome da marca</label>
            <input className={inp} placeholder="Ex: Acme Studio"
              value={content.cover.title || ''}
              onChange={e => onUpdate('cover', { title: e.target.value })}/>
          </div>
          <div>
            <label className="label">Descrição</label>
            <textarea className="input-field text-[13px] resize-none" rows={4}
              placeholder="Descrição da marca, missão, propósito..."
              value={content.cover.description || ''}
              onChange={e => onUpdate('cover', { description: e.target.value })}/>
          </div>
        </div>
      )}

      {/* LOGOTIPO */}
      {section === 'logo' && (
        <div className="space-y-4">
          <div>
            <label className="label">Logo principal</label>
            <LogoUploader
              projectId={projectId}
              bucket="logos"
              currentUrl={content.logo.primary_url || null}
              onUploaded={url => onUpdate('logo', { primary_url: url })}
            />
          </div>
          <div>
            <label className="label">Variações</label>
            <p className="text-[11px] text-[#9ca3af] mb-2">Versões alternativas do logo</p>
            <MultiLogoUploader
              projectId={projectId}
              urls={content.logo.variations || []}
              onUpdated={urls => onUpdate('logo', { variations: urls })}
            />
          </div>
        </div>
      )}

      {/* CORES */}
      {section === 'colors' && (
        <ColorsEditor
          items={content.colors.items || []}
          onChange={items => onUpdate('colors', { items })}
        />
      )}

      {/* TIPOGRAFIA */}
      {section === 'typography' && (
        <TypographyEditor
          items={content.typography.items || []}
          onChange={items => onUpdate('typography', { items })}
        />
      )}

      {/* TEXTOS */}
      {section === 'texts' && (
        <div>
          <label className="label">Conteúdo</label>
          <textarea className="input-field text-[13px] resize-none" rows={10}
            placeholder="Escreva textos sobre a marca..."
            value={content.texts.body || ''}
            onChange={e => onUpdate('texts', { body: e.target.value })}/>
        </div>
      )}

      {/* ARQUIVOS */}
      {section === 'files' && (
        <FilesEditor
          projectId={projectId}
          items={content.files.items || []}
          onChange={items => onUpdate('files', { items })}
        />
      )}
    </div>
  )
}

/* ── Logo Uploader ───────────────────────────────────────────── */
function LogoUploader({ projectId, bucket, currentUrl, onUploaded }: {
  projectId: string; bucket: string; currentUrl: string | null; onUploaded: (url: string) => void
}) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    const ext = file.name.split('.').pop()
    const path = `${projectId}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from(bucket).getPublicUrl(path)
      onUploaded(data.publicUrl)
    }
    setLoading(false)
  }

  return (
    <label className="flex flex-col items-center justify-center gap-2 border border-dashed border-[#e5e7eb] rounded-[8px] p-4 cursor-pointer hover:border-[#3b5bdb] hover:bg-[#f0f4ff] transition-all min-h-[80px]">
      {loading ? <span className="text-[12px] text-[#6b7280]">Enviando...</span>
        : currentUrl ? (
          <img src={currentUrl} alt="logo" className="h-10 object-contain" />
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 12V4M5 7l4-4 4 4" stroke="#9ca3af" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 15h14" stroke="#9ca3af" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <span className="text-[11px] text-[#9ca3af]">{currentUrl ? 'Trocar imagem' : 'Upload'}</span>
          </>
        )
      }
      <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
    </label>
  )
}

/* ── Multi Logo Uploader ─────────────────────────────────────── */
function MultiLogoUploader({ projectId, urls, onUpdated }: {
  projectId: string; urls: string[]; onUpdated: (urls: string[]) => void
}) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    const ext = file.name.split('.').pop()
    const path = `${projectId}/var_${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('logos').upload(path, file, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('logos').getPublicUrl(path)
      onUpdated([...urls, data.publicUrl])
    }
    setLoading(false)
  }

  return (
    <div className="space-y-2">
      {urls.map((url, i) => (
        <div key={i} className="flex items-center justify-between border border-[#e5e7eb] rounded-[7px] px-3 py-2">
          <img src={url} alt="" className="h-7 object-contain" />
          <button onClick={() => onUpdated(urls.filter((_, j) => j !== i))}
            className="text-[#9ca3af] hover:text-red-500 text-[14px]">×</button>
        </div>
      ))}
      <label className="flex items-center gap-2 text-[12px] text-[#3b5bdb] cursor-pointer hover:underline">
        <span>+ Adicionar variação</span>
        {loading && <span className="text-[#9ca3af]">Enviando...</span>}
        <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </label>
    </div>
  )
}

/* ── Colors Editor ───────────────────────────────────────────── */
function ColorsEditor({ items, onChange }: {
  items: { hex: string; name: string }[]
  onChange: (items: { hex: string; name: string }[]) => void
}) {
  const [copied, setCopied] = useState<number | null>(null)

  const add = () => onChange([...items, { hex: '#000000', name: '' }])
  const update = (i: number, field: string, val: string) => {
    const next = [...items]
    next[i] = { ...next[i], [field]: val }
    onChange(next)
  }
  const remove = (i: number) => onChange(items.filter((_, j) => j !== i))
  const copy = (hex: string, i: number) => {
    navigator.clipboard.writeText(hex)
    setCopied(i)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="space-y-3">
      {items.map((c, i) => (
        <div key={i} className="border border-[#e5e7eb] rounded-[8px] p-3">
          <div className="flex items-center gap-2 mb-2">
            <input type="color" value={c.hex}
              onChange={e => update(i, 'hex', e.target.value)}
              className="w-8 h-8 rounded-[5px] border border-[#e5e7eb] cursor-pointer p-0.5"/>
            <input className="input-field font-mono text-[12px] flex-1" value={c.hex}
              onChange={e => update(i, 'hex', e.target.value)} placeholder="#000000"/>
            <button onClick={() => copy(c.hex, i)}
              className="text-[11px] text-[#6b7280] hover:text-[#3b5bdb] px-2 py-1 border border-[#e5e7eb] rounded-[5px] whitespace-nowrap">
              {copied === i ? '✓' : 'Copiar'}
            </button>
            <button onClick={() => remove(i)} className="text-[#9ca3af] hover:text-red-500">×</button>
          </div>
          <input className="input-field text-[12px]" value={c.name}
            onChange={e => update(i, 'name', e.target.value)} placeholder="Nome da cor"/>
        </div>
      ))}
      <button onClick={add} className="text-[12px] text-[#3b5bdb] hover:underline">
        + Adicionar cor
      </button>
    </div>
  )
}

/* ── Typography Editor ───────────────────────────────────────── */
function TypographyEditor({ items, onChange }: {
  items: { family: string; description: string }[]
  onChange: (items: { family: string; description: string }[]) => void
}) {
  const add = () => onChange([...items, { family: '', description: '' }])
  const update = (i: number, field: string, val: string) => {
    const next = [...items]
    next[i] = { ...next[i], [field]: val }
    onChange(next)
  }
  const remove = (i: number) => onChange(items.filter((_, j) => j !== i))

  return (
    <div className="space-y-3">
      {items.map((t, i) => (
        <div key={i} className="border border-[#e5e7eb] rounded-[8px] p-3 space-y-2">
          <div className="flex items-center gap-2">
            <input className="input-field text-[13px] flex-1" value={t.family}
              onChange={e => update(i, 'family', e.target.value)} placeholder="Nome da fonte"/>
            <button onClick={() => remove(i)} className="text-[#9ca3af] hover:text-red-500">×</button>
          </div>
          <input className="input-field text-[12px]" value={t.description}
            onChange={e => update(i, 'description', e.target.value)} placeholder="Uso, peso, observações"/>
        </div>
      ))}
      <button onClick={add} className="text-[12px] text-[#3b5bdb] hover:underline">
        + Adicionar fonte
      </button>
    </div>
  )
}

/* ── Files Editor ────────────────────────────────────────────── */
function FilesEditor({ projectId, items, onChange }: {
  projectId: string
  items: { name: string; url: string; size?: string }[]
  onChange: (items: { name: string; url: string; size?: string }[]) => void
}) {
  const supabase = createClient()
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const path = `${projectId}/${Date.now()}_${file.name}`
    const { error } = await supabase.storage.from('assets').upload(path, file)
    if (!error) {
      const { data } = supabase.storage.from('assets').getPublicUrl(path)
      const size = file.size > 1024 * 1024
        ? `${(file.size / 1024 / 1024).toFixed(1)}MB`
        : `${Math.round(file.size / 1024)}KB`
      onChange([...items, { name: file.name, url: data.publicUrl, size }])
    }
    setUploading(false)
  }

  const remove = (i: number) => onChange(items.filter((_, j) => j !== i))

  return (
    <div className="space-y-2">
      {items.map((f, i) => (
        <div key={i} className="flex items-center justify-between border border-[#e5e7eb] rounded-[7px] px-3 py-2.5">
          <div className="min-w-0">
            <p className="text-[12px] text-[#374151] truncate">{f.name}</p>
            {f.size && <p className="text-[10px] text-[#9ca3af]">{f.size}</p>}
          </div>
          <button onClick={() => remove(i)} className="text-[#9ca3af] hover:text-red-500 ml-2 flex-shrink-0">×</button>
        </div>
      ))}

      <label className={`flex items-center gap-2 border border-dashed border-[#e5e7eb] rounded-[8px] px-3 py-3 cursor-pointer hover:border-[#3b5bdb] hover:bg-[#f0f4ff] transition-all ${uploading ? 'opacity-50' : ''}`}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 10V3M4 5.5L7 3l3 2.5" stroke="#9ca3af" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M1.5 11.5h11" stroke="#9ca3af" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        <span className="text-[12px] text-[#6b7280]">{uploading ? 'Enviando...' : 'Upload de arquivo'}</span>
        <input type="file" className="hidden" disabled={uploading} onChange={handleUpload} />
      </label>
    </div>
  )
}
