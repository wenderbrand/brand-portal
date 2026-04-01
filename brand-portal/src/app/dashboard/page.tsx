'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Project = {
  id: string
  name: string
  logo_url: string | null
  slug: string | null
  is_published: boolean
  created_at: string
}

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    loadProjects()
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email || '')
    })
  }, [])

  const loadProjects = async () => {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
    setProjects(data || [])
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleProjectCreated = (project: Project) => {
    setShowModal(false)
    router.push(`/editor/${project.id}`)
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <header className="bg-white border-b border-[#e5e7eb] px-6 h-[52px] flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-[#3b5bdb] rounded-[5px]" />
          <span className="text-[13px] font-semibold text-[#0f0f0f] tracking-tight">Brand Portal</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-[#9ca3af] hidden sm:block">{userEmail}</span>
          <button onClick={handleLogout} className="btn-ghost text-[12px] py-1.5">Sair</button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-[960px] mx-auto px-6 py-10">
        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[20px] font-semibold text-[#0f0f0f] tracking-tight">Projetos</h1>
            <p className="text-[13px] text-[#6b7280] mt-0.5">
              {projects.length === 0 ? 'Nenhum projeto ainda' : `${projects.length} projeto${projects.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 1v11M1 6.5h11" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            Novo Projeto
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="w-10 h-10 bg-[#f3f4f6] rounded-[7px] mb-4" />
                <div className="h-4 bg-[#f3f4f6] rounded w-3/4 mb-2" />
                <div className="h-3 bg-[#f3f4f6] rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && projects.length === 0 && (
          <div className="text-center py-20">
            <div className="w-12 h-12 bg-[#f0f4ff] rounded-[10px] flex items-center justify-center mx-auto mb-4">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="#3b5bdb" strokeWidth="1.4"/>
                <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="#3b5bdb" strokeWidth="1.4"/>
                <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="#3b5bdb" strokeWidth="1.4"/>
                <rect x="11" y="11" width="7" height="7" rx="1.5" stroke="#3b5bdb" strokeWidth="1.4"/>
              </svg>
            </div>
            <p className="text-[14px] font-medium text-[#0f0f0f] mb-1">Nenhum projeto ainda</p>
            <p className="text-[13px] text-[#6b7280] mb-5">Crie seu primeiro portal de marca</p>
            <button onClick={() => setShowModal(true)} className="btn-primary">
              Criar primeiro projeto
            </button>
          </div>
        )}

        {/* Grid de projetos */}
        {!loading && projects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onDeleted={() => setProjects(ps => ps.filter(p => p.id !== project.id))}
              />
            ))}
            {/* Card novo projeto */}
            <button
              onClick={() => setShowModal(true)}
              className="card border-dashed flex flex-col items-center justify-center gap-2 p-5 min-h-[130px] hover:border-[#3b5bdb] hover:bg-[#f0f4ff] transition-all duration-150 group"
            >
              <div className="w-8 h-8 rounded-[6px] bg-[#f3f4f6] group-hover:bg-[#e0e9ff] flex items-center justify-center transition-colors">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1v12M1 7h12" stroke="#6b7280" strokeWidth="1.6" strokeLinecap="round" className="group-hover:stroke-[#3b5bdb] transition-colors"/>
                </svg>
              </div>
              <span className="text-[12px] text-[#9ca3af] group-hover:text-[#3b5bdb] transition-colors">Novo projeto</span>
            </button>
          </div>
        )}
      </main>

      {/* Modal criar projeto */}
      {showModal && (
        <CreateProjectModal
          onClose={() => setShowModal(false)}
          onCreated={handleProjectCreated}
        />
      )}
    </div>
  )
}

/* ── ProjectCard ─────────────────────────────────────────────── */
function ProjectCard({ project, onDeleted }: { project: Project; onDeleted: () => void }) {
  const supabase = createClient()

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(`Excluir "${project.name}"?`)) return
    await supabase.from('projects').delete().eq('id', project.id)
    onDeleted()
  }

  const date = new Date(project.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short',
  })

  return (
    <div className="card p-5 hover:border-[#d1d5db] hover:shadow-sm transition-all duration-150 group">
      {/* Logo / ícone */}
      <div className="w-10 h-10 rounded-[7px] bg-[#f3f4f6] overflow-hidden mb-4 flex items-center justify-center flex-shrink-0">
        {project.logo_url
          ? <img src={project.logo_url} alt={project.name} className="w-full h-full object-contain" />
          : <span className="text-[15px] font-bold text-[#9ca3af]">{project.name[0]?.toUpperCase()}</span>
        }
      </div>

      <h3 className="text-[13px] font-semibold text-[#0f0f0f] mb-1 truncate">{project.name}</h3>

      {/* Status */}
      <div className="flex items-center gap-1.5 mb-4">
        <span className={`w-1.5 h-1.5 rounded-full ${project.is_published ? 'bg-green-500' : 'bg-[#d1d5db]'}`} />
        <span className="text-[11px] text-[#6b7280]">
          {project.is_published ? 'Publicado' : 'Rascunho'} · {date}
        </span>
      </div>

      {/* Ações */}
      <div className="flex items-center gap-2">
        <Link href={`/editor/${project.id}`} className="btn-secondary flex-1 text-center text-[12px] py-1.5">
          Editar
        </Link>
        {project.is_published && project.slug && (
          <Link href={`/p/${project.slug}`} target="_blank"
            className="btn-ghost text-[12px] py-1.5 px-2.5"
            title="Abrir portal">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M7 1h4v4M11 1L5 7M3 2H2a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        )}
        <button onClick={handleDelete} className="btn-ghost text-[12px] py-1.5 px-2.5 hover:text-red-500" title="Excluir">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1.5 3h9M4.5 3V2h3v1M5 5.5v3M7 5.5v3M2 3l.5 7a1 1 0 001 .9h5a1 1 0 001-.9L10 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

/* ── Modal criar projeto ─────────────────────────────────────── */
function CreateProjectModal({ onClose, onCreated }: {
  onClose: () => void
  onCreated: (project: Project) => void
}) {
  const supabase = createClient()
  const [name, setName] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError('Nome obrigatório.'); return }
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Não autenticado.'); setLoading(false); return }

    let logo_url = null

    // Upload logo se selecionada
    if (logoFile) {
      const ext = logoFile.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('logos').upload(path, logoFile, { upsert: true })
      if (!uploadError) {
        const { data } = supabase.storage.from('logos').getPublicUrl(path)
        logo_url = data.publicUrl
      }
    }

    const { data, error: dbError } = await supabase
      .from('projects')
      .insert({ name: name.trim(), logo_url, user_id: user.id })
      .select()
      .single()

    if (dbError || !data) {
      setError('Erro ao criar projeto.')
      setLoading(false)
      return
    }

    // Criar conteúdo inicial das seções
    const sections = ['cover', 'logo', 'colors', 'typography', 'texts', 'files']
    await supabase.from('project_content').insert(
      sections.map(section => ({
        project_id: data.id,
        section,
        content: {},
      }))
    )

    onCreated(data)
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4"
      onClick={onClose}>
      <div className="bg-white rounded-[12px] w-full max-w-[400px] shadow-xl border border-[#e5e7eb]"
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e7eb]">
          <h2 className="text-[14px] font-semibold text-[#0f0f0f]">Novo projeto</h2>
          <button onClick={onClose} className="text-[#9ca3af] hover:text-[#374151] text-[18px] leading-none">×</button>
        </div>

        <form onSubmit={handleCreate} className="p-5 space-y-4">
          <div>
            <label className="label">Nome da marca *</label>
            <input
              value={name} onChange={e => { setName(e.target.value); setError('') }}
              placeholder="Ex: Acme Studio" autoFocus className="input-field"
            />
          </div>

          <div>
            <label className="label">Logo (opcional)</label>
            <label className="flex flex-col items-center justify-center gap-2 border border-dashed border-[#e5e7eb] rounded-[8px] p-5 cursor-pointer hover:border-[#3b5bdb] hover:bg-[#f0f4ff] transition-all">
              {logoPreview
                ? <img src={logoPreview} alt="preview" className="h-12 object-contain" />
                : <>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M10 13V4M6 7l4-4 4 4" stroke="#9ca3af" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3 16h14" stroke="#9ca3af" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                    <span className="text-[12px] text-[#9ca3af]">Clique para selecionar</span>
                  </>
              }
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
            </label>
          </div>

          {error && <p className="text-[12px] text-red-500">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Criando...' : 'Criar projeto →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
