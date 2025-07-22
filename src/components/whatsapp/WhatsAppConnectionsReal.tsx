
import React, { useState, useEffect } from 'react';
import { Smartphone, Wifi, WifiOff, RefreshCw, QrCode, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEvolutionApi } from '@/hooks/useEvolutionApi';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreateInstanceDialog } from './CreateInstanceDialog';

export function WhatsAppConnectionsReal() {
  const { 
    config, 
    loading, 
    conectando, 
    obterQRCode, 
    verificarStatus, 
    configurarWebhook 
  } = useEvolutionApi();
  
  const { toast } = useToast();
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('desconhecido');
  const [verificandoStatus, setVerificandoStatus] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Verificar status da conexão ao carregar
  useEffect(() => {
    if (config && !loading) {
      handleVerificarStatus();
    }
  }, [config, loading]);

  const handleObterQRCode = async () => {
    try {
      const response = await obterQRCode();
      if (response.qrcode) {
        setQrCode(response.qrcode);
        setStatus('aguardando-conexao');
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível obter o QR Code",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao obter QR Code:', error);
    }
  };

  const handleVerificarStatus = async () => {
    try {
      setVerificandoStatus(true);
      const response = await verificarStatus();
      
      if (response.value) {
        setStatus(response.status || 'conectado');
        if (response.status === 'CONNECTED') {
          setQrCode(null); // Limpar QR Code se conectado
        }
      } else {
        setStatus('desconectado');
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      setStatus('erro');
    } finally {
      setVerificandoStatus(false);
    }
  };

  const handleEditConnection = () => {
    toast({
      title: "Em breve",
      description: "Funcionalidade de edição em desenvolvimento",
    });
  };

  const handleDeleteConnection = () => {
    toast({
      title: "Em breve", 
      description: "Funcionalidade de exclusão em desenvolvimento",
    });
  };

  const handleInstanceCreated = () => {
    // Recarregar configurações e verificar status
    window.location.reload();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONNECTED':
      case 'conectado':
        return 'bg-success/10 text-success border-success/20';
      case 'aguardando-conexao':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'desconectado':
      case 'DISCONNECTED':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONNECTED':
      case 'conectado':
        return 'Conectado';
      case 'aguardando-conexao':
        return 'Aguardando Conexão';
      case 'desconectado':
      case 'DISCONNECTED':
        return 'Desconectado';
      case 'erro':
        return 'Erro';
      default:
        return 'Desconhecido';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONNECTED':
      case 'conectado':
        return <Wifi className="w-4 h-4" />;
      case 'aguardando-conexao':
        return <QrCode className="w-4 h-4" />;
      default:
        return <WifiOff className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>Carregando configurações...</span>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Conexões WhatsApp</h2>
          <p className="text-muted-foreground">Crie e gerencie suas conexões com o WhatsApp via Evolution API</p>
        </div>
        </div>

        <Alert>
          <Smartphone className="h-4 w-4" />
          <AlertDescription>
            Nenhuma configuração Evolution API encontrada. Crie sua primeira instância para começar.
          </AlertDescription>
        </Alert>

        <Card className="border-dashed">
          <CardContent className="text-center py-12">
            <div className="bg-muted rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Primeira Conexão WhatsApp
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Crie sua primeira instância WhatsApp através do AmplieChat para começar a atender seus clientes
            </p>
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="bg-success hover:bg-success/90 text-success-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Instância
            </Button>
          </CardContent>
        </Card>

        <CreateInstanceDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onInstanceCreated={handleInstanceCreated}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Conexões WhatsApp</h2>
          <p className="text-muted-foreground">Gerencie suas conexões com o WhatsApp via Evolution API</p>
        </div>
        <Button 
          onClick={() => setShowCreateDialog(true)}
          variant="outline"
          className="border-success text-success hover:bg-success/10"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Instância
        </Button>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-success/10 rounded-xl border border-success/20">
                <Smartphone className="w-6 h-6 text-success" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">WhatsApp: {config.instanceName}</h3>
                <p className="text-sm text-muted-foreground">Instância configurada</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getStatusColor(status)}>
                {getStatusIcon(status)}
                <span className="ml-2 font-medium">{getStatusText(status)}</span>
              </Badge>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleEditConnection}
                  className="h-9 w-9 hover:bg-muted"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDeleteConnection}
                  className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-2">
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-background border border-border">
                {getStatusIcon(status)}
              </div>
              <div>
                <p className="font-semibold text-foreground">{getStatusText(status)}</p>
                <p className="text-sm text-muted-foreground">
                  {status === 'CONNECTED' || status === 'conectado' 
                    ? 'Pronto para receber mensagens'
                    : 'Aguardando conexão para funcionar'
                  }
                </p>
              </div>
            </div>
            <Button
              onClick={handleVerificarStatus}
              disabled={verificandoStatus}
              variant="ghost"
              size="sm"
              className="hover:bg-background"
            >
              {verificandoStatus ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>

          {(status === 'desconectado' || status === 'DISCONNECTED') && (
            <div className="text-center py-6">
              <Button
                onClick={handleObterQRCode}
                disabled={conectando}
                size="lg"
                className="bg-success hover:bg-success/90 text-success-foreground shadow-sm"
              >
                {conectando ? (
                  <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <QrCode className="w-5 h-5 mr-2" />
                )}
                Conectar WhatsApp
              </Button>
            </div>
          )}

          {qrCode && (
            <div className="border-2 border-dashed border-success/30 rounded-xl p-8 bg-success/5">
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="bg-background p-6 rounded-xl shadow-lg border border-border">
                    <img 
                      src={qrCode} 
                      alt="QR Code para conectar WhatsApp" 
                      className="w-52 h-52 mx-auto"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">Conecte seu WhatsApp</h3>
                  <div className="text-sm text-muted-foreground space-y-2 max-w-sm mx-auto">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-success text-success-foreground rounded-full flex items-center justify-center text-xs font-bold">1</div>
                      <p>Abra o WhatsApp no seu telefone</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-success text-success-foreground rounded-full flex items-center justify-center text-xs font-bold">2</div>
                      <p>Vá em Configurações → Aparelhos conectados</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-success text-success-foreground rounded-full flex items-center justify-center text-xs font-bold">3</div>
                      <p>Escaneie este QR Code</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateInstanceDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onInstanceCreated={handleInstanceCreated}
      />
    </div>
  );
}
