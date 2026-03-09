import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Users, Loader2, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Contact {
  id: string;
  company_id: string;
  phone_number: string;
  name: string;
  department_id: string | null;
  sector_id: string | null;
  tag_id: string | null;
  last_message: string | null;
  last_message_time: string | null;
  created_at: string;
  updated_at: string;
  tag_ids?: string[];
  pinned?: boolean;
  ia_ativada?: boolean;
  photo_url?: string;
}

export default function Contatos() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { company, attendant } = useAuth();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [newName, setNewName] = useState('');

  const companyId = company?.id || attendant?.company_id;

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('contacts')
        .select('id, name, phone_number, last_message_time, photo_url')
        .order('last_message_time', { ascending: false });

      if (error) {
        console.error('Erro ao buscar contatos:', error);
        setError('Erro ao carregar contatos');
        return;
      }

      setContacts(data || []);
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Erro inesperado ao carregar contatos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!companyId) {
      setError('Empresa não encontrada');
      setLoading(false);
      return;
    }

    fetchContacts();
  }, [companyId, fetchContacts]);

  const handleEdit = (contact: Contact) => {
    setSelectedContact(contact);
    setNewName(contact.name);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (contactId: string) => {
    // Logic will be added in a future step
  };

  const handleUpdateName = async () => {
    if (!selectedContact || !newName.trim()) {
      // TODO: Show an error to the user that the name cannot be empty.
      return;
    }

    try {
      const { data, error } = await supabase
        .from('contacts')
        .update({ name: newName.trim() })
        .eq('id', selectedContact.id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar o nome do contato:', error);
        // TODO: Show a more user-friendly error message.
        return;
      }

      if (data) {
        setContacts(
          contacts.map((contact) =>
            contact.id === selectedContact.id ? { ...contact, name: data.name } : contact
          )
        );
      }
      
      handleCloseModal();
    } catch (err) {
      console.error('Erro inesperado ao atualizar o nome:', err);
      // TODO: Show a more user-friendly error message.
    }
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedContact(null);
    setNewName('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 animate-in fade-in duration-300">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <Users className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Erro</h2>
          <p className="text-gray-600 dark:text-slate-300">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl hover:scale-105 transition-all shadow-md"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 animate-in fade-in duration-300">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Contatos</h1>
      {contacts.length === 0 ? (
        <div className="text-center text-slate-500">Nenhum contato encontrado.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {contacts.map((contact) => (
            <div key={contact.id} className="p-4 bg-white rounded-lg shadow-md flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {contact.photo_url ? (
                  <img src={contact.photo_url} alt={contact.name} className="w-full h-full object-cover" />
                ) : (
                  <Users className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-slate-900">{contact.name}</h2>
                <p className="text-sm text-slate-500">{contact.phone_number.split('@')[0]}</p>
                <p className="text-sm text-slate-700 mt-2">{contact.last_message || 'Sem mensagens recentes.'}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(contact)}
                  className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(contact.id)}
                  className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isEditModalOpen && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Editar Contato</h2>
            <div className="mb-4">
              <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700">
                Nome
              </label>
              <input
                type="text"
                id="contact-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateName}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}