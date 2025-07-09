import { useState, useEffect } from 'react';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Calendar,
  Filter,
  X,
  Trash2,
  PieChart,
  BarChart3
} from 'lucide-react';

const Dashboard = () => {
  const [lancamentos, setLancamentos] = useState([]);
  const [resumo, setResumo] = useState({
    total_entradas: 0,
    total_saidas: 0,
    total_caixa: 0,
    categorias: {}
  });
  const [filtros, setFiltros] = useState({
    data_inicio: '',
    data_fim: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLancamento, setSelectedLancamento] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tipo: 'entrada',
    valor: '',
    data: new Date().toISOString().split('T')[0],
    categoria: '',
    descricao: ''
  });

  // Carregar dados iniciais
  useEffect(() => {
    carregarLancamentos();
    carregarResumo();
  }, [filtros]);

  const carregarLancamentos = async () => {
    try {
      const params = new URLSearchParams();
      if (filtros.data_inicio) params.append('data_inicio', filtros.data_inicio);
      if (filtros.data_fim) params.append('data_fim', filtros.data_fim);
      
      const response = await fetch(`/api/lancamentos?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setLancamentos(data.lancamentos || []);
      }
    } catch (error) {
      console.error('Erro ao carregar lançamentos:', error);
    }
  };

  const carregarResumo = async () => {
    try {
      const params = new URLSearchParams();
      if (filtros.data_inicio) params.append('data_inicio', filtros.data_inicio);
      if (filtros.data_fim) params.append('data_fim', filtros.data_fim);
      
      const response = await fetch(`/api/lancamentos/resumo?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setResumo(data);
      }
    } catch (error) {
      console.error('Erro ao carregar resumo:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/lancamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          valor: parseFloat(formData.valor)
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setFormData({
          tipo: 'entrada',
          valor: '',
          data: new Date().toISOString().split('T')[0],
          categoria: '',
          descricao: ''
        });
        setShowModal(false);
        carregarLancamentos();
        carregarResumo();
      } else {
        alert(data.error || 'Erro ao criar lançamento');
      }
    } catch (error) {
      alert('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedLancamento) return;

    try {
      const response = await fetch(`/api/lancamentos/${selectedLancamento.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setShowDeleteModal(false);
        setSelectedLancamento(null);
        carregarLancamentos();
        carregarResumo();
      } else {
        alert(data.error || 'Erro ao remover lançamento');
      }
    } catch (error) {
      alert('Erro de conexão');
    }
  };

  const aplicarFiltros = () => {
    carregarLancamentos();
    carregarResumo();
  };

  const limparFiltros = () => {
    setFiltros({ data_inicio: '', data_fim: '' });
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarData = (data) => {
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400">Visão geral das suas finanças</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="orbisx-button flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Adicionar Lançamento</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="orbisx-card">
        <h3 className="text-lg font-semibold text-white mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Data Inicial
            </label>
            <input
              type="date"
              value={filtros.data_inicio}
              onChange={(e) => setFiltros(prev => ({ ...prev, data_inicio: e.target.value }))}
              className="orbisx-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Data Final
            </label>
            <input
              type="date"
              value={filtros.data_fim}
              onChange={(e) => setFiltros(prev => ({ ...prev, data_fim: e.target.value }))}
              className="orbisx-input w-full"
            />
          </div>
          <div className="flex items-end space-x-2">
            <button
              onClick={aplicarFiltros}
              className="orbisx-button flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Aplicar</span>
            </button>
            <button
              onClick={limparFiltros}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Limpar
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total em Caixa */}
        <div className="orbisx-card bg-gradient-to-r from-purple-600 to-purple-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total em Caixa</p>
              <p className="text-2xl font-bold text-white">
                {formatarMoeda(resumo.total_caixa)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-200" />
          </div>
        </div>

        {/* Entradas */}
        <div className="orbisx-card bg-gradient-to-r from-green-600 to-green-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Entradas</p>
              <p className="text-2xl font-bold text-white">
                {formatarMoeda(resumo.total_entradas)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-200" />
          </div>
        </div>

        {/* Saídas */}
        <div className="orbisx-card bg-gradient-to-r from-red-600 to-red-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Saídas</p>
              <p className="text-2xl font-bold text-white">
                {formatarMoeda(resumo.total_saidas)}
              </p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-200" />
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Categorias */}
        <div className="orbisx-card">
          <div className="flex items-center space-x-2 mb-4">
            <PieChart className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Categorias</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(resumo.categorias || {}).map(([categoria, valores]) => {
              const total = valores.entrada + valores.saida;
              return (
                <div key={categoria} className="flex items-center justify-between">
                  <span className="text-gray-300">{categoria}</span>
                  <span className="text-white font-medium">{formatarMoeda(total)}</span>
                </div>
              );
            })}
            {Object.keys(resumo.categorias || {}).length === 0 && (
              <p className="text-gray-400 text-center py-4">Nenhuma categoria encontrada</p>
            )}
          </div>
        </div>

        {/* Resumo Entradas vs Saídas */}
        <div className="orbisx-card">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Entradas vs Saídas</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-green-400">Entradas</span>
              <span className="text-white font-medium">{formatarMoeda(resumo.total_entradas)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-red-400">Saídas</span>
              <span className="text-white font-medium">{formatarMoeda(resumo.total_saidas)}</span>
            </div>
            <div className="border-t border-gray-600 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-purple-400 font-medium">Saldo</span>
                <span className={`font-bold ${resumo.total_caixa >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatarMoeda(resumo.total_caixa)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Lançamentos */}
      <div className="orbisx-card">
        <h3 className="text-lg font-semibold text-white mb-4">Lançamentos Recentes</h3>
        <div className="overflow-x-auto">
          <table className="orbisx-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Data</th>
                <th>Categoria</th>
                <th>Descrição</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {lancamentos.map((lancamento) => (
                <tr key={lancamento.id}>
                  <td>
                    <span className={`orbisx-badge ${
                      lancamento.tipo === 'entrada' ? 'orbisx-badge-success' : 'orbisx-badge-error'
                    }`}>
                      {lancamento.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                    </span>
                  </td>
                  <td className={lancamento.tipo === 'entrada' ? 'text-green-400' : 'text-red-400'}>
                    {formatarMoeda(lancamento.valor)}
                  </td>
                  <td>{formatarData(lancamento.data)}</td>
                  <td>{lancamento.categoria}</td>
                  <td className="max-w-xs truncate">{lancamento.descricao || '-'}</td>
                  <td>
                    <button
                      onClick={() => {
                        setSelectedLancamento(lancamento);
                        setShowDeleteModal(true);
                      }}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {lancamentos.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400">Nenhum lançamento encontrado</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Novo Lançamento */}
      {showModal && (
        <div className="orbisx-modal">
          <div className="orbisx-modal-content max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Novo Lançamento</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo *
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value }))}
                  className="orbisx-input w-full"
                  required
                >
                  <option value="entrada">Entrada</option>
                  <option value="saida">Saída</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Valor *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valor}
                  onChange={(e) => setFormData(prev => ({ ...prev, valor: e.target.value }))}
                  className="orbisx-input w-full"
                  placeholder="0,00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Data *
                </label>
                <input
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
                  className="orbisx-input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Categoria *
                </label>
                <input
                  type="text"
                  value={formData.categoria}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                  className="orbisx-input w-full"
                  placeholder="Ex: Vendas, Marketing, Operacional"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                  className="orbisx-input w-full h-20 resize-none"
                  placeholder="Descrição opcional do lançamento"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="orbisx-button flex-1"
                >
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmar Exclusão */}
      {showDeleteModal && selectedLancamento && (
        <div className="orbisx-modal">
          <div className="orbisx-modal-content">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Confirmar Exclusão</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-gray-300 mb-6">
              Tem certeza que deseja remover este lançamento?
            </p>
            
            <div className="bg-gray-800 p-3 rounded-lg mb-6">
              <p className="text-sm text-gray-400">
                <span className="font-medium">Tipo:</span> {selectedLancamento.tipo === 'entrada' ? 'Entrada' : 'Saída'}
              </p>
              <p className="text-sm text-gray-400">
                <span className="font-medium">Valor:</span> {formatarMoeda(selectedLancamento.valor)}
              </p>
              <p className="text-sm text-gray-400">
                <span className="font-medium">Categoria:</span> {selectedLancamento.categoria}
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Sim, Remover
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

