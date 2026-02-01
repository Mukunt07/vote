import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import LiveResults from './pages/LiveResults';
import AuditLog from './pages/AuditLog';
import SystemStatus from './pages/SystemStatus';
import Signup from './pages/Signup';
import { RequireAuth } from './components/ProtectedRoute';

import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from './lib/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';

function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasAdmin, setHasAdmin] = useState(null);
  const [adminCheckError, setAdminCheckError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkAdminExists = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'admins'));
        setHasAdmin(!snapshot.empty);
      } catch (err) {
        console.error("Failed to check admin status", err);
        setAdminCheckError(err.message);
      }
    };
    checkAdminExists();

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || 'Admin',
          photoURL: firebaseUser.photoURL,
        });
        setLoading(false);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  if (adminCheckError) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-rose-500 p-4">
        <p className="font-bold text-lg mb-2">System Error</p>
        <p className="text-sm mb-4">Failed to check admin status: {adminCheckError}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-slate-800 text-white rounded">Retry</button>
      </div>
    );
  }

  if (loading || hasAdmin === null) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-emerald-500">Loading Secure System...</div>;
  }

  // Wrapper for Layout to handle Active Page Highlighting based on Route
  const AppLayout = ({ children }) => {
    const activePage = location.pathname.substring(1) || 'dashboard';
    // If we are on root, default to dashboard
    const current = activePage === '' ? 'dashboard' : activePage;

    return (
      <MainLayout activePage={current} onNavigate={() => { }} onLogout={handleLogout} user={user}>
        {children}
      </MainLayout>
    );
  };

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route path="/signup" element={!hasAdmin ? <Signup onSignup={() => setHasAdmin(true)} /> : <Navigate to="/login" />} />

      {/* Protected Admin Routes */}
      <Route path="/" element={
        <RequireAuth user={user}>
          <AppLayout><Dashboard /></AppLayout>
        </RequireAuth>
      } />
      <Route path="/dashboard" element={
        <RequireAuth user={user}>
          <AppLayout><Dashboard /></AppLayout>
        </RequireAuth>
      } />
      <Route path="/results" element={
        <RequireAuth user={user}>
          <AppLayout><LiveResults /></AppLayout>
        </RequireAuth>
      } />
      <Route path="/audit" element={
        <RequireAuth user={user}>
          <AppLayout><AuditLog /></AppLayout>
        </RequireAuth>
      } />
      <Route path="/status" element={
        <RequireAuth user={user}>
          <AppLayout><SystemStatus /></AppLayout>
        </RequireAuth>
      } />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
