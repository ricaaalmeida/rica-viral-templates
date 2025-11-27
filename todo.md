# RICA VIRAL TEMPLATES - TODO

## Arquitetura e Setup Base
- [x] Configurar PWA (manifest, service worker, ícones)
- [x] Configurar IndexedDB para persistência local
- [x] Implementar autosave de rascunhos
- [x] Implementar botão Reset

## Wizard - Passo 1: Formato & Fundo
- [x] Seletor de ratio de saída (4:5 padrão, 1:1, 9:16, 16:9, 3:4, 2:3, 21:9)
- [x] Configuração de fundo (cor sólida ou gradiente linear com ângulo + 2-3 cores)
- [x] Toggle e configuração de bordas (espessura, cor, opacidade)
- [x] Toggle "Fundo Verde no Vídeo" com explicação

## Wizard - Passo 2: Perfil & Texto
- [x] Upload de imagem de perfil com crop circular 1:1
- [x] Campo "Nome do Perfil" (texto obrigatório)
- [x] Campo "@username" (auto-adiciona @ na exibição)
- [x] Selo de verificado sempre visível (toggle true e desabilitado)
- [x] Campo "Manchete" multiline com contagem de caracteres

## Wizard - Passo 3: Conteúdo
- [x] Seletor de quantidade de imagens estáticas (2 ou 3)
- [x] Upload de imagens para cada quadro do mosaico
- [ ] Ferramentas de manipulação: drag, pinch-zoom, rotate
- [ ] Ferramentas: snap-to-grid, alinhar bordas
- [ ] Botões: Fit, Fill, Center, Crop (com detecção de rostos)
- [x] Upload de vídeo para coluna direita
- [x] Controles de vídeo: mute preview, loop
- [ ] Controles de TRIM (in/out) com thumbs
- [x] Toggle "Legendas Overlay" com texto curto opcional
- [x] Presets de layout (split 58/42, 60/40, 55/45, 50/50)
- [ ] Presets de borda (0px, 4px branco, 6px preto 50%)

## Canvas e Preview
- [x] Renderização em canvas com OffscreenCanvas quando disponível
- [x] Quadro de conteúdo 1:1 sempre presente dentro do canvas final
- [x] Preview em tempo real com todas as alterações
- [ ] Safe-area overlay (toggle)
- [ ] Indicador do quadro 1:1
- [x] Processamento de imagens/vídeo em memória (Blob/URL.createObjectURL)
- [x] Reamostragem de imagens para máx 4096px

## Cabeçalho do Post
- [x] Área superior fixa com imagem de perfil
- [x] Nome do perfil (18px bold)
- [x] Selo verificado sempre visível à direita do nome
- [x] Handle @ (14px regular cinza #666)
- [x] Manchete multiline (16px regular preto)

## Tipografia e Paleta
- [x] Família sans-serif (Inter/Helvetica fallback)
- [x] Tamanhos FIXOS (não ajustáveis pelo usuário)
- [x] Tema padrão fofoca (branco/preto/cinza)
- [x] Customização de cores gerais (texto/bordas/fundos)
- [x] Legenda de vídeo overlay (28px bold branco com sombra)

## Wizard - Passo 4: Exportação
- [x] Validação: pelo menos 1 imagem à esquerda
- [x] Validação: regras MP4 vs PNG + chroma
- [ ] Validação: limites de memória
- [x] Modo PNG: exportação em resolução configurável (1080 no lado curto + custom)
- [ ] Modo MP4: renderização de frames + muxing com ffmpeg.wasm (H.264 + AAC)
- [ ] Fallback para WebM VP9 se necessário
- [x] Configuração de FPS (24/30)
- [ ] Configuração de bitrate (automático)
- [x] Barra de progresso durante exportação
- [x] Download de Blob (Download.mp4 / Download.png)
- [ ] Cancelar exportação

## Responsividade
- [ ] Mobile first design
- [ ] Barras fixas superiores/inferiores com botões grandes
- [ ] Gestos touch: dois dedos zoom, um dedo drag, rotação
- [ ] Atalhos desktop: 1/2/3 troca quadro, G grid, F Fit
- [ ] Atalhos: Shift+setas nudge 1px, Alt+scroll zoom

## Performance
- [ ] Worker dedicado para ffmpeg
- [ ] Throttling de UI durante render
- [ ] Particionamento de render em chunks

## Acessibilidade
- [ ] Labels em todos os campos
- [ ] Foco visível
- [ ] Contraste mínimo 4.5:1
- [ ] Navegação por teclado
- [ ] Mensagens de erro claras

## Funcionalidades Extras
- [ ] Função de exportar projeto como JSON
- [ ] Função de reimportar projeto JSON
- [x] Aviso "Tudo processado localmente via Blob/Canvas"
- [x] README com instruções de uso

## PWA
- [x] Ícone e splash screen
- [x] Service worker para cache
- [x] Manifest.json configurado



## Correções Urgentes
- [x] Corrigir layout do cabeçalho do post baseado nas referências
- [x] Garantir que preview funcione 100% ao adicionar imagens
- [x] Garantir que preview funcione 100% ao adicionar vídeos
- [x] Ajustar posicionamento e espaçamento do cabeçalho
- [x] Melhorar renderização de imagens no canvas



## Correção de Sobreposição
- [x] Corrigir sobreposição do cabeçalho com o quadro de conteúdo
- [x] Garantir que manchete fique completamente acima do quadro 1:1



## Correção de Layout do Cabeçalho
- [x] Organizar cabeçalho seguindo referência exata
- [x] Nome e selo verificado na MESMA linha horizontal
- [x] @ username logo abaixo do nome
- [x] Manchete abaixo do username
- [x] Foto de perfil à esquerda de tudo



## Correção de Posicionamento da Manchete
- [x] Manchete deve começar ABAIXO da foto de perfil (não ao lado)
- [x] Manchete alinhada à esquerda com a foto de perfil



## Ajustes de Espaçamento
- [x] Aumentar espaço entre nome e selo verificado
- [x] Descer mais a manchete para ter mais respiro visual



## Ajuste Final de Espaçamento
- [x] Dobrar espaçamento da manchete (40px ao invés de 20px)



## Controles de Tipografia e Espaçamento
- [x] Adicionar sliders para tamanho da foto de perfil
- [x] Adicionar sliders para tamanho do nome
- [x] Adicionar sliders para tamanho do username
- [x] Adicionar sliders para tamanho da manchete
- [x] Adicionar sliders para espaçamento entre foto e manchete
- [x] Adicionar sliders para espaçamento entre manchete e quadro de conteúdo



## Correção de Warnings
- [x] Corrigir warning de refs no Button component



## Controles de Posicionamento da Foto de Perfil
- [x] Adicionar slider para posição horizontal da foto
- [x] Adicionar slider para posição vertical da foto



## Correção de Posicionamento
- [x] Corrigir offsets para mover apenas a foto, não o header inteiro



## Bugs Críticos no Preview e Exportação
- [x] Preview e exportação devem ser idênticos
- [x] Revisar completamente o cálculo de layout do canvas
- [x] Garantir que manchete apareça corretamente
- [x] Garantir que quadro 1:1 seja respeitado
- [x] Criar arquivo ZIP final para download



## Bug de Renderização de Imagens
- [x] Preview deve esticar imagens para preencher toda a área (como no output PNG)
- [x] Garantir que preview e output sejam 100% idênticos



## Nova Funcionalidade - Mosaico com 1 Imagem
- [x] Adicionar opção de selecionar apenas 1 imagem no mosaico
- [x] Ajustar layout automaticamente quando 1 imagem for selecionada



## Bug de Centralização Vertical
- [x] Centralizar todo o conteúdo verticalmente no canvas
- [x] Garantir que espaço em cima e embaixo sejam iguais
- [x] Aplicar tanto no preview quanto no output



## Melhoria - Aumentar Ranges dos Sliders
- [x] Aumentar range do tamanho da foto de perfil (20-150px)
- [x] Aumentar range das posições horizontal e vertical da foto (-300 a +300px)
- [x] Aumentar range dos tamanhos de texto (nome 8-48px, username 8-36px, manchete 10-40px)
- [x] Aumentar range dos espaçamentos (foto-manchete 5-200px, manchete-quadro 20-500px)



## Novas Funcionalidades Urgentes
- [x] Permitir valores NEGATIVOS em todos os espaçamentos (-200 a +300px foto-manchete, -300 a +600px manchete-quadro)
- [x] Adicionar opção de esticar mosaico até largura total (preset 100/0 sem vídeo)



## Nova Funcionalidade - Mosaico Sem Bordas (Bleed)
- [x] Adicionar toggle para esticar mosaico até as extremidades laterais do canvas
- [x] Remover padding lateral quando ativado
- [x] Manter cabeçalho com padding normal



## Bug - Full Bleed com Vídeo
- [x] Corrigir Full Bleed para manter área do vídeo quando presente
- [x] Full Bleed deve esticar mosaico apenas até onde o vídeo começa



## Bug - Full Bleed Vídeo
- [x] Vídeo também deve esticar até borda direita quando Full Bleed ativo
- [x] Remover espaço em branco no lado direito do vídeo



## Nova Funcionalidade - Preview Tutorial Premium
- [x] Adicionar fundo escuro diferenciado no preview
- [x] Adicionar borda tracejada ao redor do canvas mostrando delimitação
- [x] Criar placeholders explicativos com ícones
- [x] Mostrar dados fictícios quando campos vazios (foto placeholder 📷, "Seu Nome", "@seuusername", manchete exemplo)
- [x] Adicionar labels nos quadros vazios: "FOTO 1", "FOTO 2", "FOTO 3" 🖼️, "VÍDEO" 🎥
- [x] Substituir placeholders por dados reais conforme usuário preenche
- [x] Manter output PNG sem placeholders (apenas dados reais)



## Bug - Preview Esticado Verticalmente
- [x] Corrigir altura do preview para respeitar aspect ratio escolhido
- [x] Preview deve manter proporção correta (4:5, 1:1, 9:16, etc) sem esticar verticalmente
- [x] Adicionar max-height ou aspect-ratio CSS para limitar altura do canvas no preview




## Bug CRÍTICO - Aspect Ratio Invertido no Preview
- [x] Canvas está sendo renderizado com proporções erradas (muito alto e estreito)
- [x] Aspect ratio 4:5 deveria ser mais largo que alto, mas está acontecendo o contrário
- [x] Revisar cálculo de canvasSize no useEffect do Preview.tsx
- [x] Garantir que width e height sejam calculados corretamente baseado no aspect ratio
- [x] Corrigir CSS do canvas para usar width: 100%, height: auto e aspectRatio




## Melhoria - Reduzir Tamanho do Preview
- [x] Reduzir dimensões máximas do canvas no preview
- [x] Preview deve caber 100% visível em telas desktop sem scroll
- [x] Ajustar maxWidth e maxHeight para valores menores (500x650)




## Nova Funcionalidade - Cores Individuais dos Elementos
- [x] Adicionar accordion (sanfona) para "Controles de Tipografia e Espaçamento"
- [x] Criar novo accordion "Cores dos Elementos" no Passo 2
- [x] Adicionar seletor de cor para o nome do perfil
- [x] Adicionar seletor de cor para o username
- [x] Adicionar seletor de cor para o texto do post
- [x] Adicionar seletor de cor para o selo verificado
- [x] Atualizar state no ProjectContext com as novas cores
- [x] Aplicar cores individuais no Preview.tsx
- [x] Aplicar cores individuais no useCanvasExport.ts

## Nova Funcionalidade - Controles de Posicionamento Nome e Username
- [x] Adicionar controle de espaçamento vertical entre nome e username
- [x] Adicionar controle de posição horizontal do nome (-300 a +300px)
- [x] Adicionar controle de posição vertical do nome (-300 a +300px)
- [x] Adicionar controle de posição horizontal do username (-300 a +300px)
- [x] Adicionar controle de posição vertical do username (-300 a +300px)
- [x] Atualizar TypographyConfig com novos campos
- [x] Aplicar posicionamento no Preview.tsx
- [x] Aplicar posicionamento no useCanvasExport.ts
- [x] Criar accordion "Posicionamento Avançado" na interface

## Nova Funcionalidade - Toggle Selo Verificado
- [x] Adicionar campo showVerifiedBadge no ProfileConfig
- [x] Adicionar toggle/switch na interface do Step2Profile
- [x] Aplicar condicional no Preview.tsx
- [x] Aplicar condicional no useCanvasExport.ts

## Melhoria - Renomear Manchete para "Texto do Post"
- [x] Trocar "headline" por "postText" no ProfileConfig
- [x] Trocar "headlineSize" por "postTextSize" no TypographyConfig
- [x] Trocar "headlineSpacing" por "postTextSpacing" no TypographyConfig
- [x] Trocar "headlineColor" por "postTextColor" no TypographyConfig
- [x] Atualizar todas as labels na interface para "Texto do Post"
- [x] Atualizar Preview.tsx
- [x] Atualizar useCanvasExport.ts




## Nova Funcionalidade - Transformações Globais
- [x] Criar accordion "Transformações Globais" no Step2Profile
- [x] Adicionar campos no state para transformações do header
  - [x] headerOffsetX (deslocamento horizontal do header completo)
  - [x] headerOffsetY (deslocamento vertical do header completo)
  - [x] headerFlipHorizontal (inversão horizontal do header)
  - [x] headerFlipVertical (inversão vertical do header)
- [x] Adicionar campos no state para transformações do mosaico
  - [x] contentOffsetX (deslocamento horizontal do mosaico)
  - [x] contentOffsetY (deslocamento vertical do mosaico)
  - [x] contentFlipHorizontal (inversão horizontal do mosaico)
  - [x] contentFlipVertical (inversão vertical do mosaico)
- [x] Adicionar campo postTextFlipHorizontal (texto espelhado para "bugar" os leitores)
- [x] Criar controles na interface (sliders para offsets, switches para inversões)
- [x] Aplicar transformações no Preview.tsx usando ctx.scale(-1, 1) para flip horizontal
- [x] Aplicar transformações no useCanvasExport.ts
- [x] Testar inversão do texto do post (efeito espelho)




## Melhoria - Selo Verificado do Instagram
- [x] Baixar imagem do selo verificado oficial do Instagram
- [x] Salvar imagem em /client/public/verified-badge.png
- [x] Substituir círculo azul + checkmark por imagem real no Preview.tsx
- [x] Substituir círculo azul + checkmark por imagem real no useCanvasExport.ts
- [x] Ajustar tamanho e posicionamento do selo




## Nova Funcionalidade - Layout Apenas Vídeo (0 Imagens)
- [x] Adicionar opção "Sem Imagens" no Step3Content
- [x] Modificar imageCount para aceitar 0 como valor
- [x] Ocultar campos de upload de imagens quando imageCount = 0
- [x] Preset de layout "100/0" já existia (vídeo ocupa toda a largura)
- [x] Quando preset 100/0 for selecionado, ocultar campo de upload de vídeo
- [x] Atualizar Preview.tsx para renderizar apenas vídeo quando imageCount = 0
- [x] Atualizar useCanvasExport.ts para exportar apenas vídeo quando imageCount = 0
- [x] Atualizar validação no Step4Export para aceitar 0 imagens quando há vídeo


## Nova Funcionalidade - Dicas de Tela (Tooltips)
- [ ] Instalar @radix-ui/react-tooltip
- [ ] Criar componente Tooltip.tsx genérico
- [ ] Adicionar botão de ligar/desligar tooltips no header da aplicação
- [ ] Adicionar estado global para controlar visibilidade dos tooltips
- [ ] Envolver todos os controles (sliders, inputs, switches, botões) com o componente Tooltip
- [ ] Adicionar textos descritivos para cada controle

## Bug - Exportação PNG com Chroma Key
- [x] Investigar o erro "Chroma key configurado corretamente (PNG apenas)" no Step4Export
- [x] Verificar a lógica de validação no Step4Export.tsx
- [x] Garantir que a exportação PNG seja permitida mesmo com chroma key ativo, desde que o modo de exportação seja PNG
- [x] Corrigir a condição que estava bloqueando o botão de exportar




## Melhoria - Transformação do Header em Bloco
- [ ] Unificar a transformação do header (deslocamento e inversão) para afetar foto de perfil, nome, username e texto do post em conjunto.
- [ ] O `headerOffsetY` e `headerOffsetX` devem mover todo o bloco.
- [ ] A inversão (`headerFlip`) deve espelhar o bloco inteiro.
- [ ] Remover a inversão individual do `postTextFlipHorizontal`.

## Correção - Layout Apenas Vídeo
- [ ] Quando "Sem Imagens" for selecionado, o vídeo deve ocupar 100% da área de conteúdo (mosaico).
- [ ] O `layoutPreset` deve ser forçado para `0/100` ou similar quando `imageCount` for 0.
- [ ] Garantir que o `rightWidth` no Preview e `useCanvasExport` seja igual ao `contentSize`.

## Nova Funcionalidade - Presets de Resolução
- [ ] Adicionar botões com resoluções pré-definidas (720p, 1080p, 1440p, 2160p/4K) no Step4Export.
- [ ] Manter o campo de input para resolução customizada.
- [ ] Ao clicar no botão, o valor do input de resolução deve ser atualizado.

## Nova Funcionalidade - Hospedagem da Imagem de Perfil
- [ ] Implementar upload da imagem de perfil para um serviço de hospedagem gratuito.
- [ ] Usar o `manus-upload-file` para fazer o upload e obter a URL.
- [ ] Adicionar um estado de `loading` durante o upload.
- [ ] Após o upload, preencher automaticamente o campo de URL da imagem.
- [ ] Manter a opção de colar uma URL manualmente.
- [ ] Adicionar um campo de input para a URL da imagem de perfil no `ProjectContext` e na interface do `Step2Profile`.

