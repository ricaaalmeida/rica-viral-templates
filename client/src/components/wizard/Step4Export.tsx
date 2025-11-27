import { useProject } from '@/contexts/ProjectContext';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Download, Loader2, Link2, Copy } from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { useCanvasExport } from '@/hooks/useCanvasExport';
import { toast } from 'sonner';

export default function Step4Export() {
  const { state, copyShareLink } = useProject();
  const { exportPNG } = useCanvasExport();
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [resolution, setResolution] = useState(1080);
  const [fps, setFps] = useState<24 | 30>(30);

  const handleCopyShareLink = async () => {
    await copyShareLink();
    toast.success('Link de configuracao copiado!');
  };

  const validations = [
    {
      id: 'images',
      label: 'Pelo menos 1 imagem no mosaico (ou vídeo se 0 imagens)',
      valid: state.imageCount === 0 ? state.video.blob !== null : state.images.some((img) => img.blob !== null),
    },
    {
      id: 'profile',
      label: 'Nome do perfil preenchido',
      valid: state.profile.name.trim() !== '',
    },
    {
      id: 'video-mp4',
      label: 'Vídeo presente (para exportação MP4)',
      valid: state.exportMode === 'png' || (state.video.blob !== null && !state.chromaKey),
    },
    {
      id: 'chroma-png',
      label: 'Chroma key configurado corretamente (PNG apenas)',
      valid: !state.chromaKey || (state.chromaKey && state.exportMode === 'png'),
    },
  ];

  const allValid = validations.every((v) => v.valid);
  const canExportMP4 = state.video.blob !== null && !state.chromaKey;

  const handleExport = async () => {
    if (!allValid) return;

    setIsExporting(true);
    setExportProgress(0);

    try {
      if (state.exportMode === 'png') {
        setExportProgress(50);
        await exportPNG(state, resolution);
        setExportProgress(100);
        toast.success('PNG exportado com sucesso!');
      } else {
        // MP4 export (to be implemented with ffmpeg.wasm)
        toast.info('Exportação de vídeo em desenvolvimento');
      }
    } catch (error) {
      console.error('Erro na exportação:', error);
      toast.error('Erro ao exportar. Tente novamente.');
    } finally {
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
      }, 500);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold mb-2">Exportar</h2>
        <p className="text-muted-foreground">
          Revise as configurações e exporte sua arte viral
        </p>
      </div>

      {/* Privacy Notice */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>100% Local e Privado:</strong> Tudo é processado localmente no seu dispositivo
          via Blob/Canvas. Nenhum dado é enviado para servidores externos.
        </AlertDescription>
      </Alert>

      {/* Share Link */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <Link2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <div>
              <Label className="text-base font-semibold">Link Compartilhável</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Copie o link para salvar todas as suas configurações. Você pode compartilhar
                ou guardar para continuar depois!
              </p>
            </div>
            <Button
              onClick={handleCopyShareLink}
              variant="outline"
              className="w-full"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copiar Link de Configuração
            </Button>
            <p className="text-xs text-muted-foreground">
              ⚡ O link é atualizado automaticamente conforme você faz alterações
            </p>
          </div>
        </div>
      </Card>

      {/* Validation Checklist */}
      <Card className="p-4">
        <Label className="text-base font-semibold mb-3 block">Checklist de Validação</Label>
        <div className="space-y-2">
          {validations.map((validation) => (
            <div key={validation.id} className="flex items-center gap-3">
              {validation.valid ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
              )}
              <span
                className={`text-sm ${
                  validation.valid ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {validation.label}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Export Mode */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Modo de Exportação</Label>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant={state.exportMode === 'png' ? 'default' : 'outline'}
            onClick={() => {}}
            disabled={state.chromaKey}
            className="h-auto py-4 flex flex-col items-start"
          >
            <span className="font-semibold">PNG (Imagem)</span>
            <span className="text-xs opacity-80 mt-1">
              {state.chromaKey ? 'Obrigatório (chroma ativo)' : 'Imagem estática'}
            </span>
          </Button>
          <Button
            variant={state.exportMode === 'mp4' ? 'default' : 'outline'}
            onClick={() => {}}
            disabled={!canExportMP4}
            className="h-auto py-4 flex flex-col items-start"
          >
            <span className="font-semibold">MP4 (Vídeo)</span>
            <span className="text-xs opacity-80 mt-1">
              {!canExportMP4 ? 'Requer vídeo sem chroma' : 'Vídeo animado'}
            </span>
          </Button>
        </div>
      </div>

      {/* Export Settings */}
      <Card className="p-4 space-y-4">
        <Label className="text-base font-semibold">Configurações de Exportação</Label>

        <div className="space-y-2">
          <Label>Resolução (lado curto em pixels)</Label>
          <Input
            type="number"
            value={resolution}
            onChange={(e) => setResolution(Number(e.target.value))}
            min={480}
            max={4096}
            step={1}
          />
          <p className="text-xs text-muted-foreground">
            Padrão: 1080px. Máximo: 4096px
          </p>
        </div>

        {state.exportMode === 'mp4' && canExportMP4 && (
          <div className="space-y-2">
            <Label>FPS (Frames por Segundo)</Label>
            <div className="flex gap-3">
              <Button
                variant={fps === 24 ? 'default' : 'outline'}
                onClick={() => setFps(24)}
                className="flex-1"
              >
                24 FPS
              </Button>
              <Button
                variant={fps === 30 ? 'default' : 'outline'}
                onClick={() => setFps(30)}
                className="flex-1"
              >
                30 FPS
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Export Button */}
      <div className="space-y-3">
        <Button
          onClick={handleExport}
          disabled={!allValid || isExporting}
          className="w-full h-12 text-lg"
          size="lg"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Exportando... {exportProgress}%
            </>
          ) : (
            <>
              <Download className="w-5 h-5 mr-2" />
              Exportar {state.exportMode === 'png' ? 'PNG' : 'MP4'}
            </>
          )}
        </Button>

        {isExporting && (
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${exportProgress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
