# Paigham UI

Paigham is a modern messaging platform built with Next.js 14 and Supabase, featuring SMS campaign management and contact list organization.

## Features

- Custom session management with secure cookie-based authentication
- Contact list management
  - CSV file upload and preview
  - Bulk contact import
  - Contact list organization
- SMS campaign creation and management
  - Dynamic message templates with variables
  - Campaign progress tracking
  - Real-time campaign status updates
  - Support for personalization variables (first_name, last_name, phone)
- Dashboard analytics
  - Total contacts tracking
  - Campaign statistics
  - Message delivery tracking
  - Credits balance monitoring
- Responsive UI built with
  - shadcn/ui components
  - Tailwind CSS
  - Lucide icons
  - Server-side rendering with Next.js 14

## Getting Started

### Prerequisites

- Node.js 18.17.0 or later
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up the Supabase database tables:

```sql
-- Companies table
create table companies (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  credits_balance integer default 0,
  created_at timestamp with time zone default now()
);

-- Contact Lists table
create table contact_lists (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references companies(id),
  name text not null,
  contact_count integer default 0,
  created_at timestamp with time zone default now()
);

-- Contacts table
create table contacts (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references companies(id),
  contact_list_id uuid references contact_lists(id) on delete cascade,
  first_name text,
  last_name text,
  phone text not null,
  created_at timestamp with time zone default now()
);

-- Campaigns table
create table campaigns (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references companies(id),
  contact_list_id uuid references contact_lists(id) on delete cascade,
  name text not null,
  message_template text not null,
  status text default 'draft',
  progress integer default 0,
  total_messages integer default 0,
  sent_messages integer default 0,
  failed_messages integer default 0,
  created_at timestamp with time zone default now()
);

-- Add appropriate RLS policies for each table
```

5. Run the development server:

```bash
npm run dev
# or
yarn dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `/app` - Next.js 14 app router pages and layouts
- `/components` - Reusable React components
  - `/ui` - shadcn/ui components
  - `/messages` - Campaign and contact list components
- `/lib` - Utility functions and configurations
  - `supabase.ts` - Supabase client configuration
  - `session.ts` - Custom session management

## Security Features

- Custom session management with HTTP-only cookies
- Row Level Security (RLS) policies for all database tables
- Company-based data isolation
- Secure authentication flow

## License

[MIT](LICENSE)
