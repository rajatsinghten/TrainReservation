# TrainBuddy 🛤️🤝

A web app to help train travelers find and connect with companions on their journey.

---

## 🚀 Live Demo

- 🔗 [Live App](https://trainbuddy.onrender.com)
- 🎥 [Video Walkthrough](https://youtu.be/your-demo-link)

---

## ✨ Features

- **Train Search**: Real-time search by boarding station, destination, and date
- **Travel Status**: One-click listing/unlisting on journeys
- **Buddy Finder**: Discover fellow travelers on the same train
- **Friend Requests**: Send, accept, or reject connection invites
- **Real-time Chat**: WebSocket-powered messaging with travel buddies
- **User Profiles**: View bio, profession, and travel preferences
- **Secure Auth**: JWT-based login, bcrypt password hashing

---

## 🔍 Tech Stack

| Layer    | Technology                   |
| -------- | ---------------------------- |
| Frontend | React.js, Vite, Tailwind CSS |
| UI/UX    | Framer Motion, Tailwind CSS  |
| Backend  | Node.js, Express.js          |
| Database | MongoDB, Mongoose            |
| Realtime | Socket.io                    |
| Auth     | JWT, bcrypt                  |

---

## 🏗️ Installation & Setup

1. **Install dependencies**
   ```bash
   npm install
   npm install --prefix frontend
   ```
2. **Development mode**
   ```bash
   npm run dev
   npm run dev --prefix frontend
   ```
   The backend runs on `http://localhost:4000` and the frontend on `http://localhost:5173`.
3. **Production mode**
   ```bash
   npm run build
   npm start
   ```
   Build the frontend first, then start the backend with `NODE_ENV=production` set in the environment.

---

## 🔧 Configuration

Create a `.env` file in the project root for the backend:

```env
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>
PORT=4000
NODE_ENV=development
```

Frontend env files are already split by mode:

- [frontend/.env.development](frontend/.env.development) for local development
- [frontend/.env.production](frontend/.env.production) for production builds

> **Tip:** Keep `NODE_ENV=development` locally and `NODE_ENV=production` in deployment.

---

## Usage Guide

### Searching for Trains
1. Enter your boarding station, destination station, and travel date
2. Click the "Search Trains" button to view available trains

### Listing Yourself on a Train
1. Find your train in search results
2. Select Train Class of suitable train from the results.
3. Click the "List Yourself" button to make yourself discoverable to other travelers
4. To remove yourself from a train, click the "Unlist Yourself" button

### Finding Travel Buddies
1. Enter the same search criteria (boarding station, destination station, date)
2. Click the "Find Buddy" button
3. View a list of travelers who will be on the same journey
4. Send friend requests to connect with potential travel companions

### Real-time Chat
1. Once connected with a travel buddy, navigate to their profile
2. Click "Start Chat" to begin a real-time conversation
3. Messages are delivered instantly using WebSocket technology
4. Chat history is preserved for future reference

### Managing Friend Requests
1. View incoming friend requests in your dashboard
2. Accept or reject requests from other travelers
3. Remove friends from your connections if needed

## 📸 Screenshots

&#x20;*Train search with autocomplete and date picker*

&#x20;*Finding and chatting with travel companions*

---

## 🧠 What I Learned

- Integrated Indian Railway API for live train data
- Managed WebSocket connections for real-time chat
- Implemented JWT auth with role-based route protection

---

## 🗂️ Project Structure

```
TrainBuddy/
├── package.json                 # Root package.json with build scripts
├── README.md                    # Project documentation
├── requirements.txt             # Python dependencies (if any)
├── .env                        # Environment variables
├── .gitignore                  # Git ignore file
├── backend/                    # Backend server code
│   ├── index.js               # Main server file
│   ├── package.json           # Backend dependencies
│   ├── assets/                # Static assets
│   │   └── railway_stations.json
│   ├── config/                # Configuration files
│   │   └── db.js             # Database connection
│   ├── controllers/           # Route controllers
│   │   ├── findTrains.js
│   │   ├── friendController.js
│   │   ├── messageController.js
│   │   ├── stationController.js
│   │   └── userController.js
│   ├── middleware/            # Custom middleware
│   │   └── authMiddleware.js
│   ├── models/               # Database models
│   │   ├── FriendRequest.js
│   │   ├── Message.js
│   │   └── User.js
│   ├── routes/               # API routes
│   │   ├── findTrainRoute.js
│   │   ├── friendRoute.js
│   │   ├── messageRoute.js
│   │   ├── stationRoute.js
│   │   └── userRoute.js
│   └── utils/                # Utility functions
│       └── railwayStations.js
└── frontend/                 # Frontend React app
    ├── package.json          # Frontend dependencies
    ├── vite.config.js        # Vite configuration
    ├── tailwind.config.js    # Tailwind CSS config
    ├── index.html            # Entry HTML file
    ├── src/
    │   ├── App.jsx           # Main App component
    │   ├── main.jsx          # Entry point
    │   ├── index.css         # Global styles
    │   ├── components/       # Reusable components
    │   │   ├── layout/       # Layout components
    │   │   ├── common/       # Common UI components
    │   │   ├── train-search/ # Train search components
    │   │   └── buddy-system/ # Buddy system components
    │   ├── pages/            # Page components
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── ChatPage.jsx
    │   │   ├── FriendsPage.jsx
    │   │   ├── UserProfile.jsx
    │   │   └── ProfileSetup.jsx
    │   ├── context/          # React Context
    │   │   └── Context.jsx
    │   └── utils/            # Utility functions
    │       └── axios.js      # API configuration
    └── public/               # Static assets
        ├── vite.svg
        └── bg.png
```

---

## 📄 License

ISC License. See [package.json](./package.json) for details.

---

## 🤝 Contributing

1. Fork the repo
2. Create a branch (`git checkout -b feature/your-feature`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 🛠️ API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login a user
- `POST /api/users/logout` - Logout a user

### User Profile
- `GET /api/users/me` - Get current user's profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/travel-status` - Update travel status

### Train Search
- `GET /api/trains` - Search for trains

### Buddy Finder
- `GET /api/users/travel-buddies` - Find travelers on the same route

### Friend Requests
- `POST /api/friends/request` - Send a friend request
- `GET /api/friends/requests` - Get all friend requests
- `POST /api/friends/respond` - Respond to a friend request
- `DELETE /api/friends/remove` - Remove a friend

### Messaging
- `GET /api/messages/:userId` - Get chat history with a user
- `POST /api/messages/send` - Send a message (HTTP alternative)
- `PUT /api/messages/:userId/read` - Mark messages as read

### Real-time Features (WebSocket)
- `joinChat` - Join a chat room for real-time messaging
- `sendMessage` - Send a message in real-time
- `receiveMessage` - Receive messages from other users
- `userOnline`/`userOffline` - User presence notifications

---

