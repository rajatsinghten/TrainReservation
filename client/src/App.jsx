import React from 'react';
import { TrainProvider } from './context/Context';
import Home from "./pages/Home"
import Results from "./pages/Results"
import Login from "./pages/Login"
import ProfileSetup from "./pages/ProfileSetup"
import Dashboard from "./pages/Dashboard"
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
        </Routes>
      </div>
    </TrainProvider>
  );
}

export default App;
