# Brand Portal

MVP de micro SaaS para criar e compartilhar portais de identidade de marca com clientes.

## Stack

- **Next.js 14** (App Router)
- **Supabase** (Auth, Database, Storage)
- **Tailwind CSS**
- **TypeScript**

## Rotas

| Rota | Descrição |
|------|-----------|
| `/login` | Login com email + senha |
| `/register` | Cadastro |
| `/forgot-password` | Recuperação de senha |
| `/dashboard` | Lista de projetos do usuário |
| `/editor/[id]` | Editor do portal (3 colunas) |
| `/p/[slug]` | Portal público (sem login) |

## Setup

### 1. Clonar e instalar

```bash
npm install
```

### 2. Variáveis de ambiente

Copie `.env.local.example` para `.env.local` e preencha:

```
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_ANON_KEY
```

Encontre esses valores em: **Supabase Dashboard → Settings → API**

### 3. Banco de dados

No **Supabase Dashboard → SQL Editor**, execute o arquivo:

```
supabase/schema.sql
```

Isso cria as tabelas `projects`, `project_content`, `assets` com RLS ativado.

### 4. Storage

No **Supabase Dashboard → Storage**, crie dois buckets:

| Bucket | Público |
|--------|---------|
| `logos` | ✅ Sim |
| `assets` | ✅ Sim |

Para cada bucket, adicione as policies em **Storage → Policies**:

**Policy de upload (INSERT):**
- Nome: `auth_upload`
- Roles: `authenticated`
- Expression: `true`

**Policy de leitura (SELECT):**
- Nome: `public_read`
- Roles: `anon`, `authenticated`
- Expression: `true`

### 5. Rodar em desenvolvimento

```bash
npm run dev
```

Acesse: `http://localhost:3000`

### 6. Deploy (Vercel)

```bash
vercel --prod
```

Configure as variáveis de ambiente no painel da Vercel.

## Fluxo de uso

1. **Cadastro/Login** → `/register` ou `/login`
2. **Dashboard** → criar projeto com nome + logo opcional
3. **Editor** → preencher seções (Capa, Cores, Tipografia, Textos, Arquivos)
4. **Publicar** → gera slug único, URL pública `/p/[slug]`
5. **Compartilhar** → copiar link e enviar ao cliente

## Estrutura de pastas

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              # redirect → /dashboard ou /login
│   ├── globals.css
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── forgot-password/page.tsx
│   ├── dashboard/page.tsx
│   ├── editor/[id]/page.tsx
│   └── p/[slug]/
│       ├── page.tsx          # portal público
│       └── CopyButton.tsx
├── lib/
│   └── supabase/
│       ├── client.ts         # browser client
│       └── server.ts         # server client
└── middleware.ts             # proteção de rotas
```

## Banco de dados

### `projects`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users |
| name | text | Nome da marca |
| logo_url | text | URL do logo |
| slug | text | Slug único para URL pública |
| is_published | boolean | Se está publicado |
| created_at | timestamptz | Data de criação |

### `project_content`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | PK |
| project_id | uuid | FK → projects |
| section | text | cover / logo / colors / typography / texts / files |
| content | jsonb | Dados da seção |

### `assets`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | PK |
| project_id | uuid | FK → projects |
| file_url | text | URL do arquivo |
| file_name | text | Nome do arquivo |
