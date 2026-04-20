# Train Reservation System

A professional railway reservation platform built with Node.js, React, and PostgreSQL.

## Project Structure

- **`/client`**: React (Vite) frontend application.
- **`/server`**: Node.js Express backend with Prisma ORM and Supabase.

---

## Getting Started

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL (Supabase recommended)

### 2. Server Setup
```bash
cd server
npm install
# Ensure your .env is configured with DATABASE_URL
npx prisma generate
npm run dev
```

### 3. Client Setup
```bash
cd client
npm install
npm run dev
```

---

## Features
- **Minimalist Design**: High-contrast, extreme-reduction B&W aesthetic.
- **Real-time Payments**: Integrated socket-based payment simulation with QR codes.
- **Secure Auth**: JWT-based authentication system.
- **Reservations**: Full CRUD for train bookings.

## Deployment
- **Frontend**: Deploy the `/client` directory to **Vercel**.
- **Backend**: Deploy the `/server` directory to **Render** or Railway.
