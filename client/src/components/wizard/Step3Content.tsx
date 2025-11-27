import { useProject, LayoutPreset } from '@/contexts/ProjectContext';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload, Video, Image as ImageIcon } from 'lucide-react';
import { useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

const layoutPresets: { value: LayoutPreset; label: string }[] = [
  { value: '58/42', label: '58/42 (Padrão)' },
  { value: '60/40', label: '60/40' },
  { value: '55/45', label: '55/45' },
  { value: '50/50', label: '50/50' },
  { value: '100/0', label: '100% Largura' },
];

export default function Step3Content() {
  const { state, updateState } = useProject();
  const imageInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (frameId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem válida');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      const updatedImages = state.images.map((img) =>
        img.id === frameId ? { ...img, blob: imageUrl } : img
      );
      updateState({ images: updatedImages });
    };
    reader.readAsDataURL(file);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert('Por favor, selecione um vídeo válido');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const videoUrl = event.target?.result as string;
      updateState({
        video: { ...state.video, blob: videoUrl },
      });
    };
    reader.readAsDataURL(file);
  };

  const handleImageCountChange = (count: 0 | 1 | 2 | 3) => {
    const newImages = [...state.images];
    
    // Adjust array size based on count
    while (newImages.length < count) {
      newImages.push({
        id: String(newImages.length + 1),
        blob: null,
        position: { x: 0, y: 0 },
        scale: 1,
        rotation: 0,
      });
    }
    while (newImages.length > count) {
      newImages.pop();
    }
    
    updateState({ imageCount: count, images: newImages });
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold mb-2">Conteúdo</h2>
        <p className="text-muted-foreground">
          Faça upload das imagens e vídeo para compor seu post viral
        </p>
      </div>

      {/* Layout Presets */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Presets de Layout</Label>
        <p className="text-sm text-muted-foreground">
          Escolha a divisão entre mosaico de imagens e vídeo. Use 100% para mosaico sem vídeo.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {layoutPresets.map((preset) => (
            <Button
              key={preset.value}
              variant={state.layoutPreset === preset.value ? 'default' : 'outline'}
              onClick={() => updateState({ layoutPreset: preset.value })}
              className={preset.value === '100/0' ? 'col-span-2' : ''}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Full Bleed Toggle */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-base font-semibold">Mosaico Sem Bordas (Full Bleed)</Label>
            <p className="text-sm text-muted-foreground">
              Estica o mosaico até as extremidades laterais do canvas, sem padding
            </p>
          </div>
          <Switch
            checked={state.fullBleed}
            onCheckedChange={(checked) => updateState({ fullBleed: checked })}
          />
        </div>
      </Card>

      {/* Image Count */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Quantidade de Imagens Estáticas</Label>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant={state.imageCount === 0 ? 'default' : 'outline'}
            onClick={() => handleImageCountChange(0)}
            className="col-span-2"
          >
            Sem Imagens (Apenas Vídeo)
          </Button>
          <Button
            variant={state.imageCount === 1 ? 'default' : 'outline'}
            onClick={() => handleImageCountChange(1)}
          >
            1 Imagem
          </Button>
          <Button
            variant={state.imageCount === 2 ? 'default' : 'outline'}
            onClick={() => handleImageCountChange(2)}
          >
            2 Imagens
          </Button>
          <Button
            variant={state.imageCount === 3 ? 'default' : 'outline'}
            onClick={() => handleImageCountChange(3)}
          >
            3 Imagens
          </Button>
        </div>
      </div>

      {/* Image Uploads */}
      {state.imageCount > 0 && (
        <div className="space-y-4">
          <Label className="text-base font-semibold">Imagens do Mosaico</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {state.images.map((image, index) => (
            <Card key={image.id} className="p-4">
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Imagem {index + 1}</Label>
                <div
                  className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden cursor-pointer border-2 border-dashed border-border hover:border-primary transition-colors"
                  onClick={() => imageInputRefs.current[image.id]?.click()}
                >
                  {image.blob ? (
                    <img
                      src={image.blob}
                      alt={`Frame ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Clique para upload</p>
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => imageInputRefs.current[image.id]?.click()}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {image.blob ? 'Trocar' : 'Upload'}
                </Button>
                <input
                  ref={(el) => { imageInputRefs.current[image.id] = el; }}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(image.id, e)}
                  className="hidden"
                />
              </div>
            </Card>
          ))}
        </div>
        </div>
      )}

      {/* Video Upload */}
      {state.layoutPreset !== '100/0' && (
        <div className="space-y-3">
        <Label className="text-base font-semibold">Vídeo</Label>
        <Card className="p-4">
          <div className="space-y-3">
            <div
              className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden cursor-pointer border-2 border-dashed border-border hover:border-primary transition-colors"
              onClick={() => videoInputRef.current?.click()}
            >
              {state.video.blob ? (
                <video
                  src={state.video.blob}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  autoPlay
                />
              ) : (
                <div className="text-center">
                  <Video className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Clique para upload do vídeo</p>
                </div>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => videoInputRef.current?.click()}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              {state.video.blob ? 'Trocar Vídeo' : 'Upload Vídeo'}
            </Button>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className="hidden"
            />
          </div>
        </Card>
        </div>
      )}

      {/* Video Controls */}
      {state.video.blob && (
        <Card className="p-4 space-y-4">
          <Label className="text-base font-semibold">Controles do Vídeo</Label>
          
          <div className="flex items-center justify-between">
            <Label>Mutar Preview</Label>
            <Switch
              checked={state.video.muted}
              onCheckedChange={(muted) =>
                updateState({ video: { ...state.video, muted } })
              }
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Legendas Overlay</Label>
              <Switch
                checked={state.video.overlay.enabled}
                onCheckedChange={(enabled) =>
                  updateState({
                    video: {
                      ...state.video,
                      overlay: { ...state.video.overlay, enabled },
                    },
                  })
                }
              />
            </div>
            {state.video.overlay.enabled && (
              <Input
                value={state.video.overlay.text}
                onChange={(e) =>
                  updateState({
                    video: {
                      ...state.video,
                      overlay: { ...state.video.overlay, text: e.target.value },
                    },
                  })
                }
                placeholder="Texto da legenda..."
                className="mt-2"
              />
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

