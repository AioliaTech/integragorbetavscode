'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface FIPEAutocompleteProps {
  tipo: string;
  initialMarca?: string;
  initialModelo?: string;
  initialVersao?: string;
  onDadosChange: (dados: {
    marca: string;
    brandCode: number | null;
    modelo: string;
    versao: string;
    categoria?: string;
    combustivel?: string;
  }) => void;
}

export default function FIPEAutocomplete({
  tipo,
  initialMarca = '',
  initialModelo = '',
  initialVersao = '',
  onDadosChange
}: FIPEAutocompleteProps) {
  const [marcaSelecionada, setMarcaSelecionada] = useState<any>(null);
  const [modeloSelecionado, setModeloSelecionado] = useState('');
  
  const [marcaInput, setMarcaInput] = useState(initialMarca);
  const [modeloInput, setModeloInput] = useState(initialModelo);
  const [versaoInput, setVersaoInput] = useState(initialVersao);
  
  const [initialized, setInitialized] = useState(false);
  
  const [todasMarcas, setTodasMarcas] = useState<any[]>([]);
  const [todosModelos, setTodosModelos] = useState<string[]>([]);
  const [todasVersoes, setTodasVersoes] = useState<any[]>([]);
  
  const [showMarcas, setShowMarcas] = useState(false);
  const [showModelos, setShowModelos] = useState(false);
  const [showVersoes, setShowVersoes] = useState(false);
  
  const marcaRef = useRef<HTMLDivElement>(null);
  const modeloRef = useRef<HTMLDivElement>(null);
  const versaoRef = useRef<HTMLDivElement>(null);

  // Inicializar valores quando receber props (apenas uma vez)
  useEffect(() => {
    if (!initialized && (initialMarca || initialModelo || initialVersao)) {
      setMarcaInput(initialMarca);
      setModeloInput(initialModelo);
      setVersaoInput(initialVersao);
      setInitialized(true);
    }
  }, [initialMarca, initialModelo, initialVersao, initialized]);

  // Quando TIPO mudar, SEMPRE recarregar as marcas e limpar a cascata
  useEffect(() => {
    if (tipo && tipo.trim()) {
      // Limpar seleções da cascata, mas manter inputs customizados
      setMarcaSelecionada(null);
      setModeloSelecionado('');
      setTodasMarcas([]);
      setTodosModelos([]);
      setTodasVersoes([]);
      
      // Recarregar marcas para o novo tipo
      carregarMarcas();
    }
  }, [tipo]);

  // Quando marca mudar, carregar novos modelos
  useEffect(() => {
    if (marcaSelecionada) {
      carregarModelos();
      // Limpar arrays antigos
      setTodasVersoes([]);
    } else {
      setTodosModelos([]);
      setTodasVersoes([]);
    }
  }, [marcaSelecionada]);

  // Quando modelo mudar, carregar novas versões
  useEffect(() => {
    if (marcaSelecionada && modeloSelecionado) {
      carregarVersoes();
    } else {
      setTodasVersoes([]);
    }
  }, [marcaSelecionada, modeloSelecionado]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (marcaRef.current && !marcaRef.current.contains(e.target as Node)) {
        setShowMarcas(false);
      }
      if (modeloRef.current && !modeloRef.current.contains(e.target as Node)) {
        setShowModelos(false);
      }
      if (versaoRef.current && !versaoRef.current.contains(e.target as Node)) {
        setShowVersoes(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function limparTudo() {
    setMarcaSelecionada(null);
    setModeloSelecionado('');
    setMarcaInput('');
    setModeloInput('');
    setVersaoInput('');
    setTodasMarcas([]);
    setTodosModelos([]);
    setTodasVersoes([]);
  }

  function mapTipo(t: string): string {
    const map: any = {
      'carro': 'CAR',
      'moto': 'MOTORCYCLE',
      'caminhão': 'TRUCK',
      'caminhao': 'TRUCK',
      'scooter elétrica': 'SCOOTER',
      'scooter eletrica': 'SCOOTER'
    };
    return map[t?.toLowerCase()] || 'CAR';
  }

  async function carregarMarcas() {
    try {
      const tipoAPI = mapTipo(tipo);
      const url = `/api/fipe-simple/marcas?tipo=${tipoAPI}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      setTodasMarcas(data.marcas || []);
    } catch (error) {
      console.error('Erro ao carregar marcas:', error);
      setTodasMarcas([]);
    }
  }

  async function carregarModelos() {
    if (!marcaSelecionada) return;
    
    try {
      const tipoAPI = mapTipo(tipo);
      const url = `/api/fipe-simple/modelos?tipo=${tipoAPI}&brand_code=${marcaSelecionada.brand_code}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      setTodosModelos(data.modelos || []);
    } catch (error) {
      console.error('Erro ao carregar modelos:', error);
      setTodosModelos([]);
    }
  }

  async function carregarVersoes() {
    if (!marcaSelecionada || !modeloSelecionado) return;
    
    try {
      const tipoAPI = mapTipo(tipo);
      const url = `/api/fipe-simple/versoes?tipo=${tipoAPI}&brand_code=${marcaSelecionada.brand_code}&modelo=${encodeURIComponent(modeloSelecionado)}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      setTodasVersoes(data.versoes || []);
    } catch (error) {
      console.error('Erro ao carregar versões:', error);
      setTodasVersoes([]);
    }
  }

  const marcasFiltradas = marcaInput.trim() 
    ? todasMarcas.filter(m => m.brand_value.toLowerCase().includes(marcaInput.toLowerCase()))
    : todasMarcas;

  const modelosFiltrados = modeloInput.trim()
    ? todosModelos.filter(m => m.toLowerCase().includes(modeloInput.toLowerCase()))
    : todosModelos;

  const versoesFiltradas = versaoInput.trim()
    ? todasVersoes.filter(v => v.versao.toLowerCase().includes(versaoInput.toLowerCase()))
    : todasVersoes;

  function selecionarMarca(m: any) {
    setMarcaSelecionada(m);
    setMarcaInput(m.brand_value);
    setShowMarcas(false);
    setModeloInput('');
    setModeloSelecionado('');
    setVersaoInput('');
    setTodosModelos([]); // Limpar array de modelos
    setTodasVersoes([]); // Limpar array de versões
    onDadosChange({ marca: m.brand_value, brandCode: m.brand_code, modelo: '', versao: '' });
  }

  function selecionarModelo(m: string) {
    setModeloSelecionado(m);
    setModeloInput(m);
    setShowModelos(false);
    setVersaoInput('');
    setTodasVersoes([]); // Limpar versões antigas
    onDadosChange({ 
      marca: marcaInput, 
      brandCode: marcaSelecionada?.brand_code || null, 
      modelo: m, 
      versao: '' 
    });
  }

  function selecionarVersao(v: any) {
    setVersaoInput(v.versao);
    setShowVersoes(false);
    onDadosChange({ 
      marca: marcaInput, 
      brandCode: marcaSelecionada?.brand_code || null, 
      modelo: modeloInput, 
      versao: v.versao,
      categoria: v.categoria,
      combustivel: v.combustivel
    });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* MARCA */}
      <div ref={marcaRef} className="relative">
        <label className="block text-sm font-semibold mb-2">
          Marca {!tipo?.trim() && <span className="text-orange-500 text-xs">(preencha o tipo primeiro)</span>}
        </label>
        <input
          type="text"
          value={marcaInput}
          onChange={(e) => {
            const value = e.target.value;
            setMarcaInput(value);
            if (tipo && tipo.trim()) {
              setShowMarcas(true);
            }
            
            // Atualizar sempre, permitindo valores customizados
            onDadosChange({
              marca: value,
              brandCode: marcaSelecionada?.brand_code || null,
              modelo: modeloInput,
              versao: versaoInput
            });
            
            // Se apagou tudo, limpar seleção da cascata
            if (value === '') {
              setMarcaSelecionada(null);
              setModeloSelecionado('');
              setTodosModelos([]);
              setTodasVersoes([]);
            }
          }}
          onFocus={() => {
            if (tipo && tipo.trim()) {
              setShowMarcas(true);
            }
          }}
          onBlur={() => {
            // Notificar valor final mesmo que não seja da lista
            onDadosChange({
              marca: marcaInput,
              brandCode: marcaSelecionada?.brand_code || null,
              modelo: modeloInput,
              versao: versaoInput
            });
          }}
          className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
          placeholder="Digite qualquer marca..."
        />
        <ChevronDown className="absolute right-3 top-[38px] w-5 h-5 text-gray-400 pointer-events-none" />
        
        {showMarcas && marcasFiltradas.length > 0 && tipo && tipo.trim() && (
          <div className="absolute z-30 w-full bg-white border-2 border-gray-200 rounded-lg mt-1 shadow-xl">
            <div className="bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600 border-b">
              {marcasFiltradas.length} de {todasMarcas.length} marcas
            </div>
            <div className="max-h-[20rem] overflow-y-auto">
              {marcasFiltradas.map((m) => (
                <div
                  key={m.brand_code}
                  onClick={() => selecionarMarca(m)}
                  className="px-4 py-2.5 cursor-pointer hover:bg-orange-50 border-b last:border-0"
                >
                  {m.brand_value}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODELO */}
      <div ref={modeloRef} className="relative">
        <label className="block text-sm font-semibold mb-2">
          Modelo {!marcaSelecionada && <span className="text-orange-500 text-xs">(selecione uma marca primeiro)</span>}
        </label>
        <input
          type="text"
          value={modeloInput}
          onChange={(e) => {
            const value = e.target.value;
            setModeloInput(value);
            if (marcaSelecionada) {
              setShowModelos(true);
            }
            
            // Atualizar sempre, permitindo valores customizados
            onDadosChange({
              marca: marcaInput,
              brandCode: marcaSelecionada?.brand_code || null,
              modelo: value,
              versao: versaoInput
            });
            
            // Se apagou tudo, limpar versões
            if (value === '') {
              setModeloSelecionado('');
              setTodasVersoes([]);
            }
          }}
          onFocus={() => {
            if (marcaSelecionada) {
              setShowModelos(true);
              if (todosModelos.length === 0) {
                carregarModelos();
              }
            }
          }}
          onBlur={() => {
            // Notificar valor final mesmo que não seja da lista
            onDadosChange({
              marca: marcaInput,
              brandCode: marcaSelecionada?.brand_code || null,
              modelo: modeloInput,
              versao: versaoInput
            });
          }}
          className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
          placeholder="Digite qualquer modelo..."
        />
        <ChevronDown className="absolute right-3 top-[38px] w-5 h-5 text-gray-400 pointer-events-none" />
        
        {showModelos && modelosFiltrados.length > 0 && marcaSelecionada && (
          <div className="absolute z-30 w-full bg-white border-2 border-gray-200 rounded-lg mt-1 shadow-xl">
            <div className="bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600 border-b">
              {modelosFiltrados.length} de {todosModelos.length} modelos
            </div>
            <div className="max-h-[20rem] overflow-y-auto">
              {modelosFiltrados.map((m) => (
                <div
                  key={m}
                  onClick={() => selecionarModelo(m)}
                  className="px-4 py-2.5 cursor-pointer hover:bg-orange-50 border-b last:border-0"
                >
                  {m}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* VERSÃO */}
      <div ref={versaoRef} className="relative">
        <label className="block text-sm font-semibold mb-2">
          Versão {!modeloSelecionado && <span className="text-orange-500 text-xs">(selecione um modelo primeiro)</span>}
        </label>
        <input
          type="text"
          value={versaoInput}
          onChange={(e) => {
            const value = e.target.value;
            setVersaoInput(value);
            if (marcaSelecionada && modeloSelecionado) {
              setShowVersoes(true);
            }
            
            // Atualizar sempre, permitindo valores customizados
            onDadosChange({
              marca: marcaInput,
              brandCode: marcaSelecionada?.brand_code || null,
              modelo: modeloInput,
              versao: value
            });
          }}
          onFocus={() => {
            if (marcaSelecionada && modeloSelecionado) {
              setShowVersoes(true);
              if (todasVersoes.length === 0) {
                carregarVersoes();
              }
            }
          }}
          onBlur={() => {
            // Notificar valor final mesmo que não seja da lista
            onDadosChange({
              marca: marcaInput,
              brandCode: marcaSelecionada?.brand_code || null,
              modelo: modeloInput,
              versao: versaoInput
            });
          }}
          className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
          placeholder="Digite qualquer versão..."
        />
        <ChevronDown className="absolute right-3 top-[38px] w-5 h-5 text-gray-400 pointer-events-none" />
        
        {showVersoes && versoesFiltradas.length > 0 && marcaSelecionada && modeloSelecionado && (
          <div className="absolute z-30 w-full bg-white border-2 border-gray-200 rounded-lg mt-1 shadow-xl">
            <div className="bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600 border-b">
              {versoesFiltradas.length} de {todasVersoes.length} versões
            </div>
            <div className="max-h-[20rem] overflow-y-auto">
              {versoesFiltradas.map((v, idx) => (
                <div
                  key={`${v.versao}-${idx}`}
                  onClick={() => selecionarVersao(v)}
                  className="px-4 py-2.5 cursor-pointer hover:bg-orange-50 border-b last:border-0"
                >
                  <div className="font-medium">{v.versao}</div>
                  {v.categoria && <div className="text-xs text-orange-600 mt-0.5">🏷️ {v.categoria}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
