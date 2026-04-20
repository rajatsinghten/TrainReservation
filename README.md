# Train Reservation System 🛤️✅

A professional, streamlined train reservation system that allows users to search for trains, book tickets in various classes, and confirm payments via a real-time QR code simulation.

## 🚀 Key Features

- **Advanced Search**: Find trains based on origin, destination, and travel date with intelligent station matching.
*   **Secure Booking**: Initiate reservations with unique PNR generation.
- **Real-time QR Payment**: 
  - Generates unique QR tokens for each booking.
  - Listen for instant payment confirmation via WebSockets.
  - One-click simulation for end-to-end testing.
- **Dashboard**: Track all your bookings, statuses (Confirmed, Pending, Cancelled), and PNR details in one place.
- **Modern UI**: Built with a premium obsidian-style design, glassmorphism, and smooth animations.

## 🛠️ Technology Stack

- **Frontend**: React, TailwindCSS, Socket.io-client, Axios, Lucide Icons.
- **Backend**: Node.js, Express, Socket.io.
- **Database**: PostgreSQL with Prisma ORM.
- **Tools**: Prisma Studio, QR Code API.

## 📦 Getting Started

### 1. Prerequisites
- Node.js (v16+)
- PostgreSQL (running locally or on a cloud provider like Supabase/Aiven)

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/train_reservation"
   JWT_SECRET="your-secret-key"
   PORT=4000
   ```
4. Run Prisma migrations:
   ```bash
   npx prisma migrate dev
   ```
5. Start the server:
   ```bash
   npm start
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 🔄 How the QR Payment Works

1. Search for a train and click **"Book Ticket"**.
2. A unique **QR Code** is generated for your transaction.
3. To simulate a payment scan, use the link provided in the modal or hit the endpoint:
   `GET /api/bookings/pay/:qrToken`
4. The server emits a `paymentVerified` event via Socket.io.
5. The frontend UI updates instantly and redirects you to the Dashboard.

## ⚖️ License
MIT
