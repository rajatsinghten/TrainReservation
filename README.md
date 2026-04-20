# Train Reservation System

A high-end railway reservation platform featuring an extreme minimalist, high-contrast black-and-white design system. This application streamlines the search and booking flow with real-time payment simulation using QR codes.

## Features

- Extreme minimalist flat design with zero-depth aesthetics
- Real-time train searching via external API integration
- Secure passenger reservation system with unique PNR generation
- Integrated QR-based payment simulation with live socket updates
- Dedicated user dashboard for managing bookings and payment states
- Professional authentication modal for seamless user intervention

## Quick Start (Local Setup)

### Prerequisites

- Node.js 18.0 or higher
- PostgreSQL database (Supabase recommended)

### 1. Installation

Clone the repository and install dependencies for both the server and client:

```bash
git clone https://github.com/rajatsinghten/TrainReservation.git
cd TrainReservation

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Database Configuration

Set up your Supabase database and sync the schema:

1. Create a `.env` file in the `server/` directory.
2. Add your `DATABASE_URL` (use the IPv4 Connection Pooler URL for best compatibility).
3. Run the Prisma migration:

```bash
cd server
npx prisma migrate dev --name init_system
```

### 3. Run the Application

Start the backend server:

```bash
cd server
npm run dev
```

The backend starts at `http://localhost:4000`.

Start the frontend client:

```bash
cd client
npm run dev
```

The application will be accessible at `http://localhost:5173`.

## Authentication and Environment Setup

Configure the following environment variables in `server/.env` and `client/.env`:

### Server Variables
- `DATABASE_URL`: Your PostgreSQL connection string.
- `JWT_SECRET`: A secure string for token signing.
- `PORT`: Port number (default 4000).
- `TRAIN_SEARCH_API_URL`: The external endpoint for train data.

### Client Variables
- `VITE_API_BASE_URL`: The URL of your deployed backend service.
- `VITE_SOCKET_URL`: The WebSocket endpoint (usually same as API base).

## Deployment

### Frontend (Vercel)

1. Import the repository into Vercel.
2. Select the `client` directory as the root.
3. Configure the `VITE_API_BASE_URL` environment variable to point to your live backend.

### Backend (Render)

1. Create a new Web Service on Render and connect the repository.
2. Set the root directory to `server`.
3. Use `npm install` as the build command and `node index.js` as the start command.
4. Add your `.env` variables (DATABASE_URL, JWT_SECRET) in the Render dashboard.

## Legal Disclaimer

This software is for educational and personal use only. The application simulates the ticket booking process and handles payment verification through a simulated workflow. Users are responsible for complying with the terms of service of any third-party APIs used for train data retrieval.
