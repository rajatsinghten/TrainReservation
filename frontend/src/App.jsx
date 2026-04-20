import React from 'react';
import { TrainProvider } from './context/Context';
import Home from "./pages/Home"
import Results from "./pages/Results"
import Login from "./pages/Login"
import ProfileSetup from "./pages/ProfileSetup"
import Dashboard from "./pages/Dashboard"
import UserProfile from "./pages/UserProfile"
import ChatPage from "./pages/ChatPage"
import FriendsPage from "./pages/FriendsPage"
import { Routes, Route } from "react-router-dom";


function App() {
  return (
    <TrainProvider>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/results" element={<Results/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/profile-setup" element={<ProfileSetup/>}/>
          <Route path="/dashboard" element={<Dashboard/>}/>
          <Route path="/friends" element={<FriendsPage/>}/>
          <Route path="/user-profile/:userId" element={<UserProfile/>}/>
          <Route path="/chat/:userId" element={<ChatPage/>}/>
        </Routes>
      </div>
    </TrainProvider>
  );
}

export default App;
