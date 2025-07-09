import { useState } from 'react';
import { 
  BarChart3, 
  FileText, 
  FileSignature, 
  Calendar,
  Menu,
  X,
  LogOut,
  User
} from 'lucide-react';

const Sidebar = ({ currentPage, onPageChange, onLogout, isMobile = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      description: 'Visão geral das finanças'
    },
    {
      id: 'orcamentos',
      label: 'Orçamentos',
      icon: FileText,
      description: 'Propostas e orçamentos'
    },
    {
      id: 'contratos',
      label: 'Contratos',
      icon: FileSignature,
      description: 'Gestão de contratos'
    },
    {
      id: 'agenda',
      label: 'Agenda',
      icon: Calendar,
      description: 'Tarefas e compromissos'
    }
  ];

  const handlePageChange = (pageId) => {
    onPageChange(pageId);
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const handleLogout = () => {
    onLogout();
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Botão Menu Mobile */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 bg-purple-600 text-white p-2 rounded-lg shadow-lg lg:hidden"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      )}

      {/* Overlay Mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        orbisx-sidebar transition-transform duration-300 z-40
        ${isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
        lg:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">O</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  Orbisx
                </h1>
                <p className="text-sm text-gray-400">Sistema de Gestão</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handlePageChange(item.id)}
                      className={`
                        w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-left group
                        ${isActive 
                          ? 'bg-purple-600 text-white shadow-lg' 
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        }
                      `}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-purple-400'}`} />
                      <div className="flex-1">
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs opacity-75">{item.description}</div>
                      </div>
                      {isActive && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Profile & Logout */}
          <div className="p-4 border-t border-border">
            {/* User Info */}
            <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-800 rounded-lg">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-white">Administrador</div>
                <div className="text-xs text-gray-400">eighmen</div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-all duration-200 group"
            >
              <LogOut className="w-5 h-5 text-gray-400 group-hover:text-white" />
              <span className="font-medium">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

