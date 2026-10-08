import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppErrorBoundary from './components/AppErrorBoundary';
import NetworkStatus from './components/NetworkStatus';
import NotFound from './pages/NotFound';

const Login = lazy(() => import('./pages/Login'));
const Principal = lazy(() => import('./pages/Principal'));
const Tienda = lazy(() => import('./pages/Tienda'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Admin = lazy(() => import('./pages/Admin'));
const InstitutionFlow = lazy(() => import('./pages/InstitutionFlow'));

function PageLoading() {
  return (
    <main role="status" aria-live="polite" className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-center dark:bg-slate-950">
      <div>
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
        <p className="mt-3 text-sm font-bold text-slate-500 dark:text-slate-300">Cargando portal…</p>
      </div>
    </main>
  );
}

function getHomeRedirect() {
  const token = localStorage.getItem('access_token');
  if (!token) return '/login';
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.id) {
      const prefs = JSON.parse(localStorage.getItem(`prefs_${user.id}`)) || {};
      if (prefs.manualLogin) return '/login';
    }
  } catch { /* ignore */ }
  return '/principal';
}

function App() {
  return (
    <AppErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <Router>
            <NetworkStatus />
            <Suspense fallback={<PageLoading />}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/acceso-escuela/*" element={<InstitutionFlow />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                <Route path="/principal" element={
                  <ProtectedRoute>
                    <Principal />
                  </ProtectedRoute>
                } />

                <Route path="/tienda" element={
                  <ProtectedRoute>
                    <Tienda />
                  </ProtectedRoute>
                } />

                <Route path="/admin" element={
                  <ProtectedRoute requiredRole="admin">
                    <Admin />
                  </ProtectedRoute>
                } />

                <Route path="/" element={<Navigate to={getHomeRedirect()} replace />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Router>
        </ThemeProvider>
      </AuthProvider>
    </AppErrorBoundary>
  );
}

export default App;
