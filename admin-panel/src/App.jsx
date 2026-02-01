import React, { useState, useEffect } from 'react';
import MainLayout from './layout/MainLayout';
import Dashboard from './pages/Dashboard';

import Login from './pages/Login';
import LiveResults from './pages/LiveResults';
import AuditLog from './pages/AuditLog';
import SystemStatus from './pages/SystemStatus';

import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from './lib/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import Signup from './pages/Signup';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasAdmin, setHasAdmin] = useState(null); // null=loading, true=exists, false=signup needed
  const [adminCheckError, setAdminCheckError] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');

  useEffect(() => {
    const checkAdminExists = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'admins'));
        setHasAdmin(!snapshot.empty);
      } catch (err) {
        console.error("Failed to check admin status", err);
        // Show error to user to help debug "No Signup Found"
        setAdminCheckError(err.message);
      }
    };
    checkAdminExists();

    // 1. Check for Firebase Session (Google Auth)
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || 'Admin',
          photoURL: firebaseUser.photoURL,
          isMock: false
        });
        setLoading(false);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    if (userData.isMock) {
      localStorage.setItem('admin_session', JSON.stringify(userData));
    }
  };

  const handleLogout = async () => {
    try {
      if (user?.isMock) {
        localStorage.removeItem('admin_session');
      } else {
        await signOut(auth);
      }
      setUser(null);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  if (adminCheckError) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-rose-500 p-4">
        <p className="font-bold text-lg mb-2">System Error</p>
        <p className="text-sm mb-4">Failed to verify system status: {adminCheckError}</p>
        <div className="flex gap-4">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700"
          >
            Retry
          </button>
          <button
            onClick={() => setHasAdmin(false)}
            className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-500"
          >
            Force Signup (Setup)
          </button>
        </div>
        <p className="mt-6 text-xs text-slate-500 max-w-md text-center">
          <strong>Note:</strong> This error usually means Firestore Security Rules are blocking public read access to the 'admins' collection.
          Update your rules to allow <code>read</code> on <code>/admins</code>.
        </p>
      </div>
    );
  }

  if (loading || hasAdmin === null) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-emerald-500">Loading...</div>;
  }

  if (!user) {
    if (!hasAdmin) {
      return <Signup onSignup={() => setHasAdmin(true)} />;
    }
    return <Login onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'results': return <LiveResults />;
      case 'audit': return <AuditLog />;
      case 'status': return <SystemStatus />;
      default: return <Dashboard />;
    }
  };

  return (
    <MainLayout activePage={activePage} onNavigate={setActivePage} onLogout={handleLogout} user={user}>
      {renderPage()}
    </MainLayout>
  );
}

export default App;
