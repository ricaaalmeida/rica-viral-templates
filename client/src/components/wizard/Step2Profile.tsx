import { useProject } from '@/contexts/ProjectContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Upload, CheckCircle2, ChevronDown, Loader2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { uploadImageWithFallback } from '@/lib/imageUpload';

export default function Step2Profile() {
  const { state, updateState } = useProject();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [charCount, setCharCount] = useState(state.profile.postText.length);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem válida');
      return;
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        const imageUrl = event.target?.result as string;
        
        // Otimiza para WebP super comprimido (150x150, qualidade 75%)
        const optimizedImageUrl = await uploadImageWithFallback(imageUrl);
        
        updateState({
          profile: { ...state.profile, image: optimizedImageUrl },
        });
        
        setIsUploading(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('Erro ao processar imagem. Tente novamente.');
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold mb-2">Perfil & Texto</h2>
        <p className="text-muted-foreground">
          Configure o perfil e o texto do seu post viral
        </p>
      </div>

      {/* Profile Image */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Imagem de Perfil</Label>
        <div className="flex items-center gap-4">
          <div
            className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            {state.profile.image ? (
              <img
                src={state.profile.image}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <Upload className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <div>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Otimizando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  {state.profile.image ? 'Trocar Imagem' : 'Upload Imagem'}
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              {isUploading 
                ? 'Comprimindo imagem com WebP...' 
                : 'Otimizado para base64 super leve (WebP)'}
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Profile Name */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">
          Nome do Perfil <span className="text-destructive">*</span>
        </Label>
        <Input
          value={state.profile.name}
          onChange={(e) =>
            updateState({ profile: { ...state.profile, name: e.target.value } })
          }
          placeholder="Digite o nome do perfil"
          className="text-lg"
        />
      </div>

      {/* Username */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Username</Label>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground font-mono">@</span>
          <Input
            value={state.profile.username}
            onChange={(e) =>
              updateState({ profile: { ...state.profile, username: e.target.value } })
            }
            placeholder="username"
            className="flex-1"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          O @ será exibido automaticamente antes do username
        </p>
      </div>

      {/* Verified Badge Toggle */}
      <Card className="p-4 bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-500" />
            <div>
              <Label className="text-base font-semibold">Selo de Verificado</Label>
              <p className="text-sm text-muted-foreground">
                Ative ou desative o selo azul ao lado do nome
              </p>
            </div>
          </div>
          <Switch
            checked={state.profile.showVerifiedBadge}
            onCheckedChange={(checked) =>
              updateState({
                profile: { ...state.profile, showVerifiedBadge: checked },
              })
            }
          />
        </div>
      </Card>

      {/* Verified Badge Fine Tuning */}
      {state.profile.showVerifiedBadge && (
        <Accordion type="single" collapsible className="space-y-4">
          <AccordionItem value="verified-badge-controls" className="border rounded-lg px-6">
            <AccordionTrigger className="hover:no-underline">
              <div className="text-left">
                <h3 className="text-lg font-semibold">Ajustes do Selo Verificado</h3>
                <p className="text-sm text-muted-foreground">
                  Controle o tamanho e a posição do selo em relação ao nome
                </p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pt-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium">Tamanho do Selo</Label>
                  <span className="text-sm text-muted-foreground font-mono">
                    {state.typography.verifiedBadgeSize}px
                  </span>
                </div>
                <Slider
                  value={[state.typography.verifiedBadgeSize]}
                  onValueChange={([value]) =>
                    updateState({
                      typography: { ...state.typography, verifiedBadgeSize: value },
                    })
                  }
                  min={8}
                  max={48}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium">Deslocamento Horizontal</Label>
                    <span className="text-sm text-muted-foreground font-mono">
                      {state.typography.verifiedBadgeOffsetX}px
                    </span>
                  </div>
                  <Slider
                    value={[state.typography.verifiedBadgeOffsetX]}
                    onValueChange={([value]) =>
                      updateState({
                        typography: { ...state.typography, verifiedBadgeOffsetX: value },
                      })
                    }
                    min={-60}
                    max={60}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium">Deslocamento Vertical</Label>
                    <span className="text-sm text-muted-foreground font-mono">
                      {state.typography.verifiedBadgeOffsetY}px
                    </span>
                  </div>
                  <Slider
                    value={[state.typography.verifiedBadgeOffsetY]}
                    onValueChange={([value]) =>
                      updateState({
                        typography: { ...state.typography, verifiedBadgeOffsetY: value },
                      })
                    }
                    min={-40}
                    max={40}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {/* Post Text */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Texto do Post</Label>
          <span className="text-sm text-muted-foreground">{charCount} caracteres</span>
        </div>
        <Textarea
          value={state.profile.postText}
          onChange={(e) => {
            updateState({ profile: { ...state.profile, postText: e.target.value } });
            setCharCount(e.target.value.length);
          }}
          placeholder="Digite o texto do seu post viral..."
          className="min-h-[120px] resize-none"
        />
        <p className="text-sm text-muted-foreground">
          Texto multiline com quebra automática.
        </p>
      </div>

      <Separator className="my-6" />

      {/* Accordions for Advanced Controls */}
      <Accordion type="multiple" className="space-y-4">
        {/* Typography and Spacing */}
        <AccordionItem value="typography" className="border rounded-lg px-6">
          <AccordionTrigger className="hover:no-underline">
            <div className="text-left">
              <h3 className="text-lg font-semibold">Controles de Tipografia e Espaçamento</h3>
              <p className="text-sm text-muted-foreground">
                Ajuste os tamanhos e espaçamentos do cabeçalho
              </p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-6 pt-4">
            {/* Profile Size */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Tamanho da Foto de Perfil</Label>
                <span className="text-sm text-muted-foreground font-mono">{state.typography.profileSize}px</span>
              </div>
              <Slider
                value={[state.typography.profileSize]}
                onValueChange={([value]) =>
                  updateState({
                    typography: { ...state.typography, profileSize: value },
                  })
                }
                min={20}
                max={150}
                step={2}
                className="w-full"
              />
            </div>

            {/* Profile Horizontal Position */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Posição Horizontal da Foto</Label>
                <span className="text-sm text-muted-foreground font-mono">{state.typography.profileOffsetX}px</span>
              </div>
              <Slider
                value={[state.typography.profileOffsetX]}
                onValueChange={([value]) =>
                  updateState({
                    typography: { ...state.typography, profileOffsetX: value },
                  })
                }
                min={-300}
                max={300}
                step={5}
                className="w-full"
              />
            </div>

            {/* Profile Vertical Position */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Posição Vertical da Foto</Label>
                <span className="text-sm text-muted-foreground font-mono">{state.typography.profileOffsetY}px</span>
              </div>
              <Slider
                value={[state.typography.profileOffsetY]}
                onValueChange={([value]) =>
                  updateState({
                    typography: { ...state.typography, profileOffsetY: value },
                  })
                }
                min={-300}
                max={300}
                step={5}
                className="w-full"
              />
            </div>

            {/* Name Size */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Tamanho do Nome</Label>
                <span className="text-sm text-muted-foreground font-mono">{state.typography.nameSize}px</span>
              </div>
              <Slider
                value={[state.typography.nameSize]}
                onValueChange={([value]) =>
                  updateState({
                    typography: { ...state.typography, nameSize: value },
                  })
                }
                min={8}
                max={48}
                step={1}
                className="w-full"
              />
            </div>

            {/* Username Size */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Tamanho do Username</Label>
                <span className="text-sm text-muted-foreground font-mono">{state.typography.usernameSize}px</span>
              </div>
              <Slider
                value={[state.typography.usernameSize]}
                onValueChange={([value]) =>
                  updateState({
                    typography: { ...state.typography, usernameSize: value },
                  })
                }
                min={8}
                max={36}
                step={1}
                className="w-full"
              />
            </div>

            {/* Post Text Size */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Tamanho do Texto do Post</Label>
                <span className="text-sm text-muted-foreground font-mono">{state.typography.postTextSize}px</span>
              </div>
              <Slider
                value={[state.typography.postTextSize]}
                onValueChange={([value]) =>
                  updateState({
                    typography: { ...state.typography, postTextSize: value },
                  })
                }
                min={10}
                max={40}
                step={1}
                className="w-full"
              />
            </div>

            {/* Name-Username Spacing */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Espaço: Nome → Username</Label>
                <span className="text-sm text-muted-foreground font-mono">{state.typography.nameUsernameSpacing}px</span>
              </div>
              <Slider
                value={[state.typography.nameUsernameSpacing]}
                onValueChange={([value]) =>
                  updateState({
                    typography: { ...state.typography, nameUsernameSpacing: value },
                  })
                }
                min={0}
                max={50}
                step={1}
                className="w-full"
              />
            </div>

            {/* Post Text Spacing */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Espaço: Foto → Texto do Post</Label>
                <span className="text-sm text-muted-foreground font-mono">{state.typography.postTextSpacing}px</span>
              </div>
              <Slider
                value={[state.typography.postTextSpacing]}
                onValueChange={([value]) =>
                  updateState({
                    typography: { ...state.typography, postTextSpacing: value },
                  })
                }
                min={-200}
                max={300}
                step={5}
                className="w-full"
              />
            </div>

            {/* Content Spacing */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Espaço: Texto do Post → Quadro</Label>
                <span className="text-sm text-muted-foreground font-mono">{state.typography.contentSpacing}px</span>
              </div>
              <Slider
                value={[state.typography.contentSpacing]}
                onValueChange={([value]) =>
                  updateState({
                    typography: { ...state.typography, contentSpacing: value },
                  })
                }
                min={-300}
                max={600}
                step={10}
                className="w-full"
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Positioning Controls */}
        <AccordionItem value="positioning" className="border rounded-lg px-6">
          <AccordionTrigger className="hover:no-underline">
            <div className="text-left">
              <h3 className="text-lg font-semibold">Posicionamento Avançado</h3>
              <p className="text-sm text-muted-foreground">
                Controle a posição individual de nome e username
              </p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-6 pt-4">
            {/* Name Horizontal Offset */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Posição Horizontal do Nome</Label>
                <span className="text-sm text-muted-foreground font-mono">{state.typography.nameOffsetX}px</span>
              </div>
              <Slider
                value={[state.typography.nameOffsetX]}
                onValueChange={([value]) =>
                  updateState({
                    typography: { ...state.typography, nameOffsetX: value },
                  })
                }
                min={-300}
                max={300}
                step={5}
                className="w-full"
              />
            </div>

            {/* Name Vertical Offset */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Posição Vertical do Nome</Label>
                <span className="text-sm text-muted-foreground font-mono">{state.typography.nameOffsetY}px</span>
              </div>
              <Slider
                value={[state.typography.nameOffsetY]}
                onValueChange={([value]) =>
                  updateState({
                    typography: { ...state.typography, nameOffsetY: value },
                  })
                }
                min={-300}
                max={300}
                step={5}
                className="w-full"
              />
            </div>

            {/* Username Horizontal Offset */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Posição Horizontal do Username</Label>
                <span className="text-sm text-muted-foreground font-mono">{state.typography.usernameOffsetX}px</span>
              </div>
              <Slider
                value={[state.typography.usernameOffsetX]}
                onValueChange={([value]) =>
                  updateState({
                    typography: { ...state.typography, usernameOffsetX: value },
                  })
                }
                min={-300}
                max={300}
                step={5}
                className="w-full"
              />
            </div>

            {/* Username Vertical Offset */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Posição Vertical do Username</Label>
                <span className="text-sm text-muted-foreground font-mono">{state.typography.usernameOffsetY}px</span>
              </div>
              <Slider
                value={[state.typography.usernameOffsetY]}
                onValueChange={([value]) =>
                  updateState({
                    typography: { ...state.typography, usernameOffsetY: value },
                  })
                }
                min={-300}
                max={300}
                step={5}
                className="w-full"
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Color Controls */}
        <AccordionItem value="colors" className="border rounded-lg px-6">
          <AccordionTrigger className="hover:no-underline">
            <div className="text-left">
              <h3 className="text-lg font-semibold">Cores dos Elementos</h3>
              <p className="text-sm text-muted-foreground">
                Personalize as cores de cada elemento do cabeçalho
              </p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-6 pt-4">
            {/* Name Color */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Cor do Nome</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={state.typography.nameColor}
                  onChange={(e) =>
                    updateState({
                      typography: { ...state.typography, nameColor: e.target.value },
                    })
                  }
                  className="w-12 h-10 rounded border cursor-pointer"
                />
                <Input
                  value={state.typography.nameColor}
                  onChange={(e) =>
                    updateState({
                      typography: { ...state.typography, nameColor: e.target.value },
                    })
                  }
                  className="flex-1 font-mono"
                  placeholder="#000000"
                />
              </div>
            </div>

            {/* Username Color */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Cor do Username</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={state.typography.usernameColor}
                  onChange={(e) =>
                    updateState({
                      typography: { ...state.typography, usernameColor: e.target.value },
                    })
                  }
                  className="w-12 h-10 rounded border cursor-pointer"
                />
                <Input
                  value={state.typography.usernameColor}
                  onChange={(e) =>
                    updateState({
                      typography: { ...state.typography, usernameColor: e.target.value },
                    })
                  }
                  className="flex-1 font-mono"
                  placeholder="#666666"
                />
              </div>
            </div>

            {/* Post Text Color */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Cor do Texto do Post</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={state.typography.postTextColor}
                  onChange={(e) =>
                    updateState({
                      typography: { ...state.typography, postTextColor: e.target.value },
                    })
                  }
                  className="w-12 h-10 rounded border cursor-pointer"
                />
                <Input
                  value={state.typography.postTextColor}
                  onChange={(e) =>
                    updateState({
                      typography: { ...state.typography, postTextColor: e.target.value },
                    })
                  }
                  className="flex-1 font-mono"
                  placeholder="#000000"
                />
              </div>
            </div>

            {/* Verified Badge Color */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Cor do Selo Verificado</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={state.typography.verifiedBadgeColor}
                  onChange={(e) =>
                    updateState({
                      typography: { ...state.typography, verifiedBadgeColor: e.target.value },
                    })
                  }
                  className="w-12 h-10 rounded border cursor-pointer"
                />
                <Input
                  value={state.typography.verifiedBadgeColor}
                  onChange={(e) =>
                    updateState({
                      typography: { ...state.typography, verifiedBadgeColor: e.target.value },
                    })
                  }
                  className="flex-1 font-mono"
                  placeholder="#1DA1F2"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Global Transformations */}
        <AccordionItem value="transformations" className="border rounded-lg px-6">
          <AccordionTrigger className="hover:no-underline">
            <div className="text-left">
              <h3 className="text-lg font-semibold">Transformações Globais</h3>
              <p className="text-sm text-muted-foreground">
                Desloque e inverta o header (perfil + textos) e o mosaico separadamente
              </p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-6 pt-4">
            {/* Header Transformations */}
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
              <h4 className="font-semibold text-sm">Header (Foto + Textos)</h4>
              
              {/* Header Horizontal Offset */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium">Deslocamento Horizontal</Label>
                  <span className="text-sm text-muted-foreground font-mono">{state.transform.headerOffsetX}px</span>
                </div>
                <Slider
                  value={[state.transform.headerOffsetX]}
                  onValueChange={([value]) =>
                    updateState({
                      transform: { ...state.transform, headerOffsetX: value },
                    })
                  }
                  min={-500}
                  max={500}
                  step={10}
                  className="w-full"
                />
              </div>

              {/* Header Vertical Offset */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium">Deslocamento Vertical</Label>
                  <span className="text-sm text-muted-foreground font-mono">{state.transform.headerOffsetY}px</span>
                </div>
                <Slider
                  value={[state.transform.headerOffsetY]}
                  onValueChange={([value]) =>
                    updateState({
                      transform: { ...state.transform, headerOffsetY: value },
                    })
                  }
                  min={-500}
                  max={500}
                  step={10}
                  className="w-full"
                />
              </div>

              {/* Header Flips */}
              <div className="flex gap-4">
                <div className="flex items-center gap-2 flex-1">
                  <Switch
                    checked={state.transform.headerFlipHorizontal}
                    onCheckedChange={(checked) =>
                      updateState({
                        transform: { ...state.transform, headerFlipHorizontal: checked },
                      })
                    }
                  />
                  <Label className="text-sm">Inverter Horizontalmente</Label>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <Switch
                    checked={state.transform.headerFlipVertical}
                    onCheckedChange={(checked) =>
                      updateState({
                        transform: { ...state.transform, headerFlipVertical: checked },
                      })
                    }
                  />
                  <Label className="text-sm">Inverter Verticalmente</Label>
                </div>
              </div>
            </div>

            {/* Content Transformations */}
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
              <h4 className="font-semibold text-sm">Mosaico (Fotos/Vídeos)</h4>
              
              {/* Content Horizontal Offset */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium">Deslocamento Horizontal</Label>
                  <span className="text-sm text-muted-foreground font-mono">{state.transform.contentOffsetX}px</span>
                </div>
                <Slider
                  value={[state.transform.contentOffsetX]}
                  onValueChange={([value]) =>
                    updateState({
                      transform: { ...state.transform, contentOffsetX: value },
                    })
                  }
                  min={-500}
                  max={500}
                  step={10}
                  className="w-full"
                />
              </div>

              {/* Content Vertical Offset */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium">Deslocamento Vertical</Label>
                  <span className="text-sm text-muted-foreground font-mono">{state.transform.contentOffsetY}px</span>
                </div>
                <Slider
                  value={[state.transform.contentOffsetY]}
                  onValueChange={([value]) =>
                    updateState({
                      transform: { ...state.transform, contentOffsetY: value },
                    })
                  }
                  min={-500}
                  max={500}
                  step={10}
                  className="w-full"
                />
              </div>

              {/* Content Flips */}
              <div className="flex gap-4">
                <div className="flex items-center gap-2 flex-1">
                  <Switch
                    checked={state.transform.contentFlipHorizontal}
                    onCheckedChange={(checked) =>
                      updateState({
                        transform: { ...state.transform, contentFlipHorizontal: checked },
                      })
                    }
                  />
                  <Label className="text-sm">Inverter Horizontalmente</Label>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <Switch
                    checked={state.transform.contentFlipVertical}
                    onCheckedChange={(checked) =>
                      updateState({
                        transform: { ...state.transform, contentFlipVertical: checked },
                      })
                    }
                  />
                  <Label className="text-sm">Inverter Verticalmente</Label>
                </div>
              </div>
            </div>

            {/* Post Text Flip (Easter Egg) */}
            <div className="space-y-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    Texto do Post Espelhado 😈
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ative para "bugar" todo mundo e gerar engajamento! 😂
                  </p>
                </div>
                <Switch
                  checked={state.transform.postTextFlipHorizontal}
                  onCheckedChange={(checked) =>
                    updateState({
                      transform: { ...state.transform, postTextFlipHorizontal: checked },
                    })
                  }
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
