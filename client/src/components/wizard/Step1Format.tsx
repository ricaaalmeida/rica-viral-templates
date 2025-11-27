import { useProject, AspectRatio } from '@/contexts/ProjectContext';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { HexColorPicker } from 'react-colorful';
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

const aspectRatios: { value: AspectRatio; label: string }[] = [
  { value: '4:5', label: '4:5 (Padrão)' },
  { value: '1:1', label: '1:1 (Quadrado)' },
  { value: '9:16', label: '9:16 (Stories)' },
  { value: '16:9', label: '16:9 (Landscape)' },
  { value: '3:4', label: '3:4' },
  { value: '2:3', label: '2:3' },
  { value: '21:9', label: '21:9 (Ultra Wide)' },
];

export default function Step1Format() {
  const { state, updateState } = useProject();
  const [showGradientPicker, setShowGradientPicker] = useState(false);

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold mb-2">Formato & Fundo</h2>
        <p className="text-muted-foreground">
          Configure o formato de saída e o fundo da sua arte viral
        </p>
      </div>

      {/* Aspect Ratio */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Proporção da Imagem</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {aspectRatios.map((ratio) => (
            <Button
              key={ratio.value}
              variant={state.aspectRatio === ratio.value ? 'default' : 'outline'}
              onClick={() => updateState({ aspectRatio: ratio.value })}
              className="h-auto py-3"
            >
              {ratio.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Background */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Fundo da Arte</Label>
        <div className="flex gap-3">
          <Button
            variant={state.background.type === 'solid' ? 'default' : 'outline'}
            onClick={() => updateState({ background: { ...state.background, type: 'solid' } })}
          >
            Cor Sólida
          </Button>
          <Button
            variant={state.background.type === 'gradient' ? 'default' : 'outline'}
            onClick={() =>
              updateState({
                background: {
                  type: 'gradient',
                  gradient: { angle: 45, colors: ['#ff0080', '#7928ca'] },
                },
              })
            }
          >
            Gradiente
          </Button>
        </div>

        {state.background.type === 'solid' && (
          <div className="flex items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-20 h-10"
                  style={{ backgroundColor: state.background.solid }}
                />
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3">
                <HexColorPicker
                  color={state.background.solid || '#ffffff'}
                  onChange={(color) =>
                    updateState({ background: { ...state.background, solid: color } })
                  }
                />
              </PopoverContent>
            </Popover>
            <Input
              value={state.background.solid || '#ffffff'}
              onChange={(e) =>
                updateState({ background: { ...state.background, solid: e.target.value } })
              }
              className="flex-1"
            />
          </div>
        )}

        {state.background.type === 'gradient' && state.background.gradient && (
          <Card className="p-4 space-y-3">
            <div className="space-y-2">
              <Label>Ângulo: {state.background.gradient.angle}°</Label>
              <Slider
                value={[state.background.gradient.angle]}
                onValueChange={([angle]) =>
                  updateState({
                    background: {
                      ...state.background,
                      gradient: { ...state.background.gradient!, angle },
                    },
                  })
                }
                min={0}
                max={360}
                step={1}
              />
            </div>
            {state.background.gradient.colors.map((color, index) => (
              <div key={index} className="flex items-center gap-3">
                <Label className="w-16">Cor {index + 1}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-20 h-10" style={{ backgroundColor: color }} />
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-3">
                    <HexColorPicker
                      color={color}
                      onChange={(newColor) => {
                        const newColors = [...state.background.gradient!.colors];
                        newColors[index] = newColor;
                        updateState({
                          background: {
                            ...state.background,
                            gradient: { ...state.background.gradient!, colors: newColors },
                          },
                        });
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  value={color}
                  onChange={(e) => {
                    const newColors = [...state.background.gradient!.colors];
                    newColors[index] = e.target.value;
                    updateState({
                      background: {
                        ...state.background,
                        gradient: { ...state.background.gradient!, colors: newColors },
                      },
                    });
                  }}
                  className="flex-1"
                />
              </div>
            ))}
            {state.background.gradient.colors.length < 3 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newColors = [...state.background.gradient!.colors, '#ffffff'];
                  updateState({
                    background: {
                      ...state.background,
                      gradient: { ...state.background.gradient!, colors: newColors },
                    },
                  });
                }}
              >
                + Adicionar Cor
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* Borders */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Bordas entre Quadros</Label>
          <Switch
            checked={state.borders.enabled}
            onCheckedChange={(enabled) => updateState({ borders: { ...state.borders, enabled } })}
          />
        </div>

        {state.borders.enabled && (
          <Card className="p-4 space-y-4">
            <div className="space-y-2">
              <Label>Espessura: {state.borders.thickness}px</Label>
              <Slider
                value={[state.borders.thickness]}
                onValueChange={([thickness]) =>
                  updateState({ borders: { ...state.borders, thickness } })
                }
                min={1}
                max={20}
                step={1}
              />
            </div>
            <div className="flex items-center gap-3">
              <Label className="w-16">Cor</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-20 h-10"
                    style={{ backgroundColor: state.borders.color }}
                  />
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3">
                  <HexColorPicker
                    color={state.borders.color}
                    onChange={(color) => updateState({ borders: { ...state.borders, color } })}
                  />
                </PopoverContent>
              </Popover>
              <Input
                value={state.borders.color}
                onChange={(e) => updateState({ borders: { ...state.borders, color: e.target.value } })}
                className="flex-1"
              />
            </div>
            <div className="space-y-2">
              <Label>Opacidade: {Math.round(state.borders.opacity * 100)}%</Label>
              <Slider
                value={[state.borders.opacity]}
                onValueChange={([opacity]) => updateState({ borders: { ...state.borders, opacity } })}
                min={0}
                max={1}
                step={0.01}
              />
            </div>
          </Card>
        )}
      </div>

      {/* Chroma Key */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-semibold">Fundo Verde no Vídeo</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Ativa fundo chroma key #00FF00 no vídeo. Força exportação apenas em PNG.
            </p>
          </div>
          <Switch
            checked={state.chromaKey}
            onCheckedChange={(chromaKey) => {
              updateState({ chromaKey, exportMode: chromaKey ? 'png' : state.exportMode });
            }}
          />
        </div>
      </div>
    </div>
  );
}

