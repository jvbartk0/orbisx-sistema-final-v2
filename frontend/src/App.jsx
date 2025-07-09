import { useState, useEffect } from 'react';
import './App.css';

// Componentes
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Orcamentos from './components/Orcamentos';
import Contratos from './components/Contratos';
import Agenda from './components/Agenda';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);

  // Verificar autenticação ao carregar
  useEffect(() => {
    checkAuth();
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/check-auth', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.authenticated) {
        setIsAuthenticated(true);
        setUser(data.usuario);
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkMobile = () => {
    setIsMobile(window.innerWidth < 1024);
  };

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      setCurrentPage('dashboard');
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'orcamentos':
        return <Orcamentos />;
      case 'contratos':
        return <Contratos />;
      case 'agenda':
        return <Agenda />;
      default:
        return <Dashboard />;
    }
  };

  // Loading inicial
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-white">Carregando Orbisx...</p>
        </div>
      </div>
    );
  }

  // Tela de login
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // Interface principal
  return (
    <div className="min-h-screen bg-black">
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onLogout={handleLogout}
        isMobile={isMobile}
      />

      {/* Conteúdo Principal */}
      <main className={`transition-all duration-300 ${isMobile ? 'ml-0' : 'ml-64'}`}>
        {/* Header Mobile */}
        {isMobile && (
          <div className="orbisx-header p-4 flex items-center justify-between lg:hidden">
            <div className="ml-12">
              <h2 className="text-lg font-semibold text-white capitalize">
                {currentPage === 'dashboard' ? 'Dashboard' : 
                 currentPage === 'orcamentos' ? 'Orçamentos' :
                 currentPage === 'contratos' ? 'Contratos' :
                 currentPage === 'agenda' ? 'Agenda' : currentPage}
              </h2>
            </div>
            <div className="text-sm text-gray-400">
              Olá, {user?.nome || 'Usuário'}
            </div>
          </div>
        )}

        {/* Conteúdo da Página */}
        <div className="min-h-screen">
          {renderCurrentPage()}
        </div>
      </main>
    </div>
  );
}

export default App;

