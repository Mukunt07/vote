import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MobileEntry from './pages/MobileEntry';
import FaceScan from './pages/FaceScan';
import VotingScreen from './pages/VotingScreen';
import Success from './pages/Success';
import AlreadyVoted from './pages/AlreadyVoted';
import { RequireMobile, RequireBiometrics } from './components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MobileEntry />} />

        {/* Protected Routes */}
        <Route
          path="/face-scan"
          element={
            <RequireMobile>
              <FaceScan />
            </RequireMobile>
          }
        />
        <Route
          path="/vote"
          element={
            <RequireBiometrics>
              <VotingScreen />
            </RequireBiometrics>
          }
        />

        <Route path="/success" element={<Success />} />
        <Route path="/already-voted" element={<AlreadyVoted />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
