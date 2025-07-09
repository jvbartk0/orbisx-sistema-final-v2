import { useState, useEffect } from 'react';
import { 
  Plus, 
  FileText, 
  Filter,
  X,
  Trash2,
  Eye,
  Edit,
  DollarSign,
  Calendar,
  User,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle
} from 'lucide-react';

const Orcamentos = () => {
  const [orcamentos, setOrcamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [filtros, setFiltros] = useState({
    status: '',
    cliente: '',
    texto: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [showDetalhes, setShowDetalhes] = useState(false);
  const [orcamentoSelecionado, setOrcamentoSelecionado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    cliente: '',
    descricao: '',
    forma_pagamento: '',
    prazo_entrega: '',
    servicos: [{ nome: '', quantidade: 1, preco_unitario: 0 }]
  });

  // Carregar dados iniciais
  useEffect(() => {
    carregarOrcamentos();
    carregarClientes();
  }, [filtros]);

  const carregarOrcamentos = async () => {
    try {
      const params = new URLSearchParams();
      if (filtros.status) params.append('status', filtros.status);
      if (filtros.cliente) params.append('cliente', filtros.cliente);
      if (filtros.texto) params.append('texto', filtros.texto);
      
      const response = await fetch(`/api/orcamentos?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setOrcamentos(data.orcamentos || []);
      }
    } catch (error) {
      console.error('Erro ao carregar orçamentos:', error);
    }
  };

  const carregarClientes = async () => {
    try {
      const response = await fetch('/api/orcamentos/clientes');
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
      const response = await fetch('/api/orcamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setFormData({
          titulo: '',
          cliente: '',
          descricao: '',
          forma_pagamento: '',
          prazo_entrega: '',
          servicos: [{ nome: '', quantidade: 1, preco_unitario: 0 }]
        });
        setShowModal(false);
        carregarOrcamentos();
        carregarClientes();
      } else {
        alert(data.error || 'Erro ao criar orçamento');
      }
    } catch (error) {
      alert('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const atualizarStatus = async (orcamentoId, novoStatus) => {
    try {
      const response = await fetch(`/api/orcamentos/${orcamentoId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: novoStatus }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        carregarOrcamentos();
      } else {
        alert(data.error || 'Erro ao atualizar status');
      }
    } catch (error) {
      alert('Erro de conexão');
    }
  };

  const verDetalhes = async (orcamentoId) => {
    try {
      const response = await fetch(`/api/orcamentos/${orcamentoId}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrcamentoSelecionado(data.orcamento);
        setShowDetalhes(true);
      } else {
        alert('Erro ao carregar detalhes do orçamento');
      }
    } catch (error) {
      alert('Erro de conexão');
    }
  };

  const adicionarServico = () => {
    setFormData(prev => ({
      ...prev,
      servicos: [...prev.servicos, { nome: '', quantidade: 1, preco_unitario: 0 }]
    }));
  };

  const removerServico = (index) => {
    setFormData(prev => ({
      ...prev,
      servicos: prev.servicos.filter((_, i) => i !== index)
    }));
  };

  const atualizarServico = (index, campo, valor) => {
    setFormData(prev => ({
      ...prev,
      servicos: prev.servicos.map((servico, i) => 
        i === index ? { ...servico, [campo]: valor } : servico
      )
    }));
  };

  const calcularTotal = () => {
    return formData.servicos.reduce((total, servico) => {
      return total + (servico.quantidade * servico.preco_unitario);
    }, 0);
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pendente':
        return <Clock className="w-4 h-4" />;
      case 'enviado':
        return <AlertCircle className="w-4 h-4" />;
      case 'aceito':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejeitado':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendente':
        return 'orbisx-badge-warning';
      case 'enviado':
        return 'orbisx-badge-info';
      case 'aceito':
        return 'orbisx-badge-success';
      case 'rejeitado':
        return 'orbisx-badge-error';
      default:
        return 'orbisx-badge-warning';
    }
  };

  // Calcular estatísticas
  const estatisticas = {
    total: orcamentos.length,
    pendentes: orcamentos.filter(o => o.status === 'pendente').length,
    enviados: orcamentos.filter(o => o.status === 'enviado').length,
    aceitos: orcamentos.filter(o => o.status === 'aceito').length,
    rejeitados: orcamentos.filter(o => o.status === 'rejeitado').length,
    valor_total: orcamentos.reduce((total, o) => total + o.valor_total, 0)
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Orçamentos</h1>
          <p className="text-gray-400">Gerencie suas propostas e orçamentos</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="orbisx-button flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Orçamento</span>
        </button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="orbisx-card text-center">
          <div className="text-2xl font-bold text-white">{estatisticas.total}</div>
          <div className="text-sm text-gray-400">Total</div>
        </div>
        <div className="orbisx-card text-center">
          <div className="text-2xl font-bold text-yellow-400">{estatisticas.pendentes}</div>
          <div className="text-sm text-gray-400">Pendentes</div>
        </div>
        <div className="orbisx-card text-center">
          <div className="text-2xl font-bold text-blue-400">{estatisticas.enviados}</div>
          <div className="text-sm text-gray-400">Enviados</div>
        </div>
        <div className="orbisx-card text-center">
          <div className="text-2xl font-bold text-green-400">{estatisticas.aceitos}</div>
          <div className="text-sm text-gray-400">Aceitos</div>
        </div>
        <div className="orbisx-card text-center">
          <div className="text-2xl font-bold text-red-400">{estatisticas.rejeitados}</div>
          <div className="text-sm text-gray-400">Rejeitados</div>
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
              Status
            </label>
            <select
              value={filtros.status}
              onChange={(e) => setFiltros(prev => ({ ...prev, status: e.target.value }))}
              className="orbisx-input w-full"
            >
              <option value="">Todos</option>
              <option value="pendente">Pendente</option>
              <option value="enviado">Enviado</option>
              <option value="aceito">Aceito</option>
              <option value="rejeitado">Rejeitado</option>
            </select>
          </div>
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
              Buscar
            </label>
            <input
              type="text"
              value={filtros.texto}
              onChange={(e) => setFiltros(prev => ({ ...prev, texto: e.target.value }))}
              className="orbisx-input w-full"
              placeholder="Título, cliente ou descrição"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFiltros({ status: '', cliente: '', texto: '' })}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors w-full"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Orçamentos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {orcamentos.map((orcamento) => (
          <div key={orcamento.id} className="orbisx-card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">
                  {orcamento.titulo}
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <User className="w-4 h-4" />
                  <span>{orcamento.cliente}</span>
                </div>
              </div>
              <span className={`orbisx-badge ${getStatusColor(orcamento.status)} flex items-center space-x-1`}>
                {getStatusIcon(orcamento.status)}
                <span className="capitalize">{orcamento.status}</span>
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Valor Total:</span>
                <span className="text-white font-medium">{formatarMoeda(orcamento.valor_total)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Data:</span>
                <span className="text-white">{formatarData(orcamento.data_criacao)}</span>
              </div>
              {orcamento.prazo_entrega && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Prazo:</span>
                  <span className="text-white">{formatarData(orcamento.prazo_entrega)}</span>
                </div>
              )}
            </div>

            {orcamento.descricao && (
              <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                {orcamento.descricao}
              </p>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-600">
              <div className="flex space-x-2">
                <button
                  onClick={() => verDetalhes(orcamento.id)}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                  title="Ver Detalhes"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex space-x-1">
                {orcamento.status === 'pendente' && (
                  <button
                    onClick={() => atualizarStatus(orcamento.id, 'enviado')}
                    className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                  >
                    Enviar
                  </button>
                )}
                {orcamento.status === 'enviado' && (
                  <>
                    <button
                      onClick={() => atualizarStatus(orcamento.id, 'aceito')}
                      className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                    >
                      Aceitar
                    </button>
                    <button
                      onClick={() => atualizarStatus(orcamento.id, 'rejeitado')}
                      className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                    >
                      Rejeitar
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {orcamentos.length === 0 && (
        <div className="orbisx-card text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Nenhum orçamento encontrado</p>
          <p className="text-gray-500 text-sm">Crie seu primeiro orçamento clicando no botão acima</p>
        </div>
      )}

      {/* Modal Novo Orçamento */}
      {showModal && (
        <div className="orbisx-modal">
          <div className="orbisx-modal-content max-w-4xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Novo Orçamento</h3>
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
                    placeholder="Nome do projeto/orçamento"
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
                    Forma de Pagamento
                  </label>
                  <input
                    type="text"
                    value={formData.forma_pagamento}
                    onChange={(e) => setFormData(prev => ({ ...prev, forma_pagamento: e.target.value }))}
                    className="orbisx-input w-full"
                    placeholder="Ex: À vista, Parcelado, PIX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Prazo de Entrega
                  </label>
                  <input
                    type="date"
                    value={formData.prazo_entrega}
                    onChange={(e) => setFormData(prev => ({ ...prev, prazo_entrega: e.target.value }))}
                    className="orbisx-input w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                  className="orbisx-input w-full h-24 resize-none"
                  placeholder="Descrição detalhada do projeto"
                />
              </div>

              {/* Serviços */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-white">Serviços</h4>
                  <button
                    type="button"
                    onClick={adicionarServico}
                    className="orbisx-button text-sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Adicionar Serviço
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.servicos.map((servico, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-800 rounded-lg">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Nome do Serviço *
                        </label>
                        <input
                          type="text"
                          value={servico.nome}
                          onChange={(e) => atualizarServico(index, 'nome', e.target.value)}
                          className="orbisx-input w-full"
                          placeholder="Descrição do serviço"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Quantidade *
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={servico.quantidade}
                          onChange={(e) => atualizarServico(index, 'quantidade', parseInt(e.target.value) || 1)}
                          className="orbisx-input w-full"
                          required
                        />
                      </div>

                      <div className="flex space-x-2">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Preço Unitário *
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={servico.preco_unitario}
                            onChange={(e) => atualizarServico(index, 'preco_unitario', parseFloat(e.target.value) || 0)}
                            className="orbisx-input w-full"
                            placeholder="0,00"
                            required
                          />
                        </div>
                        {formData.servicos.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removerServico(index)}
                            className="mt-8 text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>

                      <div className="md:col-span-4 text-right">
                        <span className="text-sm text-gray-400">
                          Subtotal: {formatarMoeda(servico.quantidade * servico.preco_unitario)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-right mt-4 p-4 bg-purple-600/20 rounded-lg">
                  <span className="text-lg font-bold text-white">
                    Total: {formatarMoeda(calcularTotal())}
                  </span>
                </div>
              </div>

              <div className="flex space-x-3 pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="orbisx-button flex-1"
                >
                  {loading ? 'Salvando...' : 'Criar Orçamento'}
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

      {/* Modal de Detalhes do Orçamento */}
      {showDetalhes && orcamentoSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Detalhes do Orçamento</h2>
                <button
                  onClick={() => setShowDetalhes(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Título
                    </label>
                    <p className="text-white bg-gray-700 p-3 rounded-md">
                      {orcamentoSelecionado.titulo}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Cliente
                    </label>
                    <p className="text-white bg-gray-700 p-3 rounded-md">
                      {orcamentoSelecionado.cliente}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Status
                    </label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(orcamentoSelecionado.status)}`}>
                      {getStatusIcon(orcamentoSelecionado.status)}
                      <span className="ml-1 capitalize">{orcamentoSelecionado.status}</span>
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Data de Criação
                    </label>
                    <p className="text-white bg-gray-700 p-3 rounded-md">
                      {formatarData(orcamentoSelecionado.data_criacao)}
                    </p>
                  </div>

                  {orcamentoSelecionado.forma_pagamento && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Forma de Pagamento
                      </label>
                      <p className="text-white bg-gray-700 p-3 rounded-md">
                        {orcamentoSelecionado.forma_pagamento}
                      </p>
                    </div>
                  )}

                  {orcamentoSelecionado.prazo_entrega && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Prazo de Entrega
                      </label>
                      <p className="text-white bg-gray-700 p-3 rounded-md">
                        {formatarData(orcamentoSelecionado.prazo_entrega)}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Valor Total
                    </label>
                    <p className="text-white bg-gray-700 p-3 rounded-md font-bold text-lg">
                      {formatarMoeda(orcamentoSelecionado.valor_total)}
                    </p>
                  </div>
                </div>
              </div>

              {orcamentoSelecionado.descricao && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Descrição
                  </label>
                  <p className="text-white bg-gray-700 p-3 rounded-md">
                    {orcamentoSelecionado.descricao}
                  </p>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Serviços</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-700">
                        <th className="text-left p-3 text-gray-300">Serviço</th>
                        <th className="text-center p-3 text-gray-300">Quantidade</th>
                        <th className="text-center p-3 text-gray-300">Preço Unitário</th>
                        <th className="text-center p-3 text-gray-300">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orcamentoSelecionado.servicos.map((servico, index) => (
                        <tr key={index} className="border-b border-gray-600">
                          <td className="p-3 text-white">{servico.nome}</td>
                          <td className="p-3 text-center text-white">{servico.quantidade}</td>
                          <td className="p-3 text-center text-white">{formatarMoeda(servico.preco_unitario)}</td>
                          <td className="p-3 text-center text-white font-medium">{formatarMoeda(servico.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-600">
                <button
                  onClick={() => setShowDetalhes(false)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Fechar
                </button>
                
                {orcamentoSelecionado.status === 'pendente' && (
                  <button
                    onClick={() => {
                      atualizarStatus(orcamentoSelecionado.id, 'enviado');
                      setShowDetalhes(false);
                    }}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Enviar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orcamentos;

