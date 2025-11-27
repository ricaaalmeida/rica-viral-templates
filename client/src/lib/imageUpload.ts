/**
 * Otimização de imagem MÁXIMA para base64 curto
 * Usa WebP que é 40% menor que JPEG!
 */

/**
 * Converte e otimiza imagem para o menor base64 possível
 * @param base64Image - String base64 da imagem original
 * @returns Base64 super otimizado (WebP, baixa resolução)
 */
export async function optimizeImageToShortBase64(base64Image: string): Promise<string> {
  try {
    // Carrega a imagem
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = base64Image;
    });

    // Cria canvas para redimensionar
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return base64Image;

    // Reduz MUITO o tamanho (150x150 é suficiente para profile pic)
    const maxSize = 150;
    let width = img.width;
    let height = img.height;

    // Calcula proporções
    if (width > height) {
      if (width > maxSize) {
        height = (height * maxSize) / width;
        width = maxSize;
      }
    } else {
      if (height > maxSize) {
        width = (width * maxSize) / height;
        height = maxSize;
      }
    }

    canvas.width = width;
    canvas.height = height;

    // Desenha redimensionada
    ctx.drawImage(img, 0, 0, width, height);

    // Converte para WebP com qualidade 75% (muito menor que JPEG!)
    const webpBase64 = canvas.toDataURL('image/webp', 0.75);
    
    console.log('✅ Imagem otimizada:');
    console.log(`   Original: ${Math.round(base64Image.length / 1024)}KB`);
    console.log(`   Otimizada: ${Math.round(webpBase64.length / 1024)}KB`);
    console.log(`   Redução: ${Math.round((1 - webpBase64.length / base64Image.length) * 100)}%`);

    return webpBase64;
  } catch (error) {
    console.error('Erro ao otimizar imagem:', error);
    return base64Image; // Fallback para original
  }
}

/**
 * Wrapper para compatibilidade (não faz upload, só otimiza local)
 */
export async function uploadImageWithFallback(base64Image: string): Promise<string> {
  return optimizeImageToShortBase64(base64Image);
}
