'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, MapPin, Clock, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';

export default function CatalogoPublico({ params }: { params: { slug: string } }) {
  const [veiculos, setVeiculos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [clienteNome, setClienteNome] = useState('');
  const [configuracoes, setConfiguracoes] = useState<any>({});
  const [veiculoSelecionado, setVeiculoSelecionado] = useState<any>(null);
  const [fotoAtual, setFotoAtual] = useState(0);
  const [filtroMarca, setFiltroMarca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');

  useEffect(() => {
    loadDados();
  }, []);

  async function loadDados() {
    try {
      const responseVeiculos = await fetch(`/api/vehicles/${params.slug}`);
      const dataVeiculos = await responseVeiculos.json();
      
      if (dataVeiculos.cliente) {
        setClienteNome(dataVeiculos.cliente.nome);
      }
      setVeiculos(dataVeiculos.veiculos || []);

      const responseConfig = await fetch(`/api/client/${params.slug}/configuracoes`);
      const dataConfig = await responseConfig.json();
      setConfiguracoes(dataConfig.configuracoes || {});
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }

  const marcasDisponiveis = useMemo(() => {
    const marcas = new Set(veiculos.map(v => v.marca).filter(Boolean));
    return Array.from(marcas).sort();
  }, [veiculos]);

  const categoriasDisponiveis = useMemo(() => {
    const categorias = new Set(veiculos.map(v => v.categoria).filter(Boolean));
    return Array.from(categorias).sort();
  }, [veiculos]);

  const veiculosFiltrados = useMemo(() => {
    return veiculos.filter(v => {
      if (filtroMarca && v.marca !== filtroMarca) return false;
      if (filtroCategoria && v.categoria !== filtroCategoria) return false;
      return true;
    });
  }, [veiculos, filtroMarca, filtroCategoria]);

  function abrirDetalhes(veiculo: any) {
    setVeiculoSelecionado(veiculo);
    setFotoAtual(0);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando catálogo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl md:text-3xl font-bold">{clienteNome}</h1>
          <p className="text-orange-100 text-sm mt-1">Catálogo de Veículos</p>
        </div>
        
        {/* Informações da loja */}
        {(configuracoes.endereco || configuracoes.horario_atendimento) && (
          <div className="border-t border-orange-500 bg-orange-600 bg-opacity-30">
            <div className="max-w-7xl mx-auto px-4 py-3 space-y-2 text-sm">
              {configuracoes.endereco && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span>{configuracoes.endereco}</span>
                </div>
              )}
              {configuracoes.horario_atendimento && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span>{configuracoes.horario_atendimento}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Filtros */}
      {(marcasDisponiveis.length > 1 || categoriasDisponiveis.length > 1) && (
        <div className="bg-white shadow-md sticky top-[120px] md:top-[140px] z-30">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex gap-2 overflow-x-auto">
              {marcasDisponiveis.length > 1 && (
                <select
                  value={filtroMarca}
                  onChange={(e) => setFiltroMarca(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                >
                  <option value="">Todas as marcas</option>
                  {marcasDisponiveis.map(marca => (
                    <option key={marca} value={marca}>{marca}</option>
                  ))}
                </select>
              )}
              
              {categoriasDisponiveis.length > 1 && (
                <select
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                >
                  <option value="">Todas as categorias</option>
                  {categoriasDisponiveis.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              )}
              
              {(filtroMarca || filtroCategoria) && (
                <button
                  onClick={() => { setFiltroMarca(''); setFiltroCategoria(''); }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium whitespace-nowrap"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grid de veículos */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {veiculosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Nenhum veículo disponível no momento</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-4">
              {veiculosFiltrados.length} veículo(s) disponível(is)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {veiculosFiltrados.map((veiculo) => {
                const precoNum = Number(veiculo.preco);
                const precoFmt = isNaN(precoNum) ? null : precoNum.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
                
                return (
                  <div
                    key={veiculo.id}
                    onClick={() => abrirDetalhes(veiculo)}
                    className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transform transition hover:scale-105 hover:shadow-xl active:scale-95"
                  >
                    {veiculo.fotos && veiculo.fotos.length > 0 ? (
                      <img
                        src={veiculo.fotos[0]}
                        alt={`${veiculo.marca} ${veiculo.modelo}`}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">Sem foto</span>
                      </div>
                    )}
                    
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-gray-800">
                        {veiculo.marca} {veiculo.modelo}
                      </h3>
                      {veiculo.versao && (
                        <p className="text-sm text-gray-600 mb-2">{veiculo.versao}</p>
                      )}
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="text-sm text-gray-600">
                          {veiculo.ano} • {veiculo.km ? `${veiculo.km} km` : 'KM não informado'}
                        </div>
                      </div>
                      
                      {veiculo.preco !== undefined && veiculo.preco !== null && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-2xl font-bold text-orange-600">
                            R$ {precoFmt ?? '0,00'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Botão flutuante do WhatsApp */}
      {configuracoes.whatsapp && (
        <button
          onClick={() => abrirWhatsApp()}
          className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl transform transition hover:scale-110 active:scale-95 z-50"
          aria-label="Falar no WhatsApp"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Modal de detalhes do veículo */}
      {veiculoSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 overflow-y-auto">
          <div className="min-h-screen px-4 py-6">
            <div className="bg-white rounded-2xl max-w-4xl mx-auto overflow-hidden shadow-2xl">
              {/* Header do modal */}
              <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-4 flex items-center justify-between sticky top-0 z-10">
                <h2 className="text-xl font-bold text-white">
                  {veiculoSelecionado.marca} {veiculoSelecionado.modelo}
                </h2>
                <button
                  onClick={fecharDetalhes}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Galeria de fotos */}
              {veiculoSelecionado.fotos && veiculoSelecionado.fotos.length > 0 && (
                <div className="relative bg-black">
                  <img
                    src={veiculoSelecionado.fotos[fotoAtual]}
                    alt={`Foto ${fotoAtual + 1}`}
                    className="w-full h-64 md:h-96 object-contain"
                  />
                  
                  {veiculoSelecionado.fotos.length > 1 && (
                    <>
                      <button
                        onClick={fotoAnterior}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={proximaFoto}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                      
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                        {fotoAtual + 1} / {veiculoSelecionado.fotos.length}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Conteúdo */}
              <div className="p-6 space-y-6">
                {/* Preço */}
                {veiculoSelecionado.preco !== undefined && veiculoSelecionado.preco !== null && (
                  <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                    <p className="text-sm text-orange-800 font-semibold mb-1">Preço</p>
                    <p className="text-3xl font-bold text-orange-600">
                      R$ {Number(veiculoSelecionado.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    {veiculoSelecionado.valor_troca && (
                      <p className="text-sm text-orange-700 mt-2">
                        Aceita troca por R$ {Number(veiculoSelecionado.valor_troca).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    )}
                  </div>
                )}

                {/* Informações principais */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Informações</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {veiculoSelecionado.ano && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-600 font-semibold">Ano</p>
                        <p className="text-gray-800">{veiculoSelecionado.ano}</p>
                      </div>
                    )}
                    {veiculoSelecionado.km && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-600 font-semibold">KM</p>
                        <p className="text-gray-800">{veiculoSelecionado.km}</p>
                      </div>
                    )}
                    {veiculoSelecionado.cor && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-600 font-semibold">Cor</p>
                        <p className="text-gray-800">{veiculoSelecionado.cor}</p>
                      </div>
                    )}
                    {veiculoSelecionado.combustivel && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-600 font-semibold">Combustível</p>
                        <p className="text-gray-800 capitalize">{veiculoSelecionado.combustivel}</p>
                      </div>
                    )}
                    {veiculoSelecionado.cambio && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-600 font-semibold">Câmbio</p>
                        <p className="text-gray-800 capitalize">{veiculoSelecionado.cambio}</p>
                      </div>
                    )}
                    {veiculoSelecionado.motor && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-600 font-semibold">Motor</p>
                        <p className="text-gray-800">{veiculoSelecionado.motor}</p>
                      </div>
                    )}
                    {veiculoSelecionado.portas && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-600 font-semibold">Portas</p>
                        <p className="text-gray-800">{veiculoSelecionado.portas}</p>
                      </div>
                    )}
                    {veiculoSelecionado.categoria && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-600 font-semibold">Categoria</p>
                        <p className="text-gray-800">{veiculoSelecionado.categoria}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Opcionais */}
                {veiculoSelecionado.opcionais && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-3">Opcionais</h3>
                    <div className="flex flex-wrap gap-2">
                      {String(veiculoSelecionado.opcionais).split(',').map((opcional, index) => (
                        <span
                          key={index}
                          className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {opcional.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Observações */}
                {veiculoSelecionado.observacao && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-3">Observações</h3>
                    <p className="text-gray-700 whitespace-pre-line">{veiculoSelecionado.observacao}</p>
                  </div>
                )}

                {/* Botão WhatsApp */}
                {configuracoes.whatsapp && (
                  <button
                    onClick={() => abrirWhatsApp(veiculoSelecionado)}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Tenho interesse neste veículo
                  </button>
                )}

                {/* Botão fechar */}
                <button
                  onClick={fecharDetalhes}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-xl transition"
                >
                  Voltar para o catálogo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
