import { useState, useEffect } from 'react';
import { 
  Plus, 
  Calendar,
  Clock,
  MapPin,
  User,
  Filter,
  X,
  Trash2,
  CheckCircle,
  Circle,
  Camera,
  Edit,
  Users,
  ChevronLeft,
  ChevronRight,
  BarChart3
} from 'lucide-react';

const Agenda = () => {
  const [tarefas, setTarefas] = useState([]);
  const [calendario, setCalendario] = useState({});
  const [estatisticas, setEstatisticas] = useState({});
  const [dataAtual, setDataAtual] = useState(new Date());
  const [filtros, setFiltros] = useState({
    tipo: '',
    data_inicio: '',
    data_fim: '',
    concluida: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTarefa, setSelectedTarefa] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    tipo: 'captacao',
    data: new Date().toISOString().split('T')[0],
    horario: '',
    cliente: '',
    local: '',
    descricao: ''
  });

  // Carregar dados iniciais
  useEffect(() => {
    carregarTarefas();
    carregarCalendario();
    carregarEstatisticas();
  }, [filtros, dataAtual]);

  const carregarTarefas = async () => {
    try {
      const params = new URLSearchParams();
      if (filtros.tipo) params.append('tipo', filtros.tipo);
      if (filtros.data_inicio) params.append('data_inicio', filtros.data_inicio);
      if (filtros.data_fim) params.append('data_fim', filtros.data_fim);
      if (filtros.concluida !== '') params.append('concluida', filtros.concluida);
      
      const response = await fetch(`/api/tarefas?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setTarefas(data.tarefas || []);
      }
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    }
  };

  const carregarCalendario = async () => {
    try {
      const ano = dataAtual.getFullYear();
      const mes = dataAtual.getMonth() + 1;
      
      const response = await fetch(`/api/tarefas/calendario/${ano}/${mes}`);
      const data = await response.json();
      
      if (response.ok) {
        setCalendario(data.calendario || {});
      }
    } catch (error) {
      console.error('Erro ao carregar calendário:', error);
    }
  };

  const carregarEstatisticas = async () => {
    try {
      const params = new URLSearchParams();
      if (filtros.data_inicio) params.append('data_inicio', filtros.data_inicio);
      if (filtros.data_fim) params.append('data_fim', filtros.data_fim);
      
      const response = await fetch(`/api/tarefas/estatisticas?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setEstatisticas(data);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/tarefas', {
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
          tipo: 'captacao',
          data: new Date().toISOString().split('T')[0],
          horario: '',
          cliente: '',
          local: '',
          descricao: ''
        });
        setShowModal(false);
        carregarTarefas();
        carregarCalendario();
        carregarEstatisticas();
      } else {
        alert(data.error || 'Erro ao criar tarefa');
      }
    } catch (error) {
      alert('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const marcarConcluida = async (tarefaId, concluida) => {
    try {
      const response = await fetch(`/api/tarefas/${tarefaId}/concluir`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ concluida }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        carregarTarefas();
        carregarCalendario();
        carregarEstatisticas();
      } else {
        alert(data.error || 'Erro ao atualizar tarefa');
      }
    } catch (error) {
      alert('Erro de conexão');
    }
  };

  const handleDelete = async () => {
    if (!selectedTarefa) return;

    try {
      const response = await fetch(`/api/tarefas/${selectedTarefa.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setShowDeleteModal(false);
        setSelectedTarefa(null);
        carregarTarefas();
        carregarCalendario();
        carregarEstatisticas();
      } else {
        alert(data.error || 'Erro ao remover tarefa');
      }
    } catch (error) {
      alert('Erro de conexão');
    }
  };

  const formatarData = (data) => {
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  const formatarHorario = (horario) => {
    if (!horario) return '';
    return horario.substring(0, 5);
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'captacao':
        return <Camera className="w-4 h-4" />;
      case 'edicao':
        return <Edit className="w-4 h-4" />;
      case 'reuniao':
        return <Users className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'captacao':
        return 'orbisx-badge-success';
      case 'edicao':
        return 'orbisx-badge-warning';
      case 'reuniao':
        return 'orbisx-badge-info';
      default:
        return 'orbisx-badge-info';
    }
  };

  const getTipoLabel = (tipo) => {
    switch (tipo) {
      case 'captacao':
        return 'Captação';
      case 'edicao':
        return 'Edição';
      case 'reuniao':
        return 'Reunião';
      default:
        return tipo;
    }
  };

  // Navegação do calendário
  const mesAnterior = () => {
    setDataAtual(new Date(dataAtual.getFullYear(), dataAtual.getMonth() - 1, 1));
  };

  const proximoMes = () => {
    setDataAtual(new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 1));
  };

  // Gerar dias do calendário
  const gerarDiasCalendario = () => {
    const ano = dataAtual.getFullYear();
    const mes = dataAtual.getMonth();
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const diasNoMes = ultimoDia.getDate();
    const diaSemanaInicio = primeiroDia.getDay();
    
    const dias = [];
    
    // Dias vazios no início
    for (let i = 0; i < diaSemanaInicio; i++) {
      dias.push(null);
    }
    
    // Dias do mês
    for (let dia = 1; dia <= diasNoMes; dia++) {
      dias.push(dia);
    }
    
    return dias;
  };

  const nomesMeses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Agenda</h1>
          <p className="text-gray-400">Gerencie suas tarefas e compromissos</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="orbisx-button flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nova Tarefa</span>
        </button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="orbisx-card text-center">
          <div className="text-2xl font-bold text-white">{estatisticas.total_tarefas || 0}</div>
          <div className="text-sm text-gray-400">Total</div>
        </div>
        <div className="orbisx-card text-center">
          <div className="text-2xl font-bold text-green-400">{estatisticas.concluidas || 0}</div>
          <div className="text-sm text-gray-400">Concluídas</div>
        </div>
        <div className="orbisx-card text-center">
          <div className="text-2xl font-bold text-yellow-400">{estatisticas.pendentes || 0}</div>
          <div className="text-sm text-gray-400">Pendentes</div>
        </div>
        <div className="orbisx-card text-center">
          <div className="text-2xl font-bold text-purple-400">{estatisticas.taxa_conclusao || 0}%</div>
          <div className="text-sm text-gray-400">Taxa Conclusão</div>
        </div>
      </div>

      {/* Estatísticas por Categoria */}
      <div className="orbisx-card">
        <div className="flex items-center space-x-2 mb-4">
          <BarChart3 className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Por Categoria</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-xl font-bold text-green-400">
              {estatisticas.por_categoria?.captacao || 0}
            </div>
            <div className="text-sm text-gray-400">Captação</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-yellow-400">
              {estatisticas.por_categoria?.edicao || 0}
            </div>
            <div className="text-sm text-gray-400">Edição</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-blue-400">
              {estatisticas.por_categoria?.reuniao || 0}
            </div>
            <div className="text-sm text-gray-400">Reunião</div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="orbisx-card">
        <h3 className="text-lg font-semibold text-white mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tipo
            </label>
            <select
              value={filtros.tipo}
              onChange={(e) => setFiltros(prev => ({ ...prev, tipo: e.target.value }))}
              className="orbisx-input w-full"
            >
              <option value="">Todos</option>
              <option value="captacao">Captação</option>
              <option value="edicao">Edição</option>
              <option value="reuniao">Reunião</option>
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
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Status
            </label>
            <select
              value={filtros.concluida}
              onChange={(e) => setFiltros(prev => ({ ...prev, concluida: e.target.value }))}
              className="orbisx-input w-full"
            >
              <option value="">Todas</option>
              <option value="false">Pendentes</option>
              <option value="true">Concluídas</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFiltros({ tipo: '', data_inicio: '', data_fim: '', concluida: '' })}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors w-full"
            >
              Limpar
            </button>
          </div>
        </div>
      </div>

      {/* Layout Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendário */}
        <div className="orbisx-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Calendário</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={mesAnterior}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-white font-medium min-w-[120px] text-center">
                {nomesMeses[dataAtual.getMonth()]} {dataAtual.getFullYear()}
              </span>
              <button
                onClick={proximoMes}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {diasSemana.map(dia => (
              <div key={dia} className="text-center text-xs font-medium text-gray-400 py-2">
                {dia}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {gerarDiasCalendario().map((dia, index) => {
              const tarefasDoDia = calendario[dia] || [];
              const hoje = new Date();
              const isHoje = dia && 
                dia === hoje.getDate() && 
                dataAtual.getMonth() === hoje.getMonth() && 
                dataAtual.getFullYear() === hoje.getFullYear();

              return (
                <div
                  key={index}
                  className={`
                    aspect-square p-1 text-center text-sm border border-gray-700 rounded
                    ${dia ? 'bg-gray-800 hover:bg-gray-700 cursor-pointer' : 'bg-transparent'}
                    ${isHoje ? 'bg-purple-600 text-white' : 'text-gray-300'}
                  `}
                >
                  {dia && (
                    <>
                      <div className="font-medium">{dia}</div>
                      {tarefasDoDia.length > 0 && (
                        <div className="flex justify-center mt-1">
                          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Lista de Tarefas */}
        <div className="orbisx-card">
          <h3 className="text-lg font-semibold text-white mb-4">Tarefas</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {tarefas.map((tarefa) => (
              <div
                key={tarefa.id}
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  tarefa.concluida 
                    ? 'bg-gray-800 border-gray-600 opacity-75' 
                    : 'bg-gray-800 border-gray-600 hover:border-purple-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <button
                      onClick={() => marcarConcluida(tarefa.id, !tarefa.concluida)}
                      className="mt-1 text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      {tarefa.concluida ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className={`font-medium ${tarefa.concluida ? 'line-through text-gray-400' : 'text-white'}`}>
                          {tarefa.titulo}
                        </h4>
                        <span className={`orbisx-badge ${getTipoColor(tarefa.tipo)} flex items-center space-x-1`}>
                          {getTipoIcon(tarefa.tipo)}
                          <span>{getTipoLabel(tarefa.tipo)}</span>
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-400">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatarData(tarefa.data)}</span>
                          </div>
                          {tarefa.horario && (
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{formatarHorario(tarefa.horario)}</span>
                            </div>
                          )}
                        </div>
                        
                        {tarefa.cliente && (
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>{tarefa.cliente}</span>
                          </div>
                        )}
                        
                        {tarefa.local && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{tarefa.local}</span>
                          </div>
                        )}
                        
                        {tarefa.descricao && (
                          <p className="text-gray-300 mt-2">{tarefa.descricao}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      setSelectedTarefa(tarefa);
                      setShowDeleteModal(true);
                    }}
                    className="text-red-400 hover:text-red-300 transition-colors ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            
            {tarefas.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Nenhuma tarefa encontrada</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Nova Tarefa */}
      {showModal && (
        <div className="orbisx-modal">
          <div className="orbisx-modal-content max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Nova Tarefa</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
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
                    placeholder="Nome da tarefa"
                    required
                  />
                </div>

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
                    <option value="captacao">Captação</option>
                    <option value="edicao">Edição</option>
                    <option value="reuniao">Reunião</option>
                  </select>
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
                    Horário
                  </label>
                  <input
                    type="time"
                    value={formData.horario}
                    onChange={(e) => setFormData(prev => ({ ...prev, horario: e.target.value }))}
                    className="orbisx-input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Cliente
                  </label>
                  <input
                    type="text"
                    value={formData.cliente}
                    onChange={(e) => setFormData(prev => ({ ...prev, cliente: e.target.value }))}
                    className="orbisx-input w-full"
                    placeholder="Nome do cliente"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Local
                  </label>
                  <input
                    type="text"
                    value={formData.local}
                    onChange={(e) => setFormData(prev => ({ ...prev, local: e.target.value }))}
                    className="orbisx-input w-full"
                    placeholder="Local do compromisso"
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
                  placeholder="Descrição da tarefa"
                />
              </div>

              <div className="flex space-x-3 pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="orbisx-button flex-1"
                >
                  {loading ? 'Salvando...' : 'Criar Tarefa'}
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

      {/* Modal Confirmar Exclusão */}
      {showDeleteModal && selectedTarefa && (
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
              Tem certeza que deseja remover esta tarefa?
            </p>
            
            <div className="bg-gray-800 p-3 rounded-lg mb-6">
              <p className="text-sm text-gray-400">
                <span className="font-medium">Título:</span> {selectedTarefa.titulo}
              </p>
              <p className="text-sm text-gray-400">
                <span className="font-medium">Tipo:</span> {getTipoLabel(selectedTarefa.tipo)}
              </p>
              <p className="text-sm text-gray-400">
                <span className="font-medium">Data:</span> {formatarData(selectedTarefa.data)}
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

export default Agenda;

