import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Users, ArrowLeft, Loader2 } from 'lucide-react';
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
}

export default function Contatos() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { company, attendant } = useAuth();
  const navigate = useNavigate();

  const companyId = company?.id || attendant?.company_id;

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('contacts')
        .select('id, name, phone_number, last_message_time')
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
                <p className="text-sm text-slate-500">{contact.phone_number}</p>
                <p className="text-sm text-slate-700 mt-2">{contact.last_message || 'Sem mensagens recentes.'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}