
import { useCallback } from 'react';
import { ProjectState } from '@/contexts/ProjectContext';

function parseAspectRatio(ratio: string): [number, number] {
  const [w, h] = ratio.split(':').map(Number);
  return [w, h];
}

function parseLayoutPreset(preset: string): [number, number] {
  const [left, right] = preset.split('/').map(Number);
  return [left / 100, right / 100];
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function ensureFontsLoaded() {
  if (typeof document === 'undefined' || !('fonts' in document)) {
    return;
  }

  try {
    const fontFaceSet = (document as Document & { fonts: FontFaceSet }).fonts;
    await Promise.all([
      fontFaceSet.load('bold 16px Inter'),
      fontFaceSet.load('16px Inter'),
      fontFaceSet.ready,
    ]);
  } catch (error) {
    console.warn('Unable to confirm font loading, continuing anyway.', error);
  }
}

export function useCanvasExport() {
  const renderToCanvas = useCallback(
    async (
      state: ProjectState,
      resolution: number,
      videoElement?: HTMLVideoElement
    ): Promise<HTMLCanvasElement> => {
      await ensureFontsLoaded();

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // Calculate canvas dimensions based on aspect ratio
      const [w, h] = parseAspectRatio(state.aspectRatio);
      const isPortrait = h > w;
      
      if (isPortrait) {
        canvas.width = resolution;
        canvas.height = Math.round((resolution * h) / w);
      } else {
        canvas.height = resolution;
        canvas.width = Math.round((resolution * w) / h);
      }

      const canvasSize = { width: canvas.width, height: canvas.height };

      // Calculate scale factor based on export resolution vs preview reference size
      // Preview reference is 500px width for portrait aspect ratios
      const previewReferenceWidth = 500;
      const previewReferenceHeight = (previewReferenceWidth * h) / w;
      const scaleFactor = Math.min(
        canvasSize.width / previewReferenceWidth,
        canvasSize.height / previewReferenceHeight
      );

      // Draw background (EXACTLY like Preview)
      if (state.background.type === 'solid') {
        ctx.fillStyle = state.background.solid || '#ffffff';
        ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
      } else if (state.background.type === 'gradient' && state.background.gradient) {
        const { angle, colors } = state.background.gradient;
        const rad = (angle * Math.PI) / 180;
        const x1 = canvasSize.width / 2 - Math.cos(rad) * canvasSize.width / 2;
        const y1 = canvasSize.height / 2 - Math.sin(rad) * canvasSize.height / 2;
        const x2 = canvasSize.width / 2 + Math.cos(rad) * canvasSize.width / 2;
        const y2 = canvasSize.height / 2 + Math.sin(rad) * canvasSize.height / 2;

        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        colors.forEach((color, index) => {
          gradient.addColorStop(index / (colors.length - 1), color);
        });
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
      }

      // Calculate content size first (always 1:1 square)
      const contentSize = Math.min(canvasSize.width * 0.85, canvasSize.height * 0.7);
      const contentX = (canvasSize.width - contentSize) / 2;
      
      // Scale all typography values proportionally
      const profileSize = state.typography.profileSize * scaleFactor;
      const postTextSpacing = state.typography.postTextSpacing * scaleFactor;
      const contentSpacing = state.typography.contentSpacing * scaleFactor;
      
      // Estimate post text height (rough calculation, scaled)
      const estimatedPostTextLines = state.profile.postText ? Math.ceil(state.profile.postText.length / 50) : 0;
      const postTextHeight = estimatedPostTextLines * 20 * scaleFactor;
      
      const totalHeaderHeight = profileSize + postTextSpacing + postTextHeight + contentSpacing;
      const totalContentHeight = totalHeaderHeight + contentSize;
      
      // Center everything vertically
      const topPadding = (canvasSize.height - totalContentHeight) / 2;
      const contentY = topPadding + totalHeaderHeight;

      // Draw header (profile section) - ABOVE content area
      const headerY = topPadding;

      // Profile image (circular, left side)
      // profileSize already declared above
      const baseProfileX = contentX;
      const baseProfileY = headerY;
      
      // Apply GLOBAL header transformations
      ctx.save();
      
      // Apply header offset (scaled)
      ctx.translate(state.transform.headerOffsetX * scaleFactor, state.transform.headerOffsetY * scaleFactor);
      
      // Apply header flips
      if (state.transform.headerFlipHorizontal || state.transform.headerFlipVertical) {
        const flipCenterX = baseProfileX + profileSize / 2;
        const flipCenterY = baseProfileY + profileSize / 2;
        ctx.translate(flipCenterX, flipCenterY);
        ctx.scale(
          state.transform.headerFlipHorizontal ? -1 : 1,
          state.transform.headerFlipVertical ? -1 : 1
        );
        ctx.translate(-flipCenterX, -flipCenterY);
      }
      
      // Apply offsets ONLY to the photo position (scaled)
      const profileX = baseProfileX + state.typography.profileOffsetX * scaleFactor;
      const profileY = baseProfileY + state.typography.profileOffsetY * scaleFactor;
      
      if (state.profile.image) {
        try {
          const profileImg = await loadImage(state.profile.image);
          ctx.save();
          ctx.beginPath();
          ctx.arc(profileX + profileSize / 2, profileY + profileSize / 2, profileSize / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(profileImg, profileX, profileY, profileSize, profileSize);
          ctx.restore();
        } catch (e) {
          console.error('Failed to load profile image:', e);
        }
      }

      // Text starts to the right of BASE profile position (not affected by offsets)
      const textStartX = baseProfileX + profileSize + 12 * scaleFactor;
      
      // LINE 1: Name + Verified Badge (with individual offsets, scaled)
      const nameX = textStartX + state.typography.nameOffsetX * scaleFactor;
      const nameY = baseProfileY + 16 * scaleFactor + state.typography.nameOffsetY * scaleFactor;
      
      ctx.fillStyle = state.typography.nameColor;
      ctx.font = `bold ${state.typography.nameSize * scaleFactor}px Inter, sans-serif`;
      const nameText = state.profile.name || 'Nome do Perfil';
      ctx.fillText(nameText, nameX, nameY);

      // Verified badge right after name (with more spacing, scaled)
      if (state.profile.showVerifiedBadge && state.profile.name) {
        const nameWidth = ctx.measureText(nameText).width;
        const badgeSize = (state.typography.verifiedBadgeSize || 16) * scaleFactor;
        const badgeX = nameX + nameWidth + state.typography.verifiedBadgeOffsetX * scaleFactor;
        const badgeY = nameY - badgeSize + state.typography.verifiedBadgeOffsetY * scaleFactor;
        
        try {
          const badgeImg = await loadImage('/verified-badge.png');
          ctx.drawImage(badgeImg, badgeX, badgeY, badgeSize, badgeSize);
        } catch (e) {
          // Fallback to circle if image fails to load
          ctx.fillStyle = state.typography.verifiedBadgeColor;
          ctx.beginPath();
          ctx.arc(badgeX + badgeSize / 2, badgeY + badgeSize / 2, badgeSize / 2, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${Math.max(10, badgeSize * 0.65)}px Inter, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('✓', badgeX + badgeSize/2, badgeY + badgeSize/2);
          ctx.textAlign = 'left';
          ctx.textBaseline = 'alphabetic';
        }
      }

      // LINE 2: Username (with individual offsets, scaled)
      const usernameX = textStartX + state.typography.usernameOffsetX * scaleFactor;
      const usernameY = nameY + state.typography.nameUsernameSpacing * scaleFactor + state.typography.usernameOffsetY * scaleFactor;
      
      if (state.profile.username) {
        ctx.fillStyle = state.typography.usernameColor;
        ctx.font = `${state.typography.usernameSize * scaleFactor}px Inter, sans-serif`;
        ctx.fillText(`@${state.profile.username}`, usernameX, usernameY);
      }

      // LINE 3+: Post Text (BELOW BASE profile position, starts at contentX)
      // MUST be drawn BEFORE ctx.restore() to be affected by header transformations
      const postTextY = baseProfileY + profileSize + postTextSpacing;
      
      if (state.profile.postText) {
        ctx.fillStyle = state.typography.postTextColor;
        ctx.font = `${state.typography.postTextSize * scaleFactor}px Inter, sans-serif`;
        
        // Apply text flip if enabled (for "bugging" readers)
        if (state.transform.postTextFlipHorizontal) {
          ctx.save();
          ctx.scale(-1, 1);
        }
        
        const words = state.profile.postText.split(' ');
        let line = '';
        let y = postTextY;
        const maxWidth = canvasSize.width - contentX * 2;

        words.forEach((word) => {
          const testLine = line + word + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && line !== '') {
            const textX = state.transform.postTextFlipHorizontal ? -contentX - metrics.width : contentX;
            ctx.fillText(line, textX, y);
            line = word + ' ';
            y += 20 * scaleFactor;
          } else {
            line = testLine;
          }
        });
        if (line.trim()) {
          const metrics = ctx.measureText(line);
          const textX = state.transform.postTextFlipHorizontal ? -contentX - metrics.width : contentX;
          ctx.fillText(line, textX, y);
        }
        
        if (state.transform.postTextFlipHorizontal) {
          ctx.restore();
        }
      }

      // Restore header transformations (AFTER drawing post text)
      ctx.restore();

      // Apply GLOBAL content transformations
      ctx.save();
      
      // Apply content offset (scaled)
      ctx.translate(state.transform.contentOffsetX * scaleFactor, state.transform.contentOffsetY * scaleFactor);
      
      // Apply content flips
      if (state.transform.contentFlipHorizontal || state.transform.contentFlipVertical) {
        const flipCenterX = contentX + contentSize / 2;
        const flipCenterY = contentY + contentSize / 2;
        ctx.translate(flipCenterX, flipCenterY);
        ctx.scale(
          state.transform.contentFlipHorizontal ? -1 : 1,
          state.transform.contentFlipVertical ? -1 : 1
        );
        ctx.translate(-flipCenterX, -flipCenterY);
      }

      // Calculate split
      const [leftRatio, rightRatio] = parseLayoutPreset(state.layoutPreset);
      
      // Adjust for fullBleed mode
      // If fullBleed is active, stretch both mosaic and video to canvas edges
      const mosaicX = state.fullBleed ? 0 : contentX;
      const mosaicMaxWidth = state.fullBleed ? (contentX + contentSize * leftRatio) : (contentSize * leftRatio);
      const leftWidth = mosaicMaxWidth;
      
      // Calculate video width - if fullBleed, stretch to right edge
      const videoEndX = state.fullBleed ? canvasSize.width : (contentX + contentSize);
      const rightWidth = videoEndX - (mosaicX + leftWidth);

      // Draw images on the left
      if (state.imageCount > 0) {
        const imageHeight = contentSize / state.imageCount;
        
        for (let index = 0; index < state.imageCount; index++) {
        const image = state.images[index];
        const imgY = contentY + index * imageHeight;
        
        if (image && image.blob) {
          try {
            const img = await loadImage(image.blob);
            ctx.save();
            ctx.beginPath();
            ctx.rect(mosaicX, imgY, leftWidth, imageHeight);
            ctx.clip();
            
            const scale = image.scale || 1;
            const posX = image.position?.x || 0;
            const posY = image.position?.y || 0;
            
            const imgAspect = img.width / img.height;
            const frameAspect = leftWidth / imageHeight;
            
            let drawWidth, drawHeight, drawX, drawY;
            
            if (imgAspect > frameAspect) {
              drawHeight = imageHeight * scale;
              drawWidth = drawHeight * imgAspect;
            } else {
              drawWidth = leftWidth * scale;
              drawHeight = drawWidth / imgAspect;
            }
            
            drawX = mosaicX + (leftWidth - drawWidth) / 2 + posX;
            drawY = imgY + (imageHeight - drawHeight) / 2 + posY;
            
            ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
            ctx.restore();
          } catch (e) {
            console.error('Failed to load image:', e);
            ctx.fillStyle = '#f3f4f6';
            ctx.fillRect(mosaicX, imgY, leftWidth, imageHeight);
          }
        } else {
          ctx.fillStyle = '#f3f4f6';
          ctx.fillRect(mosaicX, imgY, leftWidth, imageHeight);
        }

        // Horizontal borders between images
        if (state.borders.enabled && index < state.imageCount - 1) {
          ctx.save();
          ctx.strokeStyle = state.borders.color;
          ctx.globalAlpha = state.borders.opacity;
          ctx.lineWidth = state.borders.thickness;
          ctx.beginPath();
          ctx.moveTo(mosaicX, imgY + imageHeight);
          ctx.lineTo(mosaicX + leftWidth, imgY + imageHeight);
          ctx.stroke();
          ctx.restore();
        }
        }
      }

      // Vertical border between left and right
      if (state.borders.enabled) {
        ctx.save();
        ctx.strokeStyle = state.borders.color;
        ctx.globalAlpha = state.borders.opacity;
        ctx.lineWidth = state.borders.thickness;
        ctx.beginPath();
        ctx.moveTo(mosaicX + leftWidth, contentY);
        ctx.lineTo(mosaicX + leftWidth, contentY + contentSize);
        ctx.stroke();
        ctx.restore();
      }

      // Draw video area on the right
      const videoX = mosaicX + leftWidth;
      
      if (state.chromaKey) {
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(videoX, contentY, rightWidth, contentSize);
      } else if (videoElement && state.video.blob) {
        try {
          ctx.save();
          ctx.beginPath();
          ctx.rect(videoX, contentY, rightWidth, contentSize);
          ctx.clip();
          ctx.drawImage(videoElement, videoX, contentY, rightWidth, contentSize);
          ctx.restore();
        } catch (e) {
          console.error('Failed to draw video:', e);
          ctx.fillStyle = '#f3f4f6';
          ctx.fillRect(videoX, contentY, rightWidth, contentSize);
        }
      } else {
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(videoX, contentY, rightWidth, contentSize);
      }

      // Video overlay text (scaled)
      if (state.video.overlay.enabled && state.video.overlay.text) {
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3 * scaleFactor;
        ctx.font = `bold ${28 * scaleFactor}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const textY = contentY + contentSize - 40 * scaleFactor;
        ctx.strokeText(state.video.overlay.text, videoX + rightWidth / 2, textY);
        ctx.fillText(state.video.overlay.text, videoX + rightWidth / 2, textY);
        ctx.restore();
      }
      
      // Restore content transformations
      ctx.restore();

      return canvas;
    },
    []
  );

  const exportPNG = useCallback(
    async (state: ProjectState, resolution: number): Promise<void> => {
      const canvas = await renderToCanvas(state, resolution);
      
      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob'));
            return;
          }

          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `rica-viral-${Date.now()}.png`;
          link.click();
          URL.revokeObjectURL(url);
          resolve();
        }, 'image/png');
      });
    },
    [renderToCanvas]
  );

  return {
    renderToCanvas,
    exportPNG,
  };
}
