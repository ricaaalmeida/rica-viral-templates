import { useState, useRef } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, RotateCcw, Link2, Check } from 'lucide-react';
import Step1Format from './wizard/Step1Format';
import Step2Profile from './wizard/Step2Profile';
import Step3Content from './wizard/Step3Content';
import Step4Export from './wizard/Step4Export';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const steps = [
  { id: 1, title: 'Formato & Fundo', component: Step1Format },
  { id: 2, title: 'Perfil & Texto', component: Step2Profile },
  { id: 3, title: 'Conteúdo', component: Step3Content },
  { id: 4, title: 'Exportar', component: Step4Export },
];

export default function Wizard() {
  const { currentStep, setCurrentStep, state, resetState, copyShareLink } = useProject();
  const contentRef = useRef<HTMLDivElement>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const CurrentStepComponent = steps[currentStep - 1].component;

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return true;
      case 2:
        return state.profile.name?.trim() !== '';
      case 3:
        return state.images.some(img => img.blob !== null);
      case 4:
        return false; // Last step
      default:
        return false;
    }
  };

  const handleStepChange = (newStep: number) => {
    setCurrentStep(newStep);
    const scrollToTop = () => {
      if (contentRef.current) {
        if (typeof contentRef.current.scrollTo === 'function') {
          contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          contentRef.current.scrollTop = 0;
        }
      }
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    if (typeof window !== 'undefined' && 'requestAnimationFrame' in window) {
      window.requestAnimationFrame(scrollToTop);
    } else {
      scrollToTop();
    }
  };

  const handleCopyLink = async () => {
    await copyShareLink();
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleReset = () => {
    resetState();
    setLinkCopied(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Progress Bar */}
      <div className="border-b bg-background">
        <div className="container py-4">
          {/* Restaurar Padrões Button */}
          <div className="flex justify-end mb-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Restaurar Padrões
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Restaurar Configurações Padrão?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Atenção! Todas as suas configurações atuais serão perdidas permanentemente.
                    Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="my-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm font-semibold mb-3">
                    💡 Antes de continuar, você pode salvar suas configurações atuais:
                  </p>
                  <Button
                    onClick={handleCopyLink}
                    variant="secondary"
                    className="w-full"
                  >
                    {linkCopied ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Link Copiado!
                      </>
                    ) : (
                      <>
                        <Link2 className="w-4 h-4 mr-2" />
                        Copiar Link com Minhas Configurações
                      </>
                    )}
                  </Button>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset} className="bg-destructive hover:bg-destructive/90">
                    Restaurar Padrões
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                      currentStep >= step.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {step.id}
                  </div>
                  <div className="text-xs mt-1 text-center hidden sm:block">
                    {step.title}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 transition-colors ${
                      currentStep > step.id ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div ref={contentRef} className="flex-1 overflow-y-auto">
        <div className="container py-6">
          <CurrentStepComponent />
        </div>
      </div>

      {/* Navigation */}
      <div className="border-t bg-background">
        <div className="container py-4">
          <div className="flex justify-between gap-4">
            <Button
              variant="outline"
              onClick={() => handleStepChange(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="min-w-[120px]"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>
            {currentStep < 4 && (
              <Button
                onClick={() => handleStepChange(Math.min(4, currentStep + 1))}
                disabled={!canGoNext()}
                className="min-w-[120px]"
              >
                Próximo
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
