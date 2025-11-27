# RICA VIRAL TEMPLATES

Um web-app PWA 100% client-side que gera templates de post viral no estilo página de fofoca.

## 🎯 Características

- **100% Local e Privado**: Todo processamento acontece no seu dispositivo via Blob/Canvas
- **PWA Completo**: Funciona offline e pode ser instalado como app
- **Wizard Intuitivo**: 4 passos simples para criar seu post viral
- **Preview em Tempo Real**: Veja as alterações instantaneamente
- **Exportação Flexível**: PNG para imagens ou MP4 para vídeos (em desenvolvimento)
- **Responsivo**: Funciona perfeitamente em mobile e desktop

## 🚀 Como Usar

### Passo 1: Formato & Fundo
- Escolha a proporção da imagem (4:5, 1:1, 9:16, etc.)
- Configure o fundo (cor sólida ou gradiente)
- Ative bordas entre os quadros (opcional)
- Configure o modo "Fundo Verde" para chroma key (opcional)

### Passo 2: Perfil & Texto
- Faça upload da imagem de perfil
- Preencha o nome do perfil (obrigatório)
- Adicione o username (sem @, será adicionado automaticamente)
- Escreva a manchete do seu post

### Passo 3: Conteúdo
- Escolha quantas imagens no mosaico (2 ou 3)
- Faça upload das imagens
- Faça upload do vídeo
- Configure legendas e controles do vídeo

### Passo 4: Exportar
- Revise o checklist de validação
- Escolha o modo de exportação (PNG ou MP4)
- Configure a resolução
- Clique em "Exportar"

## 🎨 Funcionalidades

### Formatos Suportados
- **Aspect Ratios**: 4:5, 1:1, 9:16, 16:9, 3:4, 2:3, 21:9
- **Layout Presets**: 58/42, 60/40, 55/45, 50/50
- **Exportação**: PNG (pronto) e MP4 (em desenvolvimento)

### Personalização
- Fundos sólidos ou gradientes com até 3 cores
- Bordas customizáveis (espessura, cor, opacidade)
- Selo de verificado sempre ativo
- Legendas overlay no vídeo

### Tecnologias
- React 19 + TypeScript
- Tailwind CSS 4
- IndexedDB para persistência local
- Canvas API para renderização
- Service Worker para PWA

## 📱 Instalação como PWA

1. Abra o app no navegador
2. No Chrome/Edge: Clique no ícone de instalação na barra de endereço
3. No Safari (iOS): Toque em "Compartilhar" → "Adicionar à Tela de Início"

## 🔒 Privacidade

Todos os seus dados permanecem no seu dispositivo. Nenhuma imagem, vídeo ou informação é enviada para servidores externos. O processamento é 100% local usando tecnologias web modernas.

## 🛠️ Desenvolvimento

```bash
# Instalar dependências
pnpm install

# Executar em desenvolvimento
pnpm dev

# Build para produção
pnpm build
```

## 📋 Funcionalidades Implementadas

- ✅ Wizard de 4 passos
- ✅ Preview em tempo real
- ✅ Configuração de formatos e fundos
- ✅ Upload de imagens e vídeos
- ✅ Persistência local com IndexedDB
- ✅ Autosave de rascunhos
- ✅ Exportação PNG
- ✅ PWA completo (manifest, service worker, ícones)
- ✅ Responsividade mobile/desktop
- ⏳ Exportação MP4 com ffmpeg.wasm (em desenvolvimento)
- ⏳ Ferramentas de manipulação avançadas (crop, rotate, etc.)
- ⏳ Detecção de rostos para crop inteligente

## 📄 Licença

Este projeto foi criado para fins educacionais e de demonstração.

