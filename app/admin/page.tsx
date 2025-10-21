'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Eye, LogOut } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
    }
  }, [router]);

  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCliente, setEditingCliente] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: '',
    slug: '',
    email: '',
    telefone: '',
    senha: ''
  });

  useEffect(() => {
    loadClientes();
  }, []);

  async function loadClientes() {
    try {
      console.log('Carregando clientes...');
      const response = await fetch('/api/admin/clientes');
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Erro HTTP: ' + response.status);
      }
      
      const data = await response.json();
      console.log('Dados recebidos:', data);
      
      setClientes(data.clientes || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      alert('Erro ao carregar clientes. Verifique o console.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    
    try {
      const url = editingCliente 
        ? `/api/admin/clientes/${editingCliente.id}`
        : '/api/admin/clientes';
      
      const method = editingCliente ? 'PUT' : 'POST';
      
      console.log('Enviando:', { url, method, formData });
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      console.log('Resposta:', data);

      if (response.ok) {
        alert(editingCliente ? 'Cliente atualizado!' : 'Cliente criado com sucesso!');
        await loadClientes();
        resetForm();
      } else {
        alert(`Erro: ${data.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar cliente. Verifique o console.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string, nome: string) {
    if (!confirm(`Deletar "${nome}"?`)) return;

    try {
      const response = await fetch(`/api/admin/clientes/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Cliente deletado!');
        loadClientes();
      } else {
        const data = await response.json();
        alert(`Erro: ${data.error}`);
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao deletar');
    }
  }

  function resetForm() {
    setFormData({ nome: '', slug: '', email: '', telefone: '', senha: '' });
    setEditingCliente(null);
    setShowForm(false);
  }

  function startEdit(cliente: any) {
    setEditingCliente(cliente);
    setFormData({
      nome: cliente.nome,
      slug: cliente.slug,
      email: cliente.email,
      telefone: cliente.telefone || '',
      senha: ''
    });
    setShowForm(true);
  }

  function handleLogout() {
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Painel Admin</h1>
            <p className="text-gray-600 mt-1">Gerenciar clientes e acessos</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleLogout}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-semibold shadow-lg transition transform hover:scale-105"
            >
              {showForm ? (
                <>Cancelar</>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Novo Cliente
                </>
              )}
            </button>
          </div>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-t-4 border-orange-600">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nome *</label>
                  <input
                    type="text"
                    required
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Nome da empresa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Slug (URL) *</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="minha-empresa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="contato@empresa.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Telefone</label>
                  <input
                    type="text"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Senha {editingCliente && '(deixe em branco para manter)'}
                  </label>
                  <input
                    type="password"
                    required={!editingCliente}
                    value={formData.senha}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg transition disabled:opacity-50"
                >
                  {submitting ? 'Salvando...' : (editingCliente ? 'Atualizar' : 'Criar Cliente')}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-8 py-3 rounded-lg font-semibold transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-6">
            <h2 className="text-2xl font-bold text-white">Clientes Cadastrados</h2>
            <p className="text-orange-100 mt-1">{clientes.length} cliente(s) no sistema</p>
          </div>
          
          {clientes.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 text-lg">Nenhum cliente cadastrado ainda</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 text-orange-600 hover:text-orange-700 font-semibold"
              >
                Criar primeiro cliente
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Nome</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Slug</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Telefone</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {clientes.map((cliente: any) => (
                    <tr key={cliente.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-gray-800">{cliente.nome}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-mono">
                          {cliente.slug}
                        </code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{cliente.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{cliente.telefone || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          cliente.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {cliente.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => window.open(`/client/${cliente.slug}`, '_blank')}
                            className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition"
                            title="Abrir painel"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => startEdit(cliente)}
                            className="text-orange-600 hover:text-orange-800 p-2 hover:bg-orange-50 rounded-lg transition"
                            title="Editar"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(cliente.id, cliente.nome)}
                            className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition"
                            title="Deletar"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
