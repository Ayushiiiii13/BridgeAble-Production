import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Meetings from './pages/Meetings';
import CreateMeeting from './pages/CreateMeeting';
import JoinMeeting from './pages/JoinMeeting';
import MeetingRoom from './pages/MeetingRoom';
import Calendar from './pages/Calendar';
import Contacts from './pages/Contacts';
import History from './pages/History';
import Profile from './pages/Profile';
import Transcript from './pages/Transcript';
import { api } from './services/api';

const ProtectedRoute = ({ children }) => {
    const user = api.getCurrentUser();
    if (!user) {
        return <Navigate to="/login" />;
    }
    return children;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Protected Routes */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/meetings" element={<ProtectedRoute><Meetings /></ProtectedRoute>} />
                <Route path="/meetings/create" element={<ProtectedRoute><CreateMeeting /></ProtectedRoute>} />
                <Route path="/meetings/join" element={<ProtectedRoute><JoinMeeting /></ProtectedRoute>} />
                <Route path="/meeting/:meetingId" element={<ProtectedRoute><MeetingRoom /></ProtectedRoute>} />
                <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
                <Route path="/contacts" element={<ProtectedRoute><Contacts /></ProtectedRoute>} />
                <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
                <Route path="/transcript/:meetingId" element={<ProtectedRoute><Transcript /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            </Routes>
        </BrowserRouter>
    )
}

export default App;
