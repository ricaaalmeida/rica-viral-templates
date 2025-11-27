import { Button } from "@/components/ui/button";
import { RotateCcw, Info } from "lucide-react";
import { APP_TITLE } from "@/const";
import Wizard from "@/components/Wizard";
import Preview from "@/components/Preview";
import { useProject } from "@/contexts/ProjectContext";
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
} from "@/components/ui/alert-dialog";

export default function Home() {
  const { resetState } = useProject();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">{APP_TITLE}</h1>
                <p className="text-xs text-muted-foreground">
                  Crie posts virais estilo fofoca
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Info className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Ajuda</span>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Reset</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Resetar Projeto?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Isso irá apagar todo o progresso atual e resetar o projeto
                      para o estado inicial. Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={resetState}>
                      Resetar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container py-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Wizard */}
            <div className="order-2 lg:order-1">
              <Wizard />
            </div>

            {/* Preview */}
            <div className="order-1 lg:order-2">
              <Preview />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card py-4">
        <div className="container">
          <p className="text-center text-sm text-muted-foreground">
            🔒 Tudo processado localmente via Blob/Canvas. Seus dados nunca saem
            do dispositivo.
          </p>
        </div>
      </footer>
    </div>
  );
}

