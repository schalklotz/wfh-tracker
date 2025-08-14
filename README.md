# WFH Tracker

A full-stack Next.js application to track and report on work from home (WFH) reasons and trends for teams.

## Tech Stack

- **Framework**: Next.js 14 with App Router and TypeScript
- **Database**: Prisma ORM with SQLite (local) / PostgreSQL (production)
- **Authentication**: NextAuth.js with email magic links
- **UI**: Tailwind CSS + shadcn/ui components
- **Charts**: Recharts
- **Deployment**: Vercel-ready

## Features

### Core Functionality
- 📊 Dashboard with summary statistics and recent entries
- 📝 WFH entry management (CRUD operations)
- 📈 Reports with filtering, charts, and export options
- 👥 Staff management (admin only)
- ⚙️ WFH reasons management (admin only)

### Authentication & Authorization
- Email-based magic link authentication
- Role-based access control (Admin/User)
- Users can only edit their own entries
- Admins have full access to all features

### Exports
- CSV export using papaparse
- JSON export (native)
- Excel export using xlsx package with proper formatting

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your configuration:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   
   # Email configuration (for production)
   EMAIL_SERVER_HOST="smtp.example.com"
   EMAIL_SERVER_PORT="587"
   EMAIL_SERVER_USER="your-email@example.com"
   EMAIL_SERVER_PASSWORD="your-email-password"
   EMAIL_FROM="noreply@yourcompany.com"
   ```

3. **Database Setup**
   ```bash
   # Push schema to database
   npm run db:push
   
   # Seed with sample data
   npm run db:seed
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see the application.

### Database Commands

```bash
npm run db:push     # Push schema changes to database
npm run db:seed     # Seed database with sample data
npm run db:migrate  # Create and run migrations
npm run db:reset    # Reset database and run migrations
npm run db:studio   # Open Prisma Studio
```

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes
│   ├── components/    # App-specific components
│   ├── providers/     # Context providers
│   └── [pages]/       # App router pages
├── components/
│   └── ui/           # Reusable UI components
├── lib/              # Utilities and configurations
└── types/            # TypeScript type definitions

prisma/
├── schema.prisma     # Database schema
└── seed.ts          # Database seeding script
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Set environment variables in Vercel dashboard
4. For production database, use Neon or Supabase PostgreSQL

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Your production URL
- `NEXTAUTH_SECRET` - Random secret key
- Email configuration variables

### Database Migration for Production

Update your production `DATABASE_URL` to PostgreSQL:
```env
DATABASE_URL="postgresql://username:password@hostname:port/database"
```

Then run:
```bash
npm run db:push
npm run db:seed
```

## Default Data

The application comes pre-seeded with:

### Staff Members
- Schalk Lotz
- Yvette Gottschalk
- Werner Cloete
- Olan Moodley
- Alexander Esterhuyse
- Iggy Maboshego
- Monray Jacobs
- Sauraav Jayrajh

### WFH Reasons
- Medical
- Family
- Contractors at Home
- Deliveries
- Load shedding
- Internet outage
- Focus work
- Other

### Sample Entries
Historic entries from June and August 2025 for testing and demonstration.

## API Endpoints

- `GET/POST /api/staff` - Staff management
- `GET/POST /api/reasons` - Reason management
- `GET/POST /api/entries` - WFH entry management
- All endpoints support filtering, validation, and role-based access

## Development Notes

- Uses server components where possible for better performance
- Client components only where interactivity is needed
- Zod validation on all API inputs
- Responsive design for mobile and desktop
- Loading states and error handling throughout

## License

MIT
