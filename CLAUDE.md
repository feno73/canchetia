# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **soccer field reservation application** (in Spanish: "canchetia") that connects soccer players with sports complexes offering field rentals. The project is currently in its initial planning phase with comprehensive functional and technical documentation.

## Tech Stack (Planned)

- **Backend & Frontend**: Next.js (full-stack framework)
- **Database & Authentication**: Supabase (PostgreSQL + Auth)
- **Styling**: Tailwind CSS with **Preline UI** components
- **Font**: Poppins
- **Payment Integration**: Mercado Pago (primary for Argentina market)

## Visual Development

### Design Principles
- Comprehensive design checklist in `/context/design-principles.md`
- Brand style guide in `/context/style-guide.md`
- When making visual (front-end, UI/UX) changes, always refer to these files for guidance

### Quick Visual Check
IMMEDIATELY after implementing any front-end change:
1. **Identify what changed** - Review the modified components/pages
2. **Navigate to affected pages** - Use `mcp__playwright__browser_navigate` to visit each changed view
3. **Verify design compliance** - Compare against `/context/design-principles.md` and `/context/style-guide.md`
4. **Validate feature implementation** - Ensure the change fulfills the user's specific request
5. **Check acceptance criteria** - Review any provided context files or requirements
6. **Capture evidence** - Take full page screenshot at desktop viewport (1440px) of each changed view
7. **Check for errors** - Run `mcp__playwright__browser_console_messages`

This verification ensures changes meet design standards and user requirements.

### Comprehensive Design Review
Invoke the `@agent-design-review` subagent for thorough design validation when:
- Completing significant UI/UX features
- Before finalizing PRs with visual changes
- Needing comprehensive accessibility and responsiveness testing

## Color Palette

The application uses a defined color scheme:

- **Argentinian Blue**: `#5aa9e6` (primary brand color)
- **Cinereous**: `#987d7c` (secondary)
- **Black**: `#020202` (text/contrast)
- **Fern Green**: `#50723c` (accent)
- **Light Green**: `#a1e887` (success/highlight)

## Core Entities & Data Model

The application centers around these main entities:

### User Management

- **Usuario**: Players and complex administrators with role-based access
- Authentication via Supabase (email/social login)

### Sports Complex Management

- **Complejo**: Physical locations with multiple fields
- **Cancha**: Individual soccer fields (5v5, 7v7, 11v11) with different surfaces
- **Servicio**: Additional amenities (parking, grill, locker rooms)

### Booking System

- **Reserva**: Core booking entity linking users to fields with time slots
- **Pago**: Payment processing (Mercado Pago integration)
- **Reseña**: User reviews and ratings for complexes

## Key Functional Areas

### For Players

1. **Search & Discovery**: Location-based search with filters (field type, surface, amenities)
2. **Booking Flow**: Calendar-based reservation with secure payment processing
3. **Profile Management**: Booking history, personal data, preferences

### For Complex Administrators

1. **Dashboard**: Revenue analytics, occupancy rates, booking overview
2. **Field Management**: Add/edit fields, pricing, availability schedules
3. **Booking Management**: Manual reservations, calendar view, customer communication

## Development Commands

### Build & Development
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application  
- `npm run start` - Start production server
- `npm run type-check` - Check TypeScript types

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check Prettier formatting

## Development Notes

- **Sprint 1.1 completed**: Base project setup with Next.js 14, TypeScript, Tailwind CSS, and Supabase integration
- All functional requirements documented in `rules/functional-definition.md` and technical specs in `rules/technical-definition.md` 
- When implementing, prioritize mobile-first responsive design
- Ensure real-time availability updates to prevent double bookings
- Implement proper role-based access control for player vs. administrator features
- Follow Argentina-specific payment regulations for Mercado Pago integration

## Project Structure

```
canchetia/
├── src/
│   ├── app/                    # App Router (Next.js 14)
│   │   ├── (auth)/            # Grupo de rutas de auth (ready for Sprint 2.1)
│   │   ├── (dashboard)/       # Panel de admin (ready for Sprint 2.2)
│   │   ├── buscar/           # Búsqueda de canchas (ready for Sprint 2.3)
│   │   ├── reservar/         # Proceso de reserva (ready for Sprint 2.4)
│   │   ├── globals.css       # ✅ Global styles with brand colors
│   │   ├── layout.tsx        # ✅ Root layout with Poppins font
│   │   └── page.tsx          # ✅ Homepage (to be customized)
│   ├── components/
│   │   ├── ui/               # Componentes base (Tailwind + custom)
│   │   ├── forms/            # Formularios específicos
│   │   └── layout/           # Headers, footers, nav
│   ├── lib/
│   │   ├── supabase/         # ✅ Cliente y queries configurado
│   │   ├── mercadopago/      # Integración de pagos (Fase 3)
│   │   └── utils/            # ✅ Utilidades generales
│   ├── types/                # ✅ Definiciones TypeScript completas
│   └── middleware.ts         # ✅ Auth middleware configurado
├── rules/                    # ✅ Documentación funcional y técnica
├── .env.local               # ✅ Variables de entorno
├── tailwind.config.ts       # ✅ Configuración con brand colors
└── package.json             # ✅ Scripts y dependencias
```

## Database Design

The system uses PostgreSQL via Supabase with key relationships:

- Users can be players or complex administrators
- Complexes contain multiple fields (canchas)
- Reservations link users to specific fields with time slots
- Payments are tied to reservations
- Reviews connect users to complexes they've visited

When implementing, ensure proper foreign key constraints and indexes for performance on date/location-based queries.

