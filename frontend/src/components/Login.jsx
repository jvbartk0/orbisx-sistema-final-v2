import { useState } from 'react';
import { Eye, EyeOff, User, Lock } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    usuario: '',
    senha: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpar erro quando usuário começar a digitar
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação de campos vazios
    if (!formData.usuario.trim() || !formData.senha.trim()) {
      setError('Usuário e senha são obrigatórios');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          usuario: formData.usuario.trim(),
          senha: formData.senha.trim()
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Limpar formulário
        setFormData({ usuario: '', senha: '' });
        onLogin(data.usuario);
      } else {
        setError(data.error || 'Credenciais inválidas');
      }
    } catch (error) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Título */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Orbisx
          </h1>
          <p className="text-gray-400">Sistema de Gestão Empresarial</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campo Usuário */}
          <div className="space-y-2">
            <label htmlFor="usuario" className="block text-sm font-medium text-white">
              Usuário
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                id="usuario"
                name="usuario"
                value={formData.usuario}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-gray-900 border-2 border-purple-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-600/20 transition-all duration-200 orbisx-glow"
                placeholder="Digite seu usuário"
                autoComplete="username"
              />
            </div>
          </div>

          {/* Campo Senha */}
          <div className="space-y-2">
            <label htmlFor="senha" className="block text-sm font-medium text-white">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="senha"
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                className="w-full pl-10 pr-12 py-3 bg-gray-900 border-2 border-purple-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-600/20 transition-all duration-200 orbisx-glow"
                placeholder="Digite sua senha"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 orbisx-shake orbisx-fade-in">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Botão Entrar */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-600/50 orbisx-glow"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Entrando...
              </div>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        {/* Informações de Acesso */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-xs">
            Sistema desenvolvido para gestão empresarial
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

