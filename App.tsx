
import React, { useState, useEffect } from 'react';
import { Home, Login, Signup, ForgotPassword, ResetPassword } from './pages/PublicViews';
import { ClientDashboard, InitialFormPage, AppointmentBooking } from './pages/ClientViews';
import { AdminDashboard } from './pages/AdminViews';
import { User } from './types';
import { db } from './services/db';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState<User | null>(null);
  const [resetEmailContext, setResetEmailContext] = useState<string>('');

  const isStaff = (user: User | null) => {
      return user && ['superadmin', 'worker', 'project_manager', 'inspector'].includes(user.role);
  }

  useEffect(() => {
    const loadSession = async () => {
      const storedUser = localStorage.getItem('atelier_session');
      if (storedUser) {
          const u = JSON.parse(storedUser);
          setUser(u);
          if (currentPage === 'home') {
               // Smart redirection on session restore
               if (isStaff(u)) {
                   setCurrentPage('admin-dashboard');
               } else {
                   try {
                     const projects = await db.getProjects(u.id, u.role);
                     setCurrentPage(projects.length === 0 ? 'initial-form' : 'client-dashboard');
                   } catch (error) {
                     console.error('Error loading projects:', error);
                     setCurrentPage('client-dashboard');
                   }
               }
          }
      }
    };
    loadSession();
  }, []);

  const handleLogin = async (u: User) => {
    setUser(u);
    localStorage.setItem('atelier_session', JSON.stringify(u));
    
    if (isStaff(u)) {
        setCurrentPage('admin-dashboard');
    } else {
        // For clients: if they have no projects, they MUST complete the initial form
        try {
          const projects = await db.getProjects(u.id, u.role);
          setCurrentPage(projects.length === 0 ? 'initial-form' : 'client-dashboard');
        } catch (error) {
          console.error('Error loading projects:', error);
          setCurrentPage('client-dashboard');
        }
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('atelier_session');
    setCurrentPage('home');
  };

  const navigateTo = (page: string) => setCurrentPage(page);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home navigateTo={navigateTo} />;
      case 'login':
        return <Login onLogin={handleLogin} navigateTo={navigateTo} />;
      case 'signup':
        return <Signup onLogin={handleLogin} navigateTo={navigateTo} />;
      case 'forgot-password':
        return <ForgotPassword onLogin={handleLogin} navigateTo={navigateTo} setResetEmailContext={setResetEmailContext} />;
      case 'reset-password':
        return <ResetPassword onLogin={handleLogin} navigateTo={navigateTo} resetEmailContext={resetEmailContext} />;
      case 'initial-form':
        return user ? <InitialFormPage user={user} onComplete={() => navigateTo('booking')} onLogout={handleLogout} /> : <Login onLogin={handleLogin} navigateTo={navigateTo} />;
      case 'booking':
        return user ? <AppointmentBooking user={user} onComplete={() => navigateTo('client-dashboard')} onCancel={() => navigateTo('client-dashboard')} /> : <Login onLogin={handleLogin} navigateTo={navigateTo} />;
      case 'client-dashboard':
        return user ? <ClientDashboard user={user} onLogout={handleLogout} navigateTo={navigateTo} /> : <Login onLogin={handleLogin} navigateTo={navigateTo} />;
      case 'admin-dashboard':
        return isStaff(user) && user ? <AdminDashboard user={user} onLogout={handleLogout} /> : <Home navigateTo={navigateTo} />;
      default:
        return <Home navigateTo={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-zinc-900 font-sans selection:bg-amber-100 selection:text-amber-900">
        {renderPage()}
    </div>
  );
}
