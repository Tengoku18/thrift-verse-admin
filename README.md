# ThriftVerse Admin Portal

A Next.js admin portal with Supabase authentication, custom theme, and shadcn/ui components.

## Features

- 🔐 **Supabase Authentication** - Secure admin login with email/password
- 🎨 **Custom Theme** - Warm, earthy color palette
- 🔤 **Custom Fonts** - Nunito Sans (body) and Folito (headings)
- 🧩 **shadcn/ui Components** - Pre-built, customizable UI components
- 🛡️ **Protected Routes** - Middleware-based route protection
- 📱 **Responsive Design** - Mobile-first responsive layouts

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase Database

Before running the app, you need to set up your database tables and triggers.

**See the detailed guide:** [supabase/README.md](./supabase/README.md)

Quick steps:
1. Go to your Supabase project's SQL Editor
2. Run the migration in `supabase/migrations/001_profiles_setup.sql`
3. Create your first admin user in Authentication > Users
4. The profile will be automatically created!

### 3. Configure Environment Variables

Create a `.env.local` file:

```bash
cp .env.example .env.local
```

Update with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ADMIN_EMAILS=admin@thriftverse.com
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Custom Theme Colors

- **Primary:** `#3B2F2F` (Charcoal)
- **Secondary:** `#D4A373` (Tan)
- **Background:** `#FAF7F2` (Cream)
- **Accent 1:** `#6B705C` (Olive)
- **Accent 2:** `#CB997E` (Terracotta)

## Project Structure

```
src/
├── _components/ui/     # shadcn/ui components
├── actions/            # Server actions
├── app/                # Pages and layouts
├── config/             # Configuration
├── lib/                # Utilities
└── middleware.ts       # Route protection
```

## Adding shadcn Components

```bash
npx shadcn@latest add [component-name]
```
