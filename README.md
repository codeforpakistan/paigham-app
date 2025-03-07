# Paigham UI

Paigham is a modern email and SMS marketing platform built with Next.js and Supabase.

## Features

- Email campaign creation and management
- SMS campaign creation and management
- Contact management
- Campaign analytics
- User and company management
- Responsive UI built with shadcn/ui

## Getting Started

### Prerequisites

- Node.js 18.17.0 or later
- npm or yarn
- Supabase account
- SendGrid account (for email functionality)

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
SENDGRID_API_KEY=your_sendgrid_api_key
DEFAULT_SENDER_EMAIL=your_default_sender_email
DEFAULT_SENDER_NAME=your_default_sender_name
```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Email Configuration

For email functionality to work properly, you need to:

1. Set up a SendGrid account
2. Create an API key with appropriate permissions
3. Set the `SENDGRID_API_KEY` environment variable
4. Optionally set `DEFAULT_SENDER_EMAIL` and `DEFAULT_SENDER_NAME`

For more details, see [Email Configuration Guide](docs/email-configuration.md).

## Database Setup

On first run, navigate to `/setup` to initialize the required database tables.

## Documentation

- [Email Configuration Guide](docs/email-configuration.md)

## License

[MIT](LICENSE)
