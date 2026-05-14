import React, { useState } from 'react';
import { AuthProvider } from './AuthContext';
import WelcomePage from './pages/WelcomePage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

export default function App() {
  const [page, setPage] = useState('welcome');
  const navigate = (p) => setPage(p);

  return (
    <AuthProvider>
      {page === 'welcome' && (
        <WelcomePage
          onGetStarted={() => navigate('dashboard')}
          onLogin={() => navigate('login')}
          onSignup={() => navigate('signup')}
          onNavigate={navigate}
        />
      )}
      {page === 'dashboard' && (
        <DashboardPage
          onBack={() => navigate('welcome')}
          onSignup={() => navigate('signup')}
          onLogin={() => navigate('login')}
          onNavigate={navigate}
        />
      )}
      {page === 'login' && (
        <LoginPage
          onBack={() => navigate('welcome')}
          onSignup={() => navigate('signup')}
          onSuccess={() => navigate('dashboard')}
          onNavigate={navigate}
        />
      )}
      {page === 'signup' && (
        <SignupPage
          onBack={() => navigate('welcome')}
          onLogin={() => navigate('login')}
          onSuccess={() => navigate('dashboard')}
          onNavigate={navigate}
        />
      )}
    </AuthProvider>
  );
}
