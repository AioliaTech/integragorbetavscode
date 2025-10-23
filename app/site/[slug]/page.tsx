'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight, MessageCircle, Mail, Phone, MapPin, Menu, Search, SlidersHorizontal, ArrowUpDown, Calendar, Gauge, Instagram, Facebook } from 'lucide-react';

export default function CatalogoPublico({ params }: { params: { slug: string } }) {
  const [veiculos, setVeiculos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [clienteNome, setClienteNome] = useState('');
  const [configuracoes, setConfiguracoes] = useState<any>({});
  const [banners, setBanners] = useState<any[]>([]);
  const [bannerAtual, setBannerAtual] = useState(0);
  const [veiculoSelecionado, setVeiculoSelecionado] = useState<any>(null);
  const [fotoAtual, setFotoAtual] = useState(0);
  const [paginaAtual, setPaginaAtual] = useState<'home' | 'estoque' | 'contato'>('home');
  const [menuAberto, setMenuAberto] = useState(false);
  
  // Filtros
  const [filtroMarca, setFiltroMarca] = useState('');
  const [filtroBusca, setFiltroBusca] = useState('');
  
  // Paginação
  const [paginaEstoque, setPaginaEstoque] = useState(1);
  const veiculosPorPagina = 12;

  // Form contato
  const [formContato, setFormContato] = useState({
    nome: '',
    email: '',
    whatsapp: '',
    mensagem: 'Olá, tenho interesse em um veículo. Por favor entre em contato.'
  });

  useEffect(() => {
    loadDados();
  }, []);

  async function loadDados() {
    try {
      const responseVeiculos = await fetch(`/api/vehicles/${params.slug}`);
      const dataVeiculos = await responseVeiculos.json();
      
      if (dataVeiculos.cliente) {
        setClienteNome(dataVeiculos.cliente.nome || 'RevendAI');
      }
      setVeiculos(dataVeiculos.veiculos || []);

      const responseConfig = await fetch(`/api/client/${params.slug}/configuracoes`);
      const dataConfig = await responseConfig.json();
      setConfiguracoes(dataConfig.configuracoes || {});

      const responseBanners = await fetch(`/api/client/${params.slug}/banners`);
      const dataBanners = await responseBanners.json();
      if (dataBanners.banners) {
        // Filtrar apenas banners ativos
        const bannersAtivos = dataBanners.banners.filter((b: any) => b.ativo);
        setBanners(bannersAtivos);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }

  // Auto-avançar carrossel de banners
  useEffect(() => {
    if (banners.length <= 1) return;
    
    const interval = setInterval(() => {
      setBannerAtual((prev) => (prev + 1) % banners.length);
    }, 5000); // Muda a cada 5 segundos

    return () => clearInterval(interval);
  }, [banners.length]);

  function proximoBanner() {
    setBannerAtual((prev) => (prev + 1) % banners.length);
  }

  function bannerAnterior() {
    setBannerAtual((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  }

  const marcasDisponiveis = useMemo(() => {
    const marcas = new Set(veiculos.map(v => v.marca).filter(Boolean));
    return Array.from(marcas).sort();
  }, [veiculos]);

  const veiculosFiltrados = useMemo(() => {
    return veiculos.filter(v => {
      if (filtroMarca && v.marca !== filtroMarca) return false;
      if (filtroBusca) {
        const busca = filtroBusca.toLowerCase();
        const texto = `${v.marca} ${v.modelo} ${v.versao}`.toLowerCase();
        if (!texto.includes(busca)) return false;
      }
      return true;
    });
  }, [veiculos, filtroMarca, filtroBusca]);

  // Paginação
  const totalPaginas = Math.ceil(veiculosFiltrados.length / veiculosPorPagina);
  const veiculosPaginados = veiculosFiltrados.slice(
    (paginaEstoque - 1) * veiculosPorPagina,
    paginaEstoque * veiculosPorPagina
  );

  const ultimosLancamentos = veiculos.filter(v => v.destaque).slice(0, 6);
  const recomendados = veiculos.slice(0, 6);

  function abrirDetalhes(veiculo: any) {
    setVeiculoSelecionado(veiculo);
    setFotoAtual(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function fecharDetalhes() {
    setVeiculoSelecionado(null);
    setFotoAtual(0);
  }

  function proximaFoto() {
    if (veiculoSelecionado?.fotos) {
      setFotoAtual((prev) => (prev + 1) % veiculoSelecionado.fotos.length);
    }
  }

  function fotoAnterior() {
    if (veiculoSelecionado?.fotos) {
      setFotoAtual((prev) => 
        prev === 0 ? veiculoSelecionado.fotos.length - 1 : prev - 1
      );
    }
  }

  function formatarWhatsApp(numero: string) {
    return numero.replace(/\D/g, '');
  }

  function abrirWhatsApp(veiculo?: any) {
    const numero = formatarWhatsApp(configuracoes.whatsapp || '');
    let mensagem = `Olá! Vi o catálogo de ${clienteNome}`;
    
    if (veiculo) {
      mensagem += ` e tenho interesse no ${veiculo.marca} ${veiculo.modelo} ${veiculo.ano}`;
    }
    
    const url = `https://wa.me/55${numero}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  }

  function navegarPara(pagina: 'home' | 'estoque' | 'contato') {
    setPaginaAtual(pagina);
    setMenuAberto(false);
    setVeiculoSelecionado(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function enviarFormulario(e: React.FormEvent) {
    e.preventDefault();
    
    if (configuracoes.whatsapp) {
      const numero = formatarWhatsApp(configuracoes.whatsapp);
      const mensagem = veiculoSelecionado 
        ? `Nome: ${formContato.nome}\nEmail: ${formContato.email}\nWhatsApp: ${formContato.whatsapp}\n\nTenho interesse no ${veiculoSelecionado.marca} ${veiculoSelecionado.modelo}`
        : `Nome: ${formContato.nome}\nEmail: ${formContato.email}\nWhatsApp: ${formContato.whatsapp}\n\n${formContato.mensagem}`;
      const url = `https://wa.me/55${numero}?text=${encodeURIComponent(mensagem)}`;
      window.open(url, '_blank');
      
      setFormContato({
        nome: '',
        email: '',
        whatsapp: '',
        mensagem: 'Olá, tenho interesse em um veículo. Por favor entre em contato.'
      });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Componente de Card de Veículo (seguindo EXATAMENTE o design do PDF)
  const VeiculoCard = ({ veiculo }: { veiculo: any }) => {
    const precoNum = Number(veiculo.preco);
    const precoFmt = isNaN(precoNum) ? null : precoNum.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    
    return (
      <div
        onClick={() => abrirDetalhes(veiculo)}
        className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
      >
        <div className="relative">
          {veiculo.fotos && veiculo.fotos.length > 0 ? (
            <img
              src={veiculo.fotos[0]}
              alt={`${veiculo.marca} ${veiculo.modelo}`}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400">Sem foto</span>
            </div>
          )}
          {veiculo.fotos && veiculo.fotos.length > 1 && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
              {veiculo.fotos.slice(0, 6).map((_: any, idx: number) => (
                <div key={idx} className={`w-1.5 h-1.5 rounded-full ${idx === 0 ? 'bg-white' : 'bg-white bg-opacity-50'}`}></div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-bold text-base mb-0.5 text-gray-900">
            {veiculo.marca} {veiculo.modelo}
          </h3>
          <p className="text-sm text-gray-600 mb-3">{veiculo.versao || `${veiculo.motor || ''} ${veiculo.cambio || ''}`}</p>
          
          <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{veiculo.ano || '2025'}/{veiculo.ano_fabricacao || veiculo.ano || '2026'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Gauge className="w-4 h-4" />
              <span>{veiculo.km || '0'} km</span>
            </div>
          </div>
          
          {veiculo.preco !== undefined && veiculo.preco !== null && (
            <p className="text-2xl font-bold text-red-600">
              R$ {precoFmt ?? '0'}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* HEADER - Exatamente como no PDF */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <button onClick={() => navegarPara('home')} className="flex items-center gap-2">
              {configuracoes.logo_url ? (
                <img
                  src={configuracoes.logo_url}
                  alt={clienteNome}
                  className="h-12 object-contain"
                />
              ) : (
                <>
                  <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                    <div className="text-white font-bold text-2xl leading-none">=</div>
                  </div>
                  <span className="text-2xl font-bold">
                    <span className="text-gray-900">Revend</span>
                    <span className="text-red-600">AI</span>
                  </span>
                </>
              )}
            </button>

            {/* Menu Desktop */}
            <nav className="hidden md:flex items-center gap-10">
              <button
                onClick={() => navegarPara('home')}
                className={`font-medium ${paginaAtual === 'home' ? 'text-red-600 underline' : 'text-gray-700 hover:text-gray-900'}`}
              >
                Início
              </button>
              <button
                onClick={() => navegarPara('estoque')}
                className={`font-medium ${paginaAtual === 'estoque' ? 'text-red-600 underline' : 'text-gray-700 hover:text-gray-900'}`}
              >
                Estoque
              </button>
              <button
                onClick={() => navegarPara('contato')}
                className={`font-medium ${paginaAtual === 'contato' ? 'text-red-600 underline' : 'text-gray-700 hover:text-gray-900'}`}
              >
                Contato
              </button>
            </nav>

            {/* Botão Entrar em Contato */}
            <button
              onClick={() => navegarPara('contato')}
              className="hidden md:block bg-black text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition"
            >
              Entrar em contato
            </button>

            {/* Menu Mobile */}
            <button onClick={() => setMenuAberto(!menuAberto)} className="md:hidden">
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {menuAberto && (
            <div className="md:hidden pb-4 space-y-2">
              <button onClick={() => navegarPara('home')} className="block w-full text-left py-2 text-gray-700 font-medium">Início</button>
              <button onClick={() => navegarPara('estoque')} className="block w-full text-left py-2 text-gray-700 font-medium">Estoque</button>
              <button onClick={() => navegarPara('contato')} className="block w-full text-left py-2 text-gray-700 font-medium">Contato</button>
            </div>
          )}
        </div>
      </header>

      {/* CONTEÚDO */}
      {!veiculoSelecionado && (
        <>
          {/* HOME */}
          {paginaAtual === 'home' && (
            <>
              {/* Carrossel de Banners */}
              <section className="relative bg-black overflow-hidden" style={{ minHeight: '500px' }}>
                {banners.length > 0 ? (
                  <div className="relative w-full h-full">
                    {/* Banner Atual */}
                    <div className="relative w-full" style={{ minHeight: '500px' }}>
                      <img
                        src={banners[bannerAtual].imagem_url}
                        alt={banners[bannerAtual].titulo || 'Banner'}
                        className="w-full h-full object-cover"
                        style={{ minHeight: '500px' }}
                      />
                      
                      {/* Overlay escuro para melhor legibilidade */}
                      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                      
                      {/* Texto do Banner */}
                      {(banners[bannerAtual].titulo || banners[bannerAtual].subtitulo) && (
                        <div className="absolute inset-0 flex items-center">
                          <div className="max-w-7xl mx-auto px-6 w-full">
                            <div className="max-w-2xl">
                              {banners[bannerAtual].titulo && (
                                <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
                                  {banners[bannerAtual].titulo}
                                </h1>
                              )}
                              {banners[bannerAtual].subtitulo && (
                                <p className="text-xl md:text-2xl text-gray-200 mb-8">
                                  {banners[bannerAtual].subtitulo}
                                </p>
                              )}
                              {banners[bannerAtual].link_url && (
                                <a
                                  href={banners[bannerAtual].link_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-block bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition"
                                >
                                  Saiba Mais
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Controles do Carrossel */}
                    {banners.length > 1 && (
                      <>
                        <button
                          onClick={bannerAnterior}
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition z-20"
                        >
                          <ChevronLeft className="w-6 h-6 text-white" />
                        </button>
                        <button
                          onClick={proximoBanner}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition z-20"
                        >
                          <ChevronRight className="w-6 h-6 text-white" />
                        </button>

                        {/* Indicadores */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                          {banners.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setBannerAtual(idx)}
                              className={`w-3 h-3 rounded-full transition ${
                                idx === bannerAtual ? 'bg-white' : 'bg-white bg-opacity-50'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  /* Banner Padrão caso não haja banners cadastrados */
                  <>
                    <div className="absolute inset-0">
                      <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-br from-red-600/20 to-transparent"></div>
                      <div className="absolute top-20 right-32 w-96 h-96 bg-red-600 opacity-30 transform rotate-45"></div>
                      <div className="absolute top-48 right-0 w-80 h-80 bg-red-700 opacity-20 transform rotate-12"></div>
                      <div className="absolute bottom-0 right-64 w-64 h-64 bg-red-800 opacity-25 transform -rotate-12"></div>
                    </div>
                    
                    <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
                      <div className="max-w-xl">
                        <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
                          Encontre o carro<br />ideal para você
                        </h1>
                        <p className="text-xl text-gray-300 mb-4">
                          Explore nosso catálogo de automóveis com
                        </p>
                        <p className="text-xl text-gray-300 mb-8">
                          qualidade, e as melhores condições da região.
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </section>

              {/* Logos de Marcas - EXATAMENTE como no PDF */}
              <section className="bg-gray-50 py-10">
                <div className="max-w-7xl mx-auto px-6">
                  <div className="flex items-center justify-center gap-8 flex-wrap">
                    {['Volkswagen', 'Chevrolet', 'Fiat', 'Ford', 'Honda', 'Hyundai'].map((marca) => (
                      <button
                        key={marca}
                        onClick={() => {
                          if (marcasDisponiveis.includes(marca)) {
                            setFiltroMarca(marca);
                            navegarPara('estoque');
                          }
                        }}
                        className="w-24 h-24 bg-white rounded-full shadow-md hover:shadow-lg transition flex items-center justify-center group"
                      >
                        <span className="text-gray-400 group-hover:text-gray-600 text-xs font-semibold">
                          {marca.substring(0, 2).toUpperCase()}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* Últimos Lançamentos */}
              {ultimosLancamentos.length > 0 && (
                <section className="py-16 bg-white">
                  <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-3xl font-bold text-gray-900">Últimos lançamentos</h2>
                      <button onClick={() => navegarPara('estoque')} className="text-red-600 hover:text-red-700 font-medium">
                        Ver tudo
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {ultimosLancamentos.map((veiculo) => (
                        <VeiculoCard key={veiculo.id} veiculo={veiculo} />
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* Diferenciais - 3 Cards */}
              <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6">
                  <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-white p-8 rounded-xl shadow-sm text-center">
                      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-gray-900">Nossa equipe está pronta pra</h3>
                      <p className="text-gray-600">te ajudar de forma clara.</p>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-sm text-center">
                      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-gray-900">Carros selecionados com rigor,</h3>
                      <p className="text-gray-600">revisados e prontos pra rodar.</p>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-sm text-center">
                      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-gray-900">Do atendimento à entrega,</h3>
                      <p className="text-gray-600">cuidamos de cada detalhe.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Recomendados */}
              {recomendados.length > 0 && (
                <section className="py-16 bg-white">
                  <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-3xl font-bold text-gray-900">Recomendados para você</h2>
                      <button onClick={() => navegarPara('estoque')} className="text-red-600 hover:text-red-700 font-medium">
                        Ver tudo
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {recomendados.map((veiculo) => (
                        <VeiculoCard key={veiculo.id} veiculo={veiculo} />
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* Redes Sociais */}
              {(configuracoes.instagram_url || configuracoes.facebook_url || configuracoes.linkedin_url || configuracoes.youtube_url) && (
                <section className="bg-black py-16">
                  <div className="max-w-7xl mx-auto px-6 text-center">
                    {configuracoes.logo_url ? (
                      <img src={configuracoes.logo_url} alt={clienteNome} className="h-16 object-contain mx-auto mb-6" />
                    ) : (
                      <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <div className="text-white font-bold text-3xl leading-none">=</div>
                      </div>
                    )}
                    <h2 className="text-3xl font-bold text-white mb-8">Nos siga nas redes sociais</h2>
                    <div className="flex items-center justify-center gap-4">
                      {configuracoes.instagram_url && (
                        <a
                          href={configuracoes.instagram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-14 h-14 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition"
                        >
                          <Instagram className="w-6 h-6 text-black" />
                        </a>
                      )}
                      {configuracoes.facebook_url && (
                        <a
                          href={configuracoes.facebook_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-14 h-14 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition"
                        >
                          <Facebook className="w-6 h-6 text-black" />
                        </a>
                      )}
                    </div>
                  </div>
                </section>
              )}
            </>
          )}

          {/* ESTOQUE - EXATAMENTE como no PDF */}
          {paginaAtual === 'estoque' && (
            <section className="py-8 bg-gray-50 min-h-screen">
              <div className="max-w-7xl mx-auto px-6">
                {/* Barra de Busca - EXATAMENTE como no PDF */}
                <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={filtroBusca}
                      onChange={(e) => setFiltroBusca(e.target.value)}
                      placeholder="Buscar veículo"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5" />
                    <span className="font-medium">Filtrar</span>
                  </button>
                  <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
                    <ArrowUpDown className="w-5 h-5" />
                    <span className="font-medium">Ordenar</span>
                  </button>
                </div>

                {/* Logos de Marcas - Horizontal */}
                <div className="mb-8">
                  <div className="flex items-center gap-6 overflow-x-auto pb-2">
                    <button
                      onClick={() => setFiltroMarca('')}
                      className={`flex-shrink-0 w-20 h-20 rounded-full shadow flex items-center justify-center transition ${
                        filtroMarca === '' ? 'bg-red-600 text-white' : 'bg-white text-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-xs font-bold">Todas</span>
                    </button>
                    {['Volkswagen', 'Chevrolet', 'Fiat', 'Ford', 'Honda', 'Hyundai'].map((marca) => (
                      <button
                        key={marca}
                        onClick={() => setFiltroMarca(marca)}
                        className={`flex-shrink-0 w-20 h-20 rounded-full shadow flex items-center justify-center transition ${
                          filtroMarca === marca ? 'bg-red-600 text-white' : 'bg-white text-gray-400 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-xs font-bold">{marca.substring(0, 2).toUpperCase()}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Contador */}
                <div className="mb-6">
                  <p className="text-lg text-gray-700 font-medium">
                    {veiculosFiltrados.length} carros encontrados
                  </p>
                </div>

                {/* Grid de Veículos - 3 colunas como no PDF */}
                {veiculosPaginados.length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-gray-500 text-lg">Nenhum veículo encontrado</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      {veiculosPaginados.map((veiculo) => (
                        <VeiculoCard key={veiculo.id} veiculo={veiculo} />
                      ))}
                    </div>

                    {/* Paginação - EXATAMENTE como no PDF */}
                    {totalPaginas > 1 && (
                      <div className="flex items-center justify-center gap-2">
                        {Array.from({ length: Math.min(totalPaginas, 4) }, (_, i) => i + 1).map(pagina => (
                          <button
                            key={pagina}
                            onClick={() => setPaginaEstoque(pagina)}
                            className={`w-10 h-10 rounded-lg font-semibold transition ${
                              pagina === paginaEstoque
                                ? 'bg-red-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                            }`}
                          >
                            {pagina}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>
          )}

          {/* CONTATO - EXATAMENTE como no PDF */}
          {paginaAtual === 'contato' && (
            <section className="py-16 bg-gray-50 min-h-screen">
              <div className="max-w-7xl mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-12">
                  {/* Coluna Esquerda */}
                  <div>
                    <div className="mb-2 w-1 h-12 bg-red-600 rounded-full"></div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Entre em contato!</h1>
                    <p className="text-lg text-gray-600 mb-12">
                      Estamos prontos pra te ajudar a encontrar o carro<br />
                      ideal ou tirar suas dúvidas sobre nossos veículos.
                    </p>

                    {/* Informações de Contato */}
                    <div className="space-y-6 mb-12">
                      {configuracoes.endereco && (
                        <div className="flex items-start gap-4">
                          <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 mt-1">
                            <MapPin className="w-6 h-6 text-red-600" />
                          </div>
                          <div>
                            <p className="text-gray-900 leading-relaxed">{configuracoes.endereco}</p>
                          </div>
                        </div>
                      )}

                      {configuracoes.whatsapp && (
                        <div className="flex items-start gap-4">
                          <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 mt-1">
                            <Phone className="w-6 h-6 text-red-600" />
                          </div>
                          <div>
                            <p className="text-gray-900">{configuracoes.whatsapp}</p>
                          </div>
                        </div>
                      )}

                      {configuracoes.email_contato && (
                        <div className="flex items-start gap-4">
                          <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 mt-1">
                            <Mail className="w-6 h-6 text-red-600" />
                          </div>
                          <div>
                            <p className="text-gray-900">{configuracoes.email_contato}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Mapa */}
                    <div className="bg-gray-200 rounded-xl h-80 flex items-center justify-center">
                      <p className="text-gray-500">[ Mapa ]</p>
                    </div>
                  </div>

                  {/* Coluna Direita - Formulário */}
                  <div className="bg-white rounded-xl shadow-md p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Tem alguma dúvida?</h2>
                    
                    <form onSubmit={enviarFormulario} className="space-y-5">
                      <div>
                        <input
                          type="text"
                          required
                          value={formContato.nome}
                          onChange={(e) => setFormContato({ ...formContato, nome: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                          placeholder="Nome*"
                        />
                      </div>

                      <div>
                        <input
                          type="email"
                          required
                          value={formContato.email}
                          onChange={(e) => setFormContato({ ...formContato, email: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                          placeholder="E-mail*"
                        />
                      </div>

                      <div>
                        <input
                          type="tel"
                          required
                          value={formContato.whatsapp}
                          onChange={(e) => setFormContato({ ...formContato, whatsapp: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                          placeholder="WhatsApp*"
                        />
                      </div>

                      <div>
                        <textarea
                          required
                          rows={5}
                          value={formContato.mensagem}
                          onChange={(e) => setFormContato({ ...formContato, mensagem: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 resize-none"
                          placeholder="Olá, tenho interesse em um veículo. Por favor entre em contato."
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-black text-white font-semibold py-4 rounded-lg hover:bg-gray-800 transition"
                      >
                        Enviar mensagem
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* DETALHES DO VEÍCULO - EXATAMENTE como no PDF */}
      {veiculoSelecionado && (
        <div className="bg-white min-h-screen">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Coluna Principal - 2/3 */}
              <div className="lg:col-span-2 space-y-6">
                {/* Galeria de Fotos */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  {veiculoSelecionado.fotos && veiculoSelecionado.fotos.length > 0 ? (
                    <div className="relative bg-gray-100">
                      <img
                        src={veiculoSelecionado.fotos[fotoAtual]}
                        alt={`Foto ${fotoAtual + 1}`}
                        className="w-full h-96 object-cover"
                      />
                      
                      {veiculoSelecionado.fotos.length > 1 && (
                        <>
                          <button
                            onClick={fotoAnterior}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition"
                          >
                            <ChevronLeft className="w-6 h-6" />
                          </button>
                          <button
                            onClick={proximaFoto}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition"
                          >
                            <ChevronRight className="w-6 h-6" />
                          </button>
                          
                          {/* Dots indicadores */}
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                            {veiculoSelecionado.fotos.map((_: any, idx: number) => (
                              <button
                                key={idx}
                                onClick={() => setFotoAtual(idx)}
                                className={`w-2 h-2 rounded-full transition ${
                                  idx === fotoAtual ? 'bg-white' : 'bg-white bg-opacity-50'
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">Sem fotos</span>
                    </div>
                  )}
                </div>

                {/* Título e Informações */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  {/* Título Grande - MARCA em preto, MODELO em vermelho */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h1 className="text-4xl font-bold mb-2">
                        <span className="text-gray-900">{veiculoSelecionado.marca} </span>
                        <span className="text-red-600">{veiculoSelecionado.modelo}</span>
                      </h1>
                      <p className="text-lg text-gray-600">{veiculoSelecionado.versao}</p>
                    </div>
                    {veiculoSelecionado.preco !== undefined && veiculoSelecionado.preco !== null && (
                      <div className="text-right">
                        <p className="text-4xl font-bold text-red-600">
                          R$ {Number(veiculoSelecionado.preco).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Grid de Informações - 4 colunas */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {veiculoSelecionado.ano && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1 font-semibold">Ano</p>
                        <p className="text-gray-900 font-medium">{veiculoSelecionado.ano}/{veiculoSelecionado.ano_fabricacao || veiculoSelecionado.ano}</p>
                      </div>
                    )}
                    {veiculoSelecionado.km && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1 font-semibold">KM</p>
                        <p className="text-gray-900 font-medium">{veiculoSelecionado.km}</p>
                      </div>
                    )}
                    {veiculoSelecionado.cambio && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1 font-semibold">Câmbio</p>
                        <p className="text-gray-900 font-medium capitalize">{veiculoSelecionado.cambio}</p>
                      </div>
                    )}
                    {veiculoSelecionado.categoria && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1 font-semibold">Carroceria</p>
                        <p className="text-gray-900 font-medium">{veiculoSelecionado.categoria}</p>
                      </div>
                    )}
                    {veiculoSelecionado.combustivel && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1 font-semibold">Combustível</p>
                        <p className="text-gray-900 font-medium capitalize">{veiculoSelecionado.combustivel}</p>
                      </div>
                    )}
                    {veiculoSelecionado.cor && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1 font-semibold">Cor</p>
                        <p className="text-gray-900 font-medium">{veiculoSelecionado.cor}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600 mb-1 font-semibold">Condição do veículo</p>
                      <p className="text-gray-900 font-medium">Novo</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1 font-semibold">Final de placa</p>
                      <p className="text-gray-900 font-medium">1</p>
                    </div>
                  </div>

                  {/* Opcionais */}
                  {veiculoSelecionado.opcionais && (
                    <div className="border-t pt-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Opcionais</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
                        {String(veiculoSelecionado.opcionais).split(',').map((opcional, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                            <span className="text-gray-700 text-sm capitalize">{opcional.trim()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Informações Adicionais */}
                  {veiculoSelecionado.observacao && (
                    <div className="border-t pt-6 mt-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">+ Informações</h3>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {veiculoSelecionado.observacao}
                      </p>
                    </div>
                  )}
                </div>

                {/* Recomendados */}
                {recomendados.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Recomendados para você</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {recomendados.slice(0, 3).map((veiculo) => (
                        <VeiculoCard key={veiculo.id} veiculo={veiculo} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar Direita - Formulário */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    Quer saber mais sobre este veículo?
                  </h2>
                  <p className="text-gray-600 text-sm mb-6">
                    Fale com nossa equipe e tire todas as<br />
                    suas dúvidas agora mesmo.
                  </p>

                  <form onSubmit={enviarFormulario} className="space-y-4">
                    <input
                      type="text"
                      required
                      value={formContato.nome}
                      onChange={(e) => setFormContato({ ...formContato, nome: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                      placeholder="Nome*"
                    />

                    <input
                      type="email"
                      required
                      value={formContato.email}
                      onChange={(e) => setFormContato({ ...formContato, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                      placeholder="E-mail*"
                    />

                    <input
                      type="tel"
                      required
                      value={formContato.whatsapp}
                      onChange={(e) => setFormContato({ ...formContato, whatsapp: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                      placeholder="WhatsApp*"
                    />

                    <textarea
                      required
                      rows={4}
                      value={formContato.mensagem}
                      onChange={(e) => setFormContato({ ...formContato, mensagem: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 resize-none"
                      placeholder="Olá, tenho interesse no veículo. Por favor entre em contato."
                    />

                    <button
                      type="submit"
                      className="w-full bg-black text-white font-semibold py-3 rounded-lg hover:bg-gray-800 transition"
                    >
                      Enviar mensagem
                    </button>

                    <div className="text-center text-sm text-gray-500 my-3">Ou</div>

                    {configuracoes.whatsapp && (
                      <button
                        type="button"
                        onClick={() => abrirWhatsApp(veiculoSelecionado)}
                        className="w-full bg-green-500 text-white font-semibold py-3 rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="w-5 h-5" />
                        Chamar no WhatsApp
                      </button>
                    )}
                  </form>
                </div>
              </div>
            </div>

            {/* Botão Voltar */}
            <div className="mt-8">
              <button
                onClick={fecharDetalhes}
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium"
              >
                <ChevronLeft className="w-5 h-5" />
                Voltar ao estoque
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER - EXATAMENTE como no PDF */}
      {!veiculoSelecionado && (
        <footer className="bg-black text-white py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-12 mb-8">
              {/* Logo */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  {configuracoes.logo_url ? (
                    <img src={configuracoes.logo_url} alt={clienteNome} className="h-12 object-contain" />
                  ) : (
                    <>
                      <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                        <div className="text-white font-bold text-2xl leading-none">=</div>
                      </div>
                      <span className="text-2xl font-bold">
                        <span className="text-white">Revend</span>
                        <span className="text-red-600">AI</span>
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Páginas */}
              <div>
                <h3 className="font-bold text-lg mb-4">Páginas</h3>
                <div className="space-y-3">
                  <button onClick={() => navegarPara('home')} className="block text-gray-400 hover:text-white transition">
                    Início
                  </button>
                  <button onClick={() => navegarPara('estoque')} className="block text-gray-400 hover:text-white transition">
                    Estoque
                  </button>
                  <button className="block text-gray-400 hover:text-white transition">
                    Empresa
                  </button>
                  <button onClick={() => navegarPara('contato')} className="block text-gray-400 hover:text-white transition">
                    Contato
                  </button>
                </div>
              </div>

              {/* Contato */}
              <div>
                <h3 className="font-bold text-lg mb-4">Contato</h3>
                <div className="space-y-3 text-sm">
                  {configuracoes.endereco && (
                    <div className="flex items-start gap-2 text-gray-400">
                      <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>{configuracoes.endereco}</span>
                    </div>
                  )}
                  {configuracoes.whatsapp && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Phone className="w-5 h-5 flex-shrink-0" />
                      <span>{configuracoes.whatsapp}</span>
                    </div>
                  )}
                  {configuracoes.email_contato && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Mail className="w-5 h-5 flex-shrink-0" />
                      <span>{configuracoes.email_contato}</span>
                    </div>
                  )}
                  {(configuracoes.instagram_url || configuracoes.facebook_url || configuracoes.linkedin_url || configuracoes.youtube_url) && (
                    <div className="flex gap-3 mt-4">
                      {configuracoes.instagram_url && (
                        <a
                          href={configuracoes.instagram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full flex items-center justify-center transition"
                        >
                          <Instagram className="w-5 h-5" />
                        </a>
                      )}
                      {configuracoes.facebook_url && (
                        <a
                          href={configuracoes.facebook_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full flex items-center justify-center transition"
                        >
                          <Facebook className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-6 text-center">
              <p className="text-sm text-gray-400">
                ©2025 <span className="font-semibold">RevendAI</span>. Todos os direitos reservados. Desenvolvido por <span className="font-semibold">RevendAI</span>
              </p>
            </div>
          </div>
        </footer>
      )}

      {/* Botão WhatsApp Flutuante */}
      {configuracoes.whatsapp && !veiculoSelecionado && (
        <button
          onClick={() => abrirWhatsApp()}
          className="fixed bottom-8 right-8 w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl flex items-center justify-center z-50 hover:scale-110 transition-transform"
        >
          <MessageCircle className="w-7 h-7" />
        </button>
      )}
    </div>
  );
}
