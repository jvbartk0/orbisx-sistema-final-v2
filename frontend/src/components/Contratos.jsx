import { useState, useEffect } from 'react';
import { 
  Plus, 
  FileText, 
  Download, 
  Eye,
  Upload,
  Filter,
  X,
  Calendar,
  User,
  DollarSign,
  Clock,
  CheckCircle
} from 'lucide-react';

const Contratos = () => {
  const [contratos, setContratos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [filtros, setFiltros] = useState({
    cliente: '',
    data_inicio: '',
    data_fim: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    cliente: '',
    valor: '',
    data_inicio: '',
    data_fim: '',
    observacoes: '',
    arquivo: null
  });

  // Carregar dados iniciais
  useEffect(() => {
    carregarContratos();
    carregarClientes();
  }, [filtros]);

  const carregarContratos = async () => {
    try {
      const params = new URLSearchParams();
      if (filtros.cliente) params.append('cliente', filtros.cliente);
      if (filtros.data_inicio) params.append('data_inicio', filtros.data_inicio);
      if (filtros.data_fim) params.append('data_fim', filtros.data_fim);
      
      const response = await fetch(`/api/contratos?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setContratos(data.contratos || []);
      }
    } catch (error) {
      console.error('Erro ao carregar contratos:', error);
    }
  };

  const carregarClientes = async () => {
    try {
      const response = await fetch('/api/contratos/clientes');
      const data = await response.json();
      
      if (response.ok) {
        setClientes(data.clientes || []);
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('titulo', formData.titulo);
      formDataToSend.append('cliente', formData.cliente);
      formDataToSend.append('valor', formData.valor);
      formDataToSend.append('data_inicio', formData.data_inicio);
      formDataToSend.append('data_fim', formData.data_fim);
      formDataToSend.append('observacoes', formData.observacoes);
      
      if (formData.arquivo) {
        formDataToSend.append('arquivo', formData.arquivo);
      }

      const response = await fetch('/api/contratos', {
        method: 'POST',
        credentials: 'include',
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setFormData({
          titulo: '',
          cliente: '',
          valor: '',
          data_inicio: '',
          data_fim: '',
          observacoes: '',
          arquivo: null
        });
        setShowModal(false);
        carregarContratos();
        carregarClientes();
      } else {
        alert(data.error || 'Erro ao criar contrato');
      }
    } catch (error) {
      alert('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const baixarContrato = async (contratoId) => {
    try {
      const response = await fetch(`/api/contratos/${contratoId}/download`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `contrato_${contratoId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Erro ao baixar contrato');
      }
    } catch (error) {
      alert('Erro de conexão');
    }
  };

  const visualizarContrato = async (contratoId) => {
    try {
      const url = `/api/contratos/${contratoId}/view`;
      window.open(url, '_blank');
    } catch (error) {
      alert('Erro ao visualizar contrato');
    }
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

  const calcularDiasRestantes = (dataFim) => {
    const hoje = new Date();
    const fim = new Date(dataFim + 'T00:00:00');
    const diffTime = fim - hoje;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusContrato = (dataInicio, dataFim) => {
    const hoje = new Date();
    const inicio = new Date(dataInicio + 'T00:00:00');
    const fim = new Date(dataFim + 'T00:00:00');
    
    if (hoje < inicio) {
      return { status: 'aguardando', label: 'Aguardando Início', color: 'orbisx-badge-warning' };
    } else if (hoje >= inicio && hoje <= fim) {
      return { status: 'ativo', label: 'Ativo', color: 'orbisx-badge-success' };
    } else {
      return { status: 'finalizado', label: 'Finalizado', color: 'orbisx-badge-info' };
    }
  };

  // Calcular estatísticas
  const estatisticas = {
    total: contratos.length,
    ativos: contratos.filter(c => getStatusContrato(c.data_inicio, c.data_fim).status === 'ativo').length,
    finalizados: contratos.filter(c => getStatusContrato(c.data_inicio, c.data_fim).status === 'finalizado').length,
    aguardando: contratos.filter(c => getStatusContrato(c.data_inicio, c.data_fim).status === 'aguardando').length,
    valor_total: contratos.reduce((total, c) => total + c.valor, 0)
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Contratos</h1>
          <p className="text-gray-400">Gerencie seus contratos e documentos</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="orbisx-button flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Contrato</span>
        </button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="orbisx-card text-center">
          <div className="text-2xl font-bold text-white">{estatisticas.total}</div>
          <div className="text-sm text-gray-400">Total</div>
        </div>
        <div className="orbisx-card text-center">
          <div className="text-2xl font-bold text-green-400">{estatisticas.ativos}</div>
          <div className="text-sm text-gray-400">Ativos</div>
        </div>
        <div className="orbisx-card text-center">
          <div className="text-2xl font-bold text-blue-400">{estatisticas.finalizados}</div>
          <div className="text-sm text-gray-400">Finalizados</div>
        </div>
        <div className="orbisx-card text-center">
          <div className="text-2xl font-bold text-yellow-400">{estatisticas.aguardando}</div>
          <div className="text-sm text-gray-400">Aguardando</div>
        </div>
        <div className="orbisx-card text-center">
          <div className="text-lg font-bold text-purple-400">{formatarMoeda(estatisticas.valor_total)}</div>
          <div className="text-sm text-gray-400">Valor Total</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="orbisx-card">
        <h3 className="text-lg font-semibold text-white mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Cliente
            </label>
            <select
              value={filtros.cliente}
              onChange={(e) => setFiltros(prev => ({ ...prev, cliente: e.target.value }))}
              className="orbisx-input w-full"
            >
              <option value="">Todos</option>
              {clientes.map(cliente => (
                <option key={cliente} value={cliente}>{cliente}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Data Início
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
              Data Fim
            </label>
            <input
              type="date"
              value={filtros.data_fim}
              onChange={(e) => setFiltros(prev => ({ ...prev, data_fim: e.target.value }))}
              className="orbisx-input w-full"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFiltros({ cliente: '', data_inicio: '', data_fim: '' })}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors w-full"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Contratos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {contratos.map((contrato) => {
          const statusInfo = getStatusContrato(contrato.data_inicio, contrato.data_fim);
          const diasRestantes = calcularDiasRestantes(contrato.data_fim);
          
          return (
            <div key={contrato.id} className="orbisx-card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {contrato.titulo}
                  </h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <User className="w-4 h-4" />
                    <span>{contrato.cliente}</span>
                  </div>
                </div>
                <span className={`orbisx-badge ${statusInfo.color} flex items-center space-x-1`}>
                  <CheckCircle className="w-4 h-4" />
                  <span>{statusInfo.label}</span>
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Valor:</span>
                  <span className="text-white font-medium">{formatarMoeda(contrato.valor)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Início:</span>
                  <span className="text-white">{formatarData(contrato.data_inicio)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Fim:</span>
                  <span className="text-white">{formatarData(contrato.data_fim)}</span>
                </div>
                {statusInfo.status === 'ativo' && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Dias restantes:</span>
                    <span className={`font-medium ${diasRestantes <= 30 ? 'text-yellow-400' : 'text-green-400'}`}>
                      {diasRestantes > 0 ? `${diasRestantes} dias` : 'Vencido'}
                    </span>
                  </div>
                )}
              </div>

              {contrato.observacoes && (
                <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                  {contrato.observacoes}
                </p>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-600">
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <FileText className="w-4 h-4" />
                  <span>{contrato.nome_arquivo}</span>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => visualizarContrato(contrato.id)}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                    title="Visualizar"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => baixarContrato(contrato.id)}
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                    title="Baixar"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {contratos.length === 0 && (
        <div className="orbisx-card text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Nenhum contrato encontrado</p>
          <p className="text-gray-500 text-sm">Faça upload do seu primeiro contrato clicando no botão acima</p>
        </div>
      )}

      {/* Modal Novo Contrato */}
      {showModal && (
        <div className="orbisx-modal">
          <div className="orbisx-modal-content max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Novo Contrato</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informações Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={formData.titulo}
                    onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                    className="orbisx-input w-full"
                    placeholder="Nome do contrato"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Cliente *
                  </label>
                  <input
                    type="text"
                    value={formData.cliente}
                    onChange={(e) => setFormData(prev => ({ ...prev, cliente: e.target.value }))}
                    className="orbisx-input w-full"
                    placeholder="Nome do cliente"
                    required
                  />
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
                    Data de Início *
                  </label>
                  <input
                    type="date"
                    value={formData.data_inicio}
                    onChange={(e) => setFormData(prev => ({ ...prev, data_inicio: e.target.value }))}
                    className="orbisx-input w-full"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Data de Fim *
                  </label>
                  <input
                    type="date"
                    value={formData.data_fim}
                    onChange={(e) => setFormData(prev => ({ ...prev, data_fim: e.target.value }))}
                    className="orbisx-input w-full"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Observações
                </label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                  className="orbisx-input w-full h-24 resize-none"
                  placeholder="Observações sobre o contrato"
                />
              </div>

              {/* Upload de Arquivo */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Arquivo PDF *
                </label>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFormData(prev => ({ ...prev, arquivo: e.target.files[0] }))}
                    className="hidden"
                    id="arquivo-upload"
                    required
                  />
                  <label
                    htmlFor="arquivo-upload"
                    className="cursor-pointer flex flex-col items-center space-y-2"
                  >
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-gray-400">
                      {formData.arquivo ? formData.arquivo.name : 'Clique para selecionar um arquivo PDF'}
                    </span>
                    <span className="text-xs text-gray-500">Máximo 16MB</span>
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="orbisx-button flex-1"
                >
                  {loading ? 'Salvando...' : 'Salvar Contrato'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contratos;

