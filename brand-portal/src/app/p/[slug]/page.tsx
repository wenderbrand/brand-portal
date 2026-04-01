import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CopyButton from './CopyButton'

type Params = { params: { slug: string } }

export async function generateMetadata({ params }: Params) {
  const supabase = createClient()
  const { data } = await supabase
    .from('projects')
    .select('name')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single()
  return { title: data ? `${data.name} — Brand Portal` : 'Brand Portal' }
}

export default async function PublicPortalPage({ params }: Params) {
  const supabase = createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single()

  if (!project) notFound()

  const { data: contentRows } = await supabase
    .from('project_content')
    .select('*')
    .eq('project_id', project.id)

  const content: Record<string, any> = {}
  contentRows?.forEach(row => { content[row.section] = row.content || {} })

  const cover      = content.cover      || {}
  const logo       = content.logo       || {}
  const colors     = content.colors     || {}
  const typography = content.typography || {}
  const texts      = content.texts      || {}
  const files      = content.files      || {}

  const logoUrl = logo.primary_url || project.logo_url
  const brandName = cover.title || project.name

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <header className="bg-white border-b border-[#e5e7eb] sticky top-0 z-10">
        <div className="max-w-[720px] mx-auto px-6 h-[56px] flex items-center gap-4">
          {logoUrl && (
            <img src={logoUrl} alt={brandName} className="h-7 object-contain" />
          )}
          <span className="text-[15px] font-semibold text-[#0f0f0f] tracking-tight">{brandName}</span>
          <div className="ml-auto">
            <span className="text-[11px] bg-[#f3f4f6] text-[#6b7280] rounded-full px-2.5 py-1">
              Brand Portal
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[720px] mx-auto px-6 py-12 space-y-12">

        {/* Sobre */}
        {cover.description && (
          <section>
            <SectionLabel>Sobre</SectionLabel>
            <p className="text-[14px] text-[#374151] leading-relaxed">{cover.description}</p>
          </section>
        )}

        {/* Logotipo */}
        {(logoUrl || (logo.variations && logo.variations.length > 0)) && (
          <section>
            <SectionLabel>Logotipo</SectionLabel>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {logoUrl && (
                <div className="border border-[#e5e7eb] rounded-[9px] p-4 flex items-center justify-center bg-white aspect-[4/3]">
                  <img src={logoUrl} alt="Logo principal" className="max-h-16 object-contain" />
                </div>
              )}
              {logo.variations?.map((url: string, i: number) => (
                <div key={i} className="border border-[#e5e7eb] rounded-[9px] p-4 flex items-center justify-center bg-white aspect-[4/3]">
                  <img src={url} alt={`Variação ${i + 1}`} className="max-h-16 object-contain" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Cores */}
        {colors.items && colors.items.length > 0 && (
          <section>
            <SectionLabel>Cores</SectionLabel>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {colors.items.map((c: { hex: string; name: string }, i: number) => (
                <div key={i} className="border border-[#e5e7eb] rounded-[9px] overflow-hidden bg-white">
                  <div className="h-16" style={{ background: c.hex }} />
                  <div className="px-3 py-2.5 flex items-center justify-between">
                    <div>
                      <p className="text-[12px] font-medium text-[#0f0f0f]">{c.name || 'Cor'}</p>
                      <p className="text-[11px] text-[#6b7280] font-mono">{c.hex}</p>
                    </div>
                    <CopyButton text={c.hex} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tipografia */}
        {typography.items && typography.items.length > 0 && (
          <section>
            <SectionLabel>Tipografia</SectionLabel>
            <div className="space-y-2">
              {typography.items.map((t: { family: string; description: string }, i: number) => (
                <div key={i} className="border border-[#e5e7eb] rounded-[9px] px-4 py-3.5 bg-white flex items-start justify-between">
                  <div>
                    <p className="text-[15px] font-semibold text-[#0f0f0f] tracking-tight">{t.family}</p>
                    {t.description && <p className="text-[12px] text-[#6b7280] mt-0.5">{t.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Textos */}
        {texts.body && (
          <section>
            <SectionLabel>Texto</SectionLabel>
            <div className="bg-white border border-[#e5e7eb] rounded-[9px] px-5 py-4">
              <p className="text-[13px] text-[#374151] leading-relaxed whitespace-pre-wrap">{texts.body}</p>
            </div>
          </section>
        )}

        {/* Arquivos */}
        {files.items && files.items.length > 0 && (
          <section>
            <SectionLabel>Arquivos</SectionLabel>
            <div className="space-y-2">
              {files.items.map((f: { name: string; url: string; size?: string }, i: number) => (
                <a key={i} href={f.url} download target="_blank"
                  className="flex items-center justify-between border border-[#e5e7eb] rounded-[9px] px-4 py-3 bg-white hover:border-[#3b5bdb] hover:bg-[#f0f4ff] transition-all group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-[6px] bg-[#f3f4f6] flex items-center justify-center flex-shrink-0">
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <path d="M2 2h6l3 3v7H2V2z" stroke="#9ca3af" strokeWidth="1.2" strokeLinejoin="round"/>
                        <path d="M8 2v3h3" stroke="#9ca3af" strokeWidth="1.2" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] text-[#374151] truncate group-hover:text-[#3b5bdb]">{f.name}</p>
                      {f.size && <p className="text-[11px] text-[#9ca3af]">{f.size}</p>}
                    </div>
                  </div>
                  <span className="text-[12px] text-[#6b7280] group-hover:text-[#3b5bdb] ml-3 flex-shrink-0">↓ Download</span>
                </a>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e5e7eb] py-6 mt-16">
        <div className="max-w-[720px] mx-auto px-6">
          <p className="text-[11px] text-[#9ca3af] text-center">
            Criado com <span className="text-[#3b5bdb]">Brand Portal</span>
          </p>
        </div>
      </footer>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wider mb-4">{children}</p>
  )
}
