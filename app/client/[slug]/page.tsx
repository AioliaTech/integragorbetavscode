'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Upload, X, LogOut, ToggleLeft, ToggleRight, GripVertical, Eye } from 'lucide-react';
import FIPEAutocomplete from '@/components/FIPEAutocomplete';

const CORES = ['Preto', 'Branco', 'Prata', 'Cinza', 'Vermelho', 'Azul', 'Verde', 'Amarelo', 'Laranja', 'Marrom', 'Bege', 'Dourado'];
const CATEGORIAS = ['SUV', 'Hatch', 'Sedan', 'Caminhonete', 'Utilitário', 'Esportivo'];
const COMBUSTIVEIS = ['Flex', 'Gasolina', 'Diesel', 'Elétrico'];
const CAMBIOS = ['Manual', 'Automático'];
const OPCIONAIS = ['ar-condicionado', 'ar quente', 'sete lugares', 'airbag', 'direcao hidraulica', 'vidros eletricos', 'trava eletrica', 'abs', 'revisoes em dia', 'limpador traseiro', 'banco reclinavel', 'retrovisor eletrico', 'desembacador traseiro', 'cambio manual', 'computador de bordo', 'alarme', 'rodas de liga leve', 'sensor de estacionamento', 'calotas', 'apoio de braco', 'entrada auxiliar', 'ipva pago e licenciado', 'farol de milha', 'som multimidia', 'ipva pago', 'cambio automatico', 'espelhamento de celular', 'bancos de couro', 'radio bluetooth', 'encosto de cabeca traseiro', 'vidros eletricos dianteiros', 'teto solar', 'chave copia/reserva', 'camera de re', 'direcao eletrica', '4x4', 'controle de tracao', 'engate'];

// Componente de Autocomplete Reutilizável
interface AutocompleteProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}

function Autocomplete({ label, value, onChange, options, placeholder }: AutocompleteProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(value.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || filteredOptions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          selectOption(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        break;
    }
  };

  const selectOption = (option: string) => {
    onChange(option);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-semibold mb-2">{label}</label>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        onKeyDown={handleKeyDown}
        className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
        placeholder={placeholder || 'Digite...'}
      />
      {showDropdown && filteredOptions.length > 0 && (
        <div className="absolute z-10 w-full bg-white border-2 border-gray-200 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
          {filteredOptions.map((option, index) => (
            <div
              key={option}
              onClick={() => selectOption(option)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`px-4 py-2 cursor-pointer ${
                index === highlightedIndex
                  ? 'bg-orange-100 text-orange-900'
                  : 'hover:bg-orange-50'
              }`}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const toNumber = (v: any): number => {
  if (v === null || v === undefined || v === '') return NaN;
  const n = Number(v);
  return isNaN(n) ? NaN : n;
};

export default function ClientPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [veiculos, setVeiculos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVeiculo, setEditingVeiculo] = useState<any>(null);
  const [clienteNome, setClienteNome] = useState('');
  const [showOpcionaisModal, setShowOpcionaisModal] = useState(false);
  const [selectedOpcionais, setSelectedOpcionais] = useState<string[]>([]);
  const [formData, setFormData] = useState<any>({ ativo: true, destaque: false });
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [draggedPhotoIndex, setDraggedPhotoIndex] = useState<number | null>(null);

  const [qModelo, setQModelo] = useState('');
  const [fltMarca, setFltMarca] = useState('');
  const [fltCategoria, setFltCategoria] = useState('');
  const [fltAnoMin, setFltAnoMin] = useState<string>('');
  const [fltAnoMax, setFltAnoMax] = useState<string>('');
  const [fltPrecoMin, setFltPrecoMin] = useState<string>('');
  const [fltPrecoMax, setFltPrecoMax] = useState<string>('');

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configData, setConfigData] = useState({
    endereco: '',
    horario_atendimento: '',
    whatsapp: '',
    logo_url: '',
    email_contato: '',
    instagram_url: '',
    facebook_url: '',
    linkedin_url: '',
    youtube_url: ''
  });
  const [savingConfig, setSavingConfig] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  
  // Estados para banners
  const [banners, setBanners] = useState<any[]>([]);
  const [showBannersModal, setShowBannersModal] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [bannerForm, setBannerForm] = useState({
    titulo: '',
    subtitulo: '',
    imagem_url: '',
    link_url: '',
    ordem: 0,
    ativo: true
  });

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const slug = localStorage.getItem('user_slug');
    if (!token || slug !== params.slug) router.push('/');
  }, [params.slug, router]);

  useEffect(() => {
    loadVeiculos();
    loadConfiguracoes();
    loadBanners();
  }, []);

  async function loadVeiculos() {
    try {
      const response = await fetch(`/api/client/${params.slug}/veiculos`);
      const data = await response.json();
      if (data.cliente) setClienteNome(data.cliente.nome);
      setVeiculos(data.veiculos || []);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadConfiguracoes() {
    try {
      const response = await fetch(`/api/client/${params.slug}/configuracoes`);
      const data = await response.json();
      if (data.configuracoes) {
        setConfigData(data.configuracoes);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  }

  async function loadBanners() {
    try {
      const response = await fetch(`/api/client/${params.slug}/banners`);
      const data = await response.json();
      if (data.banners) {
        setBanners(data.banners);
      }
    } catch (error) {
      console.error('Erro ao carregar banners:', error);
    }
  }

  async function handleLogoUpload(e: any) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('clienteSlug', params.slug);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        setConfigData({ ...configData, logo_url: data.url });
        alert('Logo carregado! Não esqueça de salvar as configurações.');
      }
    } catch (error) {
      alert('Erro ao fazer upload do logo');
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleBannerImageUpload(e: any) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingBanner(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('clienteSlug', params.slug);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        setBannerForm({ ...bannerForm, imagem_url: data.url });
      }
    } catch (error) {
      alert('Erro ao fazer upload da imagem');
    } finally {
      setUploadingBanner(false);
    }
  }

  async function handleSaveBanner(e: any) {
    e.preventDefault();
    
    if (!bannerForm.imagem_url) {
      alert('Imagem é obrigatória');
      return;
    }

    try {
      const url = editingBanner
        ? `/api/client/${params.slug}/banners/${editingBanner.id}`
        : `/api/client/${params.slug}/banners`;
      const method = editingBanner ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bannerForm)
      });

      if (response.ok) {
        await loadBanners();
        resetBannerForm();
        alert(editingBanner ? 'Banner atualizado!' : 'Banner criado!');
      }
    } catch (error) {
      alert('Erro ao salvar banner');
    }
  }

  async function handleDeleteBanner(id: string) {
    if (!confirm('Deletar este banner?')) return;

    try {
      await fetch(`/api/client/${params.slug}/banners/${id}`, {
        method: 'DELETE'
      });
      await loadBanners();
      alert('Banner deletado!');
    } catch (error) {
      alert('Erro ao deletar banner');
    }
  }

  function startEditBanner(banner: any) {
    setEditingBanner(banner);
    setBannerForm({
      titulo: banner.titulo || '',
      subtitulo: banner.subtitulo || '',
      imagem_url: banner.imagem_url || '',
      link_url: banner.link_url || '',
      ordem: banner.ordem || 0,
      ativo: banner.ativo
    });
  }

  function resetBannerForm() {
    setEditingBanner(null);
    setBannerForm({
      titulo: '',
      subtitulo: '',
      imagem_url: '',
      link_url: '',
      ordem: 0,
      ativo: true
    });
  }

  async function handleSaveConfig(e: any) {
    e.preventDefault();
    setSavingConfig(true);
    
    try {
      const response = await fetch(`/api/client/${params.slug}/configuracoes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configData)
      });

      if (response.ok) {
        alert('Configurações salvas com sucesso!');
        setShowConfigModal(false);
      } else {
        alert('Erro ao salvar configurações');
      }
    } catch (error) {
      alert('Erro ao salvar configurações');
    } finally {
      setSavingConfig(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_slug');
    router.push('/');
  }

  function toggleOpcional(opcional: string) {
    setSelectedOpcionais(prev =>
      prev.includes(opcional) ? prev.filter(o => o !== opcional) : [...prev, opcional]
    );
  }

  function confirmOpcionais() {
    setFormData({ ...formData, opcionais: selectedOpcionais.join(',') });
    setShowOpcionaisModal(false);
  }

  async function handleFileUpload(e: any) {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    const newPhotos: string[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', files[i]);
        formDataUpload.append('clienteSlug', params.slug);
        const response = await fetch('/api/upload', { method: 'POST', body: formDataUpload });
        if (response.ok) {
          const data = await response.json();
          newPhotos.push(data.url);
        }
      }
      setUploadedPhotos(prev => [...prev, ...newPhotos]);
    } catch (error) {
      alert('Erro ao fazer upload');
    } finally {
      setUploading(false);
    }
  }

  function removePhoto(index: number) {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
  }

  function handlePhotoDragStart(index: number) {
    setDraggedPhotoIndex(index);
  }
  
  function handlePhotoDragOver(e: React.DragEvent) {
    e.preventDefault();
  }
  
  function handlePhotoDrop(e: React.DragEvent, dropIndex: number) {
    e.preventDefault();
    if (draggedPhotoIndex === null) return;
    setUploadedPhotos(prev => {
      const arr = [...prev];
      const dragged = arr[draggedPhotoIndex];
      arr.splice(draggedPhotoIndex, 1);
      arr.splice(dropIndex, 0, dragged);
      return arr;
    });
    setDraggedPhotoIndex(null);
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        preco: formData.preco === '' ? null : formData.preco,
        valor_troca: formData.valor_troca === '' ? null : formData.valor_troca,
        fotos: uploadedPhotos
      };
      
      const url = editingVeiculo
        ? `/api/client/${params.slug}/veiculos/${editingVeiculo.id}`
        : `/api/client/${params.slug}/veiculos`;
      const method = editingVeiculo ? 'PUT' : 'POST';
      
      const response = await fetch(url, { 
        method, 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(dataToSend) 
      });
      
      const result = await response.json();
      
      if (response.ok) {
        await loadVeiculos();
        resetForm();
        alert(editingVeiculo ? 'Veículo atualizado!' : 'Veículo cadastrado!');
      } else {
        console.error('Erro do servidor:', result);
        alert(`Erro: ${result.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao salvar veículo:', error);
      alert('Erro ao salvar veículo');
    }
  }

  async function handleToggleAtivo(id: string, ativo: boolean) {
    try {
      await fetch(`/api/client/${params.slug}/veiculos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: !ativo })
      });
      loadVeiculos();
    } catch {
      alert('Erro');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza?')) return;
    try {
      await fetch(`/api/client/${params.slug}/veiculos/${id}`, { method: 'DELETE' });
      loadVeiculos();
      alert('Veículo deletado!');
    } catch {
      alert('Erro');
    }
  }

  function resetForm() {
    setFormData({ ativo: true, destaque: false });
    setUploadedPhotos([]);
    setSelectedOpcionais([]);
    setEditingVeiculo(null);
    setShowForm(false);
  }

  function startEdit(veiculo: any) {
    setEditingVeiculo(veiculo);
    setFormData({
      ...veiculo,
      preco: (veiculo.preco === null || veiculo.preco === undefined) ? '' : veiculo.preco,
      valor_troca: (veiculo.valor_troca === null || veiculo.valor_troca === undefined) ? '' : veiculo.valor_troca,
    });
    setUploadedPhotos(veiculo.fotos || []);
    setSelectedOpcionais(veiculo.opcionais ? String(veiculo.opcionais).split(',') : []);
    setShowForm(true);
  }

  const veiculosFiltrados = useMemo(() => {
    const q = qModelo.trim().toLowerCase();
    const minAno = toNumber(fltAnoMin);
    const maxAno = toNumber(fltAnoMax);
    const minPreco = toNumber(fltPrecoMin);
    const maxPreco = toNumber(fltPrecoMax);

    return veiculos.filter((v) => {
      const marca = (v.marca || '').toString();
      const modelo = (v.modelo || '').toString();
      const versao = (v.versao || '').toString();
      const categoria = (v.categoria || '').toString();
      const ano = parseInt((v.ano || '').toString(), 10);
      const preco = Number(v.preco);

      if (q) {
        const hay = `${marca} ${modelo} ${versao}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      if (fltMarca && marca !== fltMarca) return false;
      if (fltCategoria && categoria !== fltCategoria) return false;
      if (!isNaN(minAno) && (isNaN(ano) || ano < minAno)) return false;
      if (!isNaN(maxAno) && (isNaN(ano) || ano > maxAno)) return false;
      if (!isNaN(minPreco) && (isNaN(preco) || preco < minPreco)) return false;
      if (!isNaN(maxPreco) && (isNaN(preco) || preco > maxPreco)) return false;

      return true;
    });
  }, [veiculos, qModelo, fltMarca, fltCategoria, fltAnoMin, fltAnoMax, fltPrecoMin, fltPrecoMax]);

  const limparFiltros = () => {
    setQModelo('');
    setFltMarca('');
    setFltCategoria('');
    setFltAnoMin('');
    setFltAnoMax('');
    setFltPrecoMin('');
    setFltPrecoMax('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">{clienteNome}</h1>
            <p className="text-gray-600 mt-1">Gerenciar veículos</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => window.open(`/site/${params.slug}`, '_blank')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition"
            >
              <Eye className="w-4 h-4" />
              Ver Catálogo
            </button>
            <button
              onClick={() => setShowConfigModal(true)}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition"
            >
              <Edit className="w-4 h-4" />
              Editar Catálogo
            </button>
            <button
              onClick={handleLogout}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-semibold shadow-lg transition"
            >
              <Plus className="w-5 h-5" />
              {showForm ? 'Cancelar' : 'Novo Veículo'}
            </button>
          </div>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-t-4 border-orange-600">
            <h2 className="text-2xl font-bold mb-6">{editingVeiculo ? 'Editar Veículo' : 'Novo Veículo'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Autocomplete
                  label="Tipo"
                  value={formData.tipo || ''}
                  onChange={(value) => setFormData({ ...formData, tipo: value.toLowerCase() })}
                  options={['Carro', 'Moto', 'Caminhão', 'Scooter Elétrica']}
                  placeholder="Digite o tipo..."
                />
              </div>

              {/* NOVO: Autocomplete FIPE em cascata */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-bold text-blue-900 mb-3">📋 Dados da FIPE (Marca, Modelo e Versão)</h3>
                <p className="text-xs text-blue-700 mb-3">
                  💡 Use as sugestões da FIPE como auxílio, mas você pode digitar QUALQUER valor personalizado
                </p>
                <FIPEAutocomplete
                  tipo={formData.tipo || 'carro'}
                  initialMarca={formData.marca || ''}
                  initialModelo={formData.modelo || ''}
                  initialVersao={formData.versao || ''}
                  onDadosChange={(dados) => {
                    setFormData({
                      ...formData,
                      marca: dados.marca,
                      modelo: dados.modelo,
                      versao: dados.versao,
                      // Auto-fill de categoria e combustível se detectados
                      categoria: dados.categoria || formData.categoria,
                      combustivel: dados.combustivel || formData.combustivel
                    });
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Ano</label>
                  <input
                    type="text"
                    value={formData.ano || ''}
                    onChange={(e) => setFormData({ ...formData, ano: e.target.value })}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="2023"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Ano Fabricação</label>
                  <input
                    type="text"
                    value={formData.ano_fabricacao || ''}
                    onChange={(e) => setFormData({ ...formData, ano_fabricacao: e.target.value })}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="2022"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">KM</label>
                  <input
                    type="text"
                    value={formData.km || ''}
                    onChange={(e) => setFormData({ ...formData, km: e.target.value })}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>

                <Autocomplete
                  label="Cor"
                  value={formData.cor || ''}
                  onChange={(value) => setFormData({ ...formData, cor: value })}
                  options={CORES}
                  placeholder="Digite a cor..."
                />

                <Autocomplete
                  label="Combustível"
                  value={formData.combustivel || ''}
                  onChange={(value) => setFormData({ ...formData, combustivel: value })}
                  options={COMBUSTIVEIS}
                  placeholder="Digite o combustível..."
                />

                <Autocomplete
                  label="Câmbio"
                  value={formData.cambio || ''}
                  onChange={(value) => setFormData({ ...formData, cambio: value })}
                  options={CAMBIOS}
                  placeholder="Digite o câmbio..."
                />

                <div>
                  <label className="block text-sm font-semibold mb-2">Motor</label>
                  <input
                    type="text"
                    value={formData.motor || ''}
                    onChange={(e) => setFormData({ ...formData, motor: e.target.value })}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="1.0, 2.0..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Portas</label>
                  <input
                    type="text"
                    value={formData.portas || ''}
                    onChange={(e) => setFormData({ ...formData, portas: e.target.value })}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Cilindrada</label>
                  <input
                    type="text"
                    value={formData.cilindrada || ''}
                    onChange={(e) => setFormData({ ...formData, cilindrada: e.target.value })}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="Ex: 2000cc"
                  />
                </div>

                <Autocomplete
                  label="Categoria"
                  value={formData.categoria || ''}
                  onChange={(value) => setFormData({ ...formData, categoria: value })}
                  options={CATEGORIAS}
                  placeholder="Digite a categoria..."
                />

                <div>
                  <label className="block text-sm font-semibold mb-2">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.preco ?? ''}
                    onChange={(e) => setFormData({ ...formData, preco: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Valor na Troca (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.valor_troca ?? ''}
                    onChange={(e) => setFormData({ ...formData, valor_troca: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Observações</label>
                <textarea
                  value={formData.observacao || ''}
                  onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                  rows={4}
                  placeholder="Informações adicionais sobre o veículo..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Opcionais</label>
                <button
                  type="button"
                  onClick={() => setShowOpcionaisModal(true)}
                  className="w-full bg-gray-100 hover:bg-gray-200 border-2 border-gray-300 rounded-lg px-4 py-3 text-left transition"
                >
                  {selectedOpcionais.length === 0 ? 'Selecionar opcionais' : `${selectedOpcionais.length} selecionados`}
                </button>
                {selectedOpcionais.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedOpcionais.map((op) => (
                      <span key={op} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">{op}</span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Fotos {uploadedPhotos.length > 0 && '(arraste para reordenar)'}</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input type="file" multiple accept="image/*" onChange={handleFileUpload} disabled={uploading} className="hidden" id="photo-upload"/>
                  <label htmlFor="photo-upload" className="flex flex-col items-center cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mb-2"/>
                    <span className="text-sm text-gray-600">{uploading ? 'Fazendo upload...' : 'Clique para upload'}</span>
                  </label>
                </div>
                {uploadedPhotos.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                    {uploadedPhotos.map((photo, index) => (
                      <div
                        key={index}
                        draggable
                        onDragStart={() => handlePhotoDragStart(index)}
                        onDragOver={handlePhotoDragOver}
                        onDrop={(e) => handlePhotoDrop(e, index)}
                        className="relative group cursor-move"
                      >
                        <div className="absolute top-2 left-2 bg-white bg-opacity-75 p-1 rounded opacity-0 group-hover:opacity-100 transition">
                          <GripVertical className="w-4 h-4 text-gray-600"/>
                        </div>
                        <img src={photo} alt={`Foto ${index + 1}`} className="w-full h-32 object-cover rounded"/>
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="w-4 h-4"/>
                        </button>
                        <div className="absolute bottom-2 left-2 bg-orange-600 text-white px-2 py-1 rounded text-xs font-bold">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg">
                  {editingVeiculo ? 'Atualizar' : 'Cadastrar'}
                </button>
                <button type="button" onClick={resetForm} className="bg-gray-400 hover:bg-gray-500 text-white px-8 py-3 rounded-lg font-semibold">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg mb-4 sticky top-0 z-20">
          <div className="p-4 grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold mb-1 text-gray-600">Buscar por modelo</label>
              <input
                type="text"
                value={qModelo}
                onChange={(e) => setQModelo(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                placeholder="Ex.: Corolla, Civic, T-Cross..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-600">Marca</label>
              <select
                value={fltMarca}
                onChange={(e) => setFltMarca(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 outline-none"
              >
                <option value="">Todas</option>
                {Array.from(new Set(veiculos.map(v => v.marca))).sort().map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-600">Categoria</label>
              <select
                value={fltCategoria}
                onChange={(e) => setFltCategoria(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 outline-none"
              >
                <option value="">Todas</option>
                {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-semibold mb-1 text-gray-600">Ano mín.</label>
                <input
                  type="number"
                  value={fltAnoMin}
                  onChange={(e) => setFltAnoMin(e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 outline-none"
                  placeholder="Ex.: 2015"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold mb-1 text-gray-600">Ano máx.</label>
                <input
                  type="number"
                  value={fltAnoMax}
                  onChange={(e) => setFltAnoMax(e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 outline-none"
                  placeholder="Ex.: 2024"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-semibold mb-1 text-gray-600">Valor mín. (R$)</label>
                <input
                  type="number"
                  value={fltPrecoMin}
                  onChange={(e) => setFltPrecoMin(e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 outline-none"
                  placeholder="0"
                  min={0}
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold mb-1 text-gray-600">Valor máx. (R$)</label>
                <input
                  type="number"
                  value={fltPrecoMax}
                  onChange={(e) => setFltPrecoMax(e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 outline-none"
                  placeholder="500000"
                  min={0}
                />
              </div>
            </div>

            <div className="md:col-span-6 flex justify-between items-center">
              <p className="text-sm text-gray-600">{veiculosFiltrados.length} veículo(s) encontrado(s)</p>
              <button onClick={limparFiltros} className="text-sm text-orange-700 hover:text-orange-800 font-semibold">
                Limpar filtros
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-6">
            <h2 className="text-2xl font-bold text-white">Veículos Cadastrados</h2>
            <p className="text-orange-100 mt-1">{veiculos.length} no total</p>
          </div>

          {veiculos.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 text-lg">Nenhum veículo cadastrado</p>
            </div>
          ) : (
            <div className="p-4 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {veiculosFiltrados.map((veiculo: any) => {
                const precoNum = Number(veiculo.preco);
                const precoFmt = isNaN(precoNum) ? null : precoNum.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
                return (
                  <div key={veiculo.id} className="border rounded-xl overflow-hidden hover:shadow-md transition bg-white">
                    {veiculo.fotos && veiculo.fotos.length > 0 ? (
                      <img src={veiculo.fotos[0]} alt={`${veiculo.marca} ${veiculo.modelo}`} className="w-full h-40 object-cover" />
                    ) : (
                      <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">Sem foto</div>
                    )}
                    <div className="p-3">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h3 className="text-base font-bold text-gray-800">{veiculo.marca} {veiculo.modelo}</h3>
                          <p className="text-xs text-gray-600">{veiculo.versao}</p>
                        </div>
                        {veiculo.preco !== undefined && veiculo.preco !== null && (
                          <div className="text-sm font-extrabold text-orange-600 whitespace-nowrap">R$ {precoFmt ?? '0,00'}</div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 my-2">
                        <div><strong>Ano:</strong> {veiculo.ano ?? '-'}</div>
                        <div><strong>KM:</strong> {veiculo.km ?? '-'}</div>
                        <div><strong>Cor:</strong> {veiculo.cor ?? '-'}</div>
                        <div><strong>Câmbio:</strong> {veiculo.cambio ?? '-'}</div>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => handleToggleAtivo(veiculo.id, veiculo.ativo)}
                          className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold ${veiculo.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                        >
                          {veiculo.ativo ? <><ToggleRight className="w-4 h-4"/>Ativo</> : <><ToggleLeft className="w-4 h-4"/>Inativo</>}
                        </button>
                        <button onClick={() => startEdit(veiculo)} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                          <Edit className="w-3 h-3"/>Editar
                        </button>
                        <button onClick={() => handleDelete(veiculo.id)} className="bg-red-100 text-red-800 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                          <Trash2 className="w-3 h-3"/>Deletar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showConfigModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6">
              <h3 className="text-2xl font-bold text-white">Configurar Catálogo Online</h3>
              <p className="text-purple-100 text-sm mt-1">
                Configure as informações que aparecerão no seu catálogo público
              </p>
            </div>
            
            <form onSubmit={handleSaveConfig} className="p-6 space-y-6">
              {/* Logo */}
              <div className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
                <label className="block text-sm font-bold text-purple-900 mb-3">
                  🎨 Logo da Empresa
                </label>
                <div className="flex items-center gap-4">
                  {configData.logo_url && (
                    <img src={configData.logo_url} alt="Logo" className="h-20 object-contain" />
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg inline-block transition disabled:opacity-50"
                    >
                      {uploadingLogo ? 'Fazendo upload...' : configData.logo_url ? 'Alterar Logo' : 'Fazer Upload do Logo'}
                    </label>
                    <p className="text-sm text-gray-600 mt-2">
                      Recomendado: PNG com fundo transparente, 200x80px
                    </p>
                  </div>
                </div>
              </div>

              {/* Informações de Contato */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📍 Endereço da Loja
                  </label>
                  <input
                    type="text"
                    value={configData.endereco}
                    onChange={(e) => setConfigData({ ...configData, endereco: e.target.value })}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    placeholder="Rua Exemplo, 123 - Centro, Cidade/UF"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📧 Email de Contato
                  </label>
                  <input
                    type="email"
                    value={configData.email_contato}
                    onChange={(e) => setConfigData({ ...configData, email_contato: e.target.value })}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    placeholder="contato@empresa.com.br"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📞 WhatsApp (com DDD)
                  </label>
                  <input
                    type="text"
                    value={configData.whatsapp}
                    onChange={(e) => setConfigData({ ...configData, whatsapp: e.target.value })}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    placeholder="51999999999"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🕐 Horário de Atendimento
                  </label>
                  <input
                    type="text"
                    value={configData.horario_atendimento}
                    onChange={(e) => setConfigData({ ...configData, horario_atendimento: e.target.value })}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    placeholder="Seg a Sex: 8h às 18h | Sáb: 8h às 12h"
                  />
                </div>
              </div>

              {/* Redes Sociais */}
              <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                <label className="block text-sm font-bold text-blue-900 mb-3">
                  📱 Redes Sociais
                </label>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Instagram
                    </label>
                    <input
                      type="url"
                      value={configData.instagram_url}
                      onChange={(e) => setConfigData({ ...configData, instagram_url: e.target.value })}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                      placeholder="https://instagram.com/seu_perfil"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Facebook
                    </label>
                    <input
                      type="url"
                      value={configData.facebook_url}
                      onChange={(e) => setConfigData({ ...configData, facebook_url: e.target.value })}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                      placeholder="https://facebook.com/sua_pagina"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      value={configData.linkedin_url}
                      onChange={(e) => setConfigData({ ...configData, linkedin_url: e.target.value })}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                      placeholder="https://linkedin.com/company/sua_empresa"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      YouTube
                    </label>
                    <input
                      type="url"
                      value={configData.youtube_url}
                      onChange={(e) => setConfigData({ ...configData, youtube_url: e.target.value })}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                      placeholder="https://youtube.com/@seu_canal"
                    />
                  </div>
                </div>
              </div>

              {/* Gerenciar Banners */}
              <div className="border-2 border-orange-200 rounded-lg p-4 bg-orange-50">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-bold text-orange-900">
                    🎬 Banners do Carrossel
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowBannersModal(true);
                      resetBannerForm();
                    }}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                  >
                    Gerenciar Banners
                  </button>
                </div>
                <p className="text-sm text-gray-600">
                  {banners.length} banner(s) cadastrado(s). Clique em "Gerenciar Banners" para adicionar, editar ou remover.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 font-semibold mb-2">
                  📱 Link do seu catálogo:
                </p>
                <code className="text-blue-600 font-mono text-sm break-all">
                  https://integrador.revendai.com.br/site/{params.slug}
                </code>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={savingConfig}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
                >
                  {savingConfig ? 'Salvando...' : 'Salvar Configurações'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showOpcionaisModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-6">
              <h3 className="text-2xl font-bold text-white">Selecionar Opcionais</h3>
            </div>
            <div className="p-6 overflow-y-auto max-h-96">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {OPCIONAIS.map((opcional) => (
                  <button
                    key={opcional}
                    type="button"
                    onClick={() => toggleOpcional(opcional)}
                    className={`px-4 py-3 rounded-lg border-2 text-sm font-medium ${selectedOpcionais.includes(opcional) ? 'bg-orange-100 border-orange-500 text-orange-800' : 'bg-white border-gray-300'}`}
                  >
                    {opcional}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-6 border-t flex gap-3">
              <button type="button" onClick={confirmOpcionais} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg">Confirmar</button>
              <button type="button" onClick={() => setShowOpcionaisModal(false)} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Gerenciamento de Banners */}
      {showBannersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full my-8">
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-6">
              <h3 className="text-2xl font-bold text-white">Gerenciar Banners do Carrossel</h3>
              <p className="text-orange-100 text-sm mt-1">
                Adicione imagens que aparecerão no carrossel da página inicial
              </p>
            </div>

            <div className="p-6">
              {/* Formulário de Banner */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-bold text-lg mb-4">
                  {editingBanner ? 'Editar Banner' : 'Novo Banner'}
                </h4>
                <form onSubmit={handleSaveBanner} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Título (opcional)
                      </label>
                      <input
                        type="text"
                        value={bannerForm.titulo}
                        onChange={(e) => setBannerForm({ ...bannerForm, titulo: e.target.value })}
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                        placeholder="Ex: Ofertas Especiais"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Subtítulo (opcional)
                      </label>
                      <input
                        type="text"
                        value={bannerForm.subtitulo}
                        onChange={(e) => setBannerForm({ ...bannerForm, subtitulo: e.target.value })}
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                        placeholder="Ex: Até 50% de desconto"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Link (opcional)
                      </label>
                      <input
                        type="url"
                        value={bannerForm.link_url}
                        onChange={(e) => setBannerForm({ ...bannerForm, link_url: e.target.value })}
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                        placeholder="https://..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Ordem de Exibição
                      </label>
                      <input
                        type="number"
                        value={bannerForm.ordem}
                        onChange={(e) => setBannerForm({ ...bannerForm, ordem: parseInt(e.target.value) || 0 })}
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Imagem do Banner *
                    </label>
                    {bannerForm.imagem_url ? (
                      <div className="relative">
                        <img
                          src={bannerForm.imagem_url}
                          alt="Preview"
                          className="w-full h-40 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => setBannerForm({ ...bannerForm, imagem_url: '' })}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBannerImageUpload}
                          disabled={uploadingBanner}
                          className="hidden"
                          id="banner-upload"
                        />
                        <label
                          htmlFor="banner-upload"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                        >
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-600">
                            {uploadingBanner ? 'Fazendo upload...' : 'Clique para fazer upload'}
                          </span>
                          <span className="text-xs text-gray-500 mt-1">
                            Recomendado: 1920x600px
                          </span>
                        </label>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={bannerForm.ativo}
                      onChange={(e) => setBannerForm({ ...bannerForm, ativo: e.target.checked })}
                      className="w-4 h-4"
                      id="banner-ativo"
                    />
                    <label htmlFor="banner-ativo" className="text-sm font-semibold">
                      Banner ativo (visível no site)
                    </label>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={!bannerForm.imagem_url}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {editingBanner ? 'Atualizar Banner' : 'Adicionar Banner'}
                    </button>
                    {editingBanner && (
                      <button
                        type="button"
                        onClick={resetBannerForm}
                        className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold"
                      >
                        Cancelar Edição
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Lista de Banners */}
              <div>
                <h4 className="font-bold text-lg mb-4">Banners Cadastrados ({banners.length})</h4>
                {banners.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Nenhum banner cadastrado. Adicione o primeiro banner acima.
                  </p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {banners.map((banner) => (
                      <div
                        key={banner.id}
                        className="border-2 rounded-lg overflow-hidden hover:shadow-lg transition"
                      >
                        <img
                          src={banner.imagem_url}
                          alt={banner.titulo || 'Banner'}
                          className="w-full h-32 object-cover"
                        />
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h5 className="font-bold text-gray-800">
                                {banner.titulo || 'Sem título'}
                              </h5>
                              {banner.subtitulo && (
                                <p className="text-sm text-gray-600">{banner.subtitulo}</p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">Ordem: {banner.ordem}</p>
                            </div>
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                banner.ativo
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {banner.ativo ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => startEditBanner(banner)}
                              className="flex-1 bg-blue-100 text-blue-800 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-200 flex items-center justify-center gap-1"
                            >
                              <Edit className="w-4 h-4" />
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteBanner(banner.id)}
                              className="flex-1 bg-red-100 text-red-800 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-200 flex items-center justify-center gap-1"
                            >
                              <Trash2 className="w-4 h-4" />
                              Deletar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t">
              <button
                type="button"
                onClick={() => {
                  setShowBannersModal(false);
                  resetBannerForm();
                }}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
