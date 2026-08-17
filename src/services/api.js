// Mock API implementation for BridgeAble Frontend Demo

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Data Storage using localStorage if possible, else memory
let currentUser = JSON.parse(localStorage.getItem('bridgeableUser'));

// Sample initial data for fallback
let mockMeetings = [
    { id: 'mtg-101', title: 'Project Sync', host: 'Demo User', date: new Date().toISOString().split('T')[0], time: '14:00', duration: 45, participants: 4, status: 'Upcoming' },
    { id: 'mtg-102', title: 'Design Review', host: 'Alice Smith', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], time: '10:30', duration: 30, participants: 3, status: 'Upcoming' },
    { id: 'mtg-001', title: 'Client Onboarding', host: 'Demo User', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], time: '09:00', duration: 60, participants: 5, status: 'Past' },
];

export const api = {
    loginUser: async (email, password) => {
        await delay(800);
        if (!email || !password) throw new Error('Email and password required');
        const user = { id: 1, name: 'Demo User', email, prefs: 'All' };
        localStorage.setItem('bridgeableUser', JSON.stringify(user));
        currentUser = user;
        return user;
    },

    signupUser: async (userData) => {
        await delay(800);
        const user = { id: Date.now(), ...userData };
        localStorage.setItem('bridgeableUser', JSON.stringify(user));
        currentUser = user;
        return user;
    },

    logoutUser: () => {
        localStorage.removeItem('bridgeableUser');
        currentUser = null;
    },

    getCurrentUser: () => {
        return currentUser;
    },

    getUserProfile: async () => {
        await delay(300);
        return currentUser || { name: 'Demo User', email: 'demo@example.com', prefs: 'All' };
    },

    // ----------------------------------------------------
    // MEETING API MOCKS
    // ----------------------------------------------------

    getMeetings: async () => {
        await delay(500);
        return mockMeetings;
    },

    createMeeting: async (meetingData) => {
        await delay(800);
        const newMeeting = {
            id: `mtg-${Math.floor(Math.random() * 10000)}`,
            host: currentUser?.name || 'Demo User',
            status: 'Upcoming',
            ...meetingData
        };
        mockMeetings.push(newMeeting);
        return newMeeting;
    },

    joinMeeting: async (meetingId) => {
        await delay(1000);
        const meeting = mockMeetings.find(m => m.id === meetingId) || {
            id: meetingId,
            title: 'Instant Meeting',
            status: 'In Progress'
        };
        return meeting;
    },

    getParticipants: async (meetingId) => {
        await delay(400);
        return [
            { id: 1, name: currentUser?.name || 'You', isMe: true, isMuted: false, isCameraOn: true, isSpeaking: false },
            { id: 2, name: 'Ayushi Rathi', isMe: false, isMuted: true, isCameraOn: true, isSpeaking: false },
            { id: 3, name: 'Rahul', isMe: false, isMuted: false, isCameraOn: true, isSpeaking: true },
            { id: 4, name: 'Priya', isMe: false, isMuted: true, isCameraOn: false, isSpeaking: false }
        ];
    },

    getMessages: async (meetingId) => {
        await delay(500);
        return [
            { id: 1, sender: 'Ayushi Rathi', text: 'Can everyone hear me?', timestamp: '11:00 AM' },
            { id: 2, sender: 'Rahul', text: 'Yes!', timestamp: '11:01 AM' },
            { id: 3, sender: 'Priya', text: 'I can see the captions clearly.', timestamp: '11:02 AM' }
        ];
    },

    sendMessage: async (meetingId, messageText) => {
        await delay(200);
        return {
            id: Date.now(),
            sender: currentUser?.name || 'You',
            text: messageText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
    },

    getTranscript: async (meetingId) => {
        await delay(600);
        return [
            { time: '11:30 AM', sender: 'Rahul', text: "Let's discuss the project." },
            { time: '11:31 AM', sender: 'Ayushi Rathi', text: "I've completed the frontend." },
            { time: '11:32 AM', sender: 'Priya', text: "Great. I will handle the backend." }
        ];
    },

    saveAccessibilityPreferences: async (prefs) => {
        await delay(400);
        if (currentUser) {
            currentUser = { ...currentUser, ...prefs };
            localStorage.setItem('bridgeableUser', JSON.stringify(currentUser));
        }
        return currentUser;
    },

    translateSign: async (imageData) => {
        await delay(1500);
        return {
            text: "Hello everyone",
            confidence: "0.99"
        };
    }
};
