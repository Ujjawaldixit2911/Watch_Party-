import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RoomProvider } from './context/RoomContext';
import { LandingPage } from './pages/LandingPage';
import { CreateRoomPage } from './pages/CreateRoomPage';
import { JoinRoomPage } from './pages/JoinRoomPage';
import { RoomPage } from './pages/RoomPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { Toaster } from 'sonner';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <RoomProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/create" element={<CreateRoomPage />} />
          <Route path="/join" element={<JoinRoomPage />} />
          <Route path="/join/:roomCode" element={<JoinRoomPage />} />
          <Route path="/room/:roomCode" element={<RoomPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
        <Toaster
          position="top-right"
          theme="dark"
          toastOptions={{
            style: {
              background: '#18181B',
              border: '1px solid #27272A',
              color: '#F4F4F5',
            },
          }}
        />
      </RoomProvider>
    </BrowserRouter>
  );
};
