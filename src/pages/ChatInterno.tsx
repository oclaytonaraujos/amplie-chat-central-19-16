
import React, { useState } from 'react';
import { ChatSidebar } from '@/components/chat-interno/ChatSidebar';
import { ChatArea } from '@/components/chat-interno/ChatArea';
import { ContactsList } from '@/components/chat-interno/ContactsList';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTransferNotifications } from '@/hooks/useTransferNotifications';
import { useToast } from '@/hooks/use-toast';
import { Usuario, Conversa, Mensagem } from '@/types/chat-interno';
import { ChatInternoTransferService } from '@/services/chatInternoTransfer';

// Dados vazios - serão carregados do banco de dados
const usuariosMock: Usuario[] = [];
const conversasMock: Conversa[] = [];
const mensagensMock: Mensagem[] = [];

export default function ChatInterno() {
  const [conversaSelecionada, setConversaSelecionada] = useState<Conversa | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>(mensagensMock);
  const [conversas, setConversas] = useState<Conversa[]>(conversasMock);
  const [showContacts, setShowContacts] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const { addTransferNotification } = useTransferNotifications();
  const { toast } = useToast();

  const handleSelectConversa = (conversa: Conversa) => {
    setConversaSelecionada(conversa);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleCloseConversa = () => {
    setConversaSelecionada(null);
    if (isMobile) {
      setSidebarOpen(true);
    }
  };

  const handleDeleteConversa = (conversaId: number) => {
    setConversas(prev => prev.filter(c => c.id !== conversaId));
    
    // Se a conversa deletada estava selecionada, limpar seleção
    if (conversaSelecionada?.id === conversaId) {
      setConversaSelecionada(null);
    }

    toast({
      title: "Conversa apagada",
      description: "A conversa foi removida com sucesso.",
    });
  };

  const handleStartCall = (conversaId: number) => {
    const conversa = conversas.find(c => c.id === conversaId);
    if (conversa) {
      toast({
        title: "Chamada iniciada",
        description: `Conectando com ${conversa.nome}...`,
      });
      // Aqui você implementaria a lógica real de chamada
    }
  };

  const handleSendMessage = (texto: string) => {
    if (!texto.trim() || !conversaSelecionada) return;

    const novaMensagem: Mensagem = {
      id: mensagens.length + 1,
      texto,
      autor: { id: 999, nome: 'Você', email: 'voce@empresa.com', status: 'online', cargo: 'Agente' },
      tempo: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      tipo: 'texto'
    };

    setMensagens([...mensagens, novaMensagem]);
  };

  // Simular recebimento de transferência de atendimento
  const handleTransferReceived = (transferData: {
    deUsuario: string;
    paraUsuario: string;
    cliente: string;
    motivo: string;
  }) => {
    // Adicionar notificação
    addTransferNotification({
      tipo: 'transferencia_recebida',
      deUsuario: transferData.deUsuario,
      paraUsuario: transferData.paraUsuario,
      cliente: transferData.cliente,
      motivo: transferData.motivo,
    });

    // Criar mensagem no chat interno
    const autorSistema: Usuario = {
      id: 0,
      nome: 'Sistema',
      email: 'sistema@empresa.com',
      status: 'online',
      cargo: 'Sistema'
    };

    const mensagemTransferencia = ChatInternoTransferService.createTransferMessage(
      {
        tipo: 'transferencia',
        deUsuario: transferData.deUsuario,
        paraUsuario: transferData.paraUsuario,
        cliente: transferData.cliente,
        motivo: transferData.motivo,
        timestamp: new Date(),
      },
      autorSistema
    );

    // Encontrar ou criar conversa com o usuário que enviou a transferência
    const usuarioOrigem = usuariosMock.find(u => u.nome === transferData.deUsuario);
    if (usuarioOrigem) {
      let conversaTransferencia = conversas.find(c => 
        c.tipo === 'individual' && 
        c.participantes.some(p => p.id === usuarioOrigem.id)
      );

      if (!conversaTransferencia) {
        conversaTransferencia = {
          id: Date.now(),
          tipo: 'individual',
          nome: usuarioOrigem.nome,
          participantes: [usuarioOrigem],
          mensagensNaoLidas: 1
        };
        setConversas(prev => [...prev, conversaTransferencia!]);
      }

      // Adicionar mensagem à conversa
      setMensagens(prev => [...prev, mensagemTransferencia]);
    }
  };

  const handleNovaConversa = () => {
    setShowContacts(true);
  };

  const handleSelectContact = (usuario: Usuario) => {
    // Verificar se já existe uma conversa com este usuário
    const conversaExistente = conversas.find(
      c => c.tipo === 'individual' && c.participantes.some(p => p.id === usuario.id)
    );

    if (conversaExistente) {
      setConversaSelecionada(conversaExistente);
    } else {
      // Criar nova conversa
      const novaConversa: Conversa = {
        id: conversas.length + 1,
        tipo: 'individual',
        nome: usuario.nome,
        participantes: [usuario],
        mensagensNaoLidas: 0
      };
      setConversas(prev => [...prev, novaConversa]);
      setConversaSelecionada(novaConversa);
    }
    
    setShowContacts(false);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Carregar dados reais do banco de dados
  React.useEffect(() => {
    // TODO: Implementar carregamento de conversas, usuários e mensagens do Supabase
  }, []);

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      {/* Mobile sidebar overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${isMobile 
          ? `fixed inset-y-0 left-0 z-50 ${!sidebarOpen ? '-translate-x-full' : 'translate-x-0'} transition-transform duration-300 ease-in-out w-full max-w-sm`
          : 'relative w-80'
        }
      `}>
        {showContacts ? (
          <ContactsList
            usuarios={usuariosMock}
            onSelectContact={handleSelectContact}
            onBack={() => setShowContacts(false)}
          />
        ) : (
          <ChatSidebar
            conversas={conversas}
            conversaSelecionada={conversaSelecionada}
            onSelectConversa={handleSelectConversa}
            onNovaConversa={handleNovaConversa}
            isMobile={isMobile}
          />
        )}
      </div>

      {/* Área principal do chat */}
      <div className={`flex-1 flex flex-col min-w-0 ${isMobile && sidebarOpen ? 'hidden' : ''}`}>
        <ChatArea
          conversa={conversaSelecionada}
          mensagens={mensagens}
          onSendMessage={handleSendMessage}
          onOpenSidebar={() => setSidebarOpen(true)}
          onCloseConversa={handleCloseConversa}
          onDeleteConversa={handleDeleteConversa}
          onStartCall={handleStartCall}
          showMenuButton={isMobile}
        />
      </div>
    </div>
  );
}
