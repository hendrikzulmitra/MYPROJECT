import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Login from './pages/auth/Login';
import AuthCallback from './pages/auth/AuthCallback';
import Dashboard from './pages/dashboard/Dashboard';
import CreatePlaylist from './pages/playlist/CreatePlaylist';
import PlaylistDetail from './pages/playlist/PlaylistDetail';
import PlaylistsList from './pages/playlist/PlaylistsList';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#282828',
              color: '#fff',
            },
            success: {
              iconTheme: {
                primary: '#1DB954',
                secondary: '#fff',
              },
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/playlists"
            element={
              <ProtectedRoute>
                <PlaylistsList />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/playlists/create"
            element={
              <ProtectedRoute>
                <CreatePlaylist />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/playlists/:id"
            element={
              <ProtectedRoute>
                <PlaylistDetail />
              </ProtectedRoute>
            }
          />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;