import { useProject } from '@/contexts/ProjectContext';
import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

function parseAspectRatio(ratio: string): [number, number] {
  const [w, h] = ratio.split(':').map(Number);
  return [w, h];
}

function parseLayoutPreset(preset: string): [number, number] {
  const [left, right] = preset.split('/').map(Number);
  return [left / 100, right / 100];
}

export default function Preview() {
  const { state } = useProject();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 1000 });

  useEffect(() => {
    const [w, h] = parseAspectRatio(state.aspectRatio);
    const maxWidth = 500;
    const maxHeight = 650;

    let width = maxWidth;
    let height = (maxWidth * h) / w;

    if (height > maxHeight) {
      height = maxHeight;
      width = (maxHeight * w) / h;
    }

    setCanvasSize({ width: Math.round(width), height: Math.round(height) });
  }, [state.aspectRatio]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas resolution (2x for high DPI) and reset transform
    canvas.width = canvasSize.width * 2;
    canvas.height = canvasSize.height * 2;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(2, 2);

    let cancelled = false;

    // Helper to load image
    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    };

    // Async render function
    const render = async () => {
      if (cancelled) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

      // Draw background
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
      
      // Calculate actual header height
      const profileSize = state.typography.profileSize;
      const postTextSpacing = state.typography.postTextSpacing;
      const contentSpacing = state.typography.contentSpacing;
      
      // Estimate post text height (rough calculation)
      const estimatedPostTextLines = state.profile.postText ? Math.ceil(state.profile.postText.length / 50) : 0;
      const postTextHeight = estimatedPostTextLines * 20;
      
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
      
      // Apply GLOBAL header transformations BEFORE drawing anything
      ctx.save();
      
      // Apply header offset
      ctx.translate(state.transform.headerOffsetX, state.transform.headerOffsetY);
      
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
      
      // Apply offsets ONLY to the photo position
      const profileX = baseProfileX + state.typography.profileOffsetX;
      const profileY = baseProfileY + state.typography.profileOffsetY;
      
      if (state.profile.image) {
        try {
          const profileImg = await loadImage(state.profile.image);
          if (cancelled) return;
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
      } else {
        // Draw placeholder circle
        ctx.save();
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(profileX + profileSize / 2, profileY + profileSize / 2, profileSize / 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw icon/text
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.font = `${profileSize / 3}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('📷', profileX + profileSize / 2, profileY + profileSize / 2);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.restore();
      }

      // Text starts to the right of BASE profile position (not affected by offsets)
      const textStartX = baseProfileX + profileSize + 12;
      
      // LINE 1: Name + Verified Badge (with individual offsets)
      const nameX = textStartX + state.typography.nameOffsetX;
      const nameY = baseProfileY + 16 + state.typography.nameOffsetY;
      
      ctx.font = `bold ${state.typography.nameSize}px Inter, sans-serif`;
      const nameText = state.profile.name || 'Seu Nome';
      ctx.fillStyle = state.profile.name ? state.typography.nameColor : 'rgba(0,0,0,0.3)';
      ctx.fillText(nameText, nameX, nameY);

      // Verified badge right after name (with more spacing)
      if (state.profile.showVerifiedBadge && state.profile.name) {
        const nameWidth = ctx.measureText(nameText).width;
        const badgeSize = state.typography.verifiedBadgeSize || 16;
        const badgeX = nameX + nameWidth + state.typography.verifiedBadgeOffsetX;
        const badgeY = nameY - badgeSize + state.typography.verifiedBadgeOffsetY;
        try {
          const badgeImg = await loadImage('/verified-badge.png');
          if (cancelled) return;
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

      // LINE 2: Username (with individual offsets)
      const usernameX = textStartX + state.typography.usernameOffsetX;
      const usernameY = nameY + state.typography.nameUsernameSpacing + state.typography.usernameOffsetY;
      
      const usernameText = state.profile.username || 'seuusername';
      ctx.fillStyle = state.profile.username ? state.typography.usernameColor : 'rgba(102,102,102,0.5)';
      ctx.font = `${state.typography.usernameSize}px Inter, sans-serif`;
      ctx.fillText(`@${usernameText}`, usernameX, usernameY);

      // LINE 3+: Post Text (BELOW BASE profile position, starts at contentX)
      // Position post text below the BASE profile image (with dynamic spacing)
      const postTextY = baseProfileY + profileSize + state.typography.postTextSpacing;
      
      const postTextContent = state.profile.postText || 'Escreva o texto do seu post aqui... Ele aparecerá nesta área e pode ter várias linhas!';
      ctx.fillStyle = state.profile.postText ? state.typography.postTextColor : 'rgba(0,0,0,0.25)';
      ctx.font = `${state.typography.postTextSize}px Inter, sans-serif`;
      

      
      const words = postTextContent.split(' ');
        let line = '';
        let y = postTextY;
        const maxWidth = canvasSize.width - contentX * 2;

        words.forEach((word) => {
          const testLine = line + word + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && line !== '') {
            ctx.fillText(line, contentX, y);
            line = word + ' ';
            y += 20;
          } else {
            line = testLine;
          }
        });
      if (line.trim()) {
          ctx.fillText(line, contentX, y);
      }

      // Restore header transformations (AFTER drawing everything in the header)
      ctx.restore();
      


      // Draw content area border (for visualization)
      // ctx.strokeStyle = '#e5e7eb';
      // ctx.lineWidth = 1;
      // ctx.strokeRect(contentX, contentY, contentSize, contentSize);

      // Apply GLOBAL content transformations
      ctx.save();
      
      // Apply content offset
      ctx.translate(state.transform.contentOffsetX, state.transform.contentOffsetY);
      
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
      
      // When there are no images (imageCount === 0), video takes full width
      const hasImages = state.imageCount > 0;
      
      // Adjust for fullBleed mode
      // If fullBleed is active, stretch both mosaic and video to canvas edges
      const mosaicX = state.fullBleed ? 0 : contentX;
      const mosaicMaxWidth = hasImages 
        ? (state.fullBleed ? (contentX + contentSize * leftRatio) : (contentSize * leftRatio))
        : 0;
      const leftWidth = mosaicMaxWidth;
      
      // Calculate video width - if fullBleed, stretch to right edge
      // If no images, video takes the full content width
      const videoEndX = state.fullBleed ? canvasSize.width : (contentX + contentSize);
      const rightWidth = hasImages ? (videoEndX - (mosaicX + leftWidth)) : (videoEndX - (state.fullBleed ? 0 : contentX));

      // Draw images on the left
      if (hasImages && state.imageCount > 0) {
        const imageHeight = contentSize / state.imageCount;
        for (let index = 0; index < state.images.length; index++) {
        const image = state.images[index];
        const imgY = contentY + index * imageHeight;

        if (image.blob) {
          try {
            const img = await loadImage(image.blob);
            if (cancelled) return;
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
            ctx.fillStyle = '#f3f4f6';
            ctx.fillRect(mosaicX, imgY, leftWidth, imageHeight);
          }
        } else {
          // Draw placeholder with dashed border and label
          ctx.fillStyle = '#f3f4f6';
          ctx.fillRect(mosaicX, imgY, leftWidth, imageHeight);
          
          // Dashed border
          ctx.save();
          ctx.strokeStyle = 'rgba(0,0,0,0.2)';
          ctx.lineWidth = 2;
          ctx.setLineDash([8, 8]);
          ctx.strokeRect(mosaicX + 4, imgY + 4, leftWidth - 8, imageHeight - 8);
          ctx.setLineDash([]);
          
          // Label
          ctx.fillStyle = 'rgba(0,0,0,0.3)';
          ctx.font = 'bold 24px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`FOTO ${index + 1}`, mosaicX + leftWidth / 2, imgY + imageHeight / 2 - 15);
          
          // Icon
          ctx.font = '48px Inter, sans-serif';
          ctx.fillText('🖼️', mosaicX + leftWidth / 2, imgY + imageHeight / 2 + 25);
          
          ctx.textAlign = 'left';
          ctx.textBaseline = 'alphabetic';
          ctx.restore();
        }

        // Draw borders
        if (state.borders.enabled && index < state.imageCount - 1) {
          ctx.strokeStyle = state.borders.color;
          ctx.globalAlpha = state.borders.opacity;
          ctx.globalAlpha = state.borders.opacity;
          ctx.beginPath();
          ctx.moveTo(mosaicX, imgY + imageHeight);
          ctx.lineTo(mosaicX + leftWidth, imgY + imageHeight);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
        }
      }

      // Draw vertical border between images and video (only if there are images)
      if (state.borders.enabled && hasImages) {
        ctx.strokeStyle = state.borders.color;
        ctx.globalAlpha = state.borders.opacity;
        ctx.lineWidth = state.borders.thickness;
        ctx.beginPath();
        ctx.moveTo(mosaicX + leftWidth, contentY);
        ctx.lineTo(mosaicX + leftWidth, contentY + contentSize);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // Draw video area on the right (or full width if no images)
      const videoX = hasImages ? (mosaicX + leftWidth) : (state.fullBleed ? 0 : contentX);
      if (state.chromaKey) {
        // Chroma key green background
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(videoX, contentY, rightWidth, contentSize);
      } else if (state.video.blob && videoRef.current && videoRef.current.readyState >= 2) {
        ctx.save();
        // Draw video to fill the area
        const video = videoRef.current;
        const scale = Math.max(rightWidth / video.videoWidth, contentSize / video.videoHeight);
        const scaledWidth = video.videoWidth * scale;
        const scaledHeight = video.videoHeight * scale;
        const offsetX = videoX + (rightWidth - scaledWidth) / 2;
        const offsetY = contentY + (contentSize - scaledHeight) / 2;
        ctx.drawImage(video, offsetX, offsetY, scaledWidth, scaledHeight);
        ctx.restore();
      } else {
        // Draw placeholder with dashed border and label
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(videoX, contentY, rightWidth, contentSize);
        
        // Dashed border
        ctx.save();
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 8]);
        ctx.strokeRect(videoX + 4, contentY + 4, rightWidth - 8, contentSize - 8);
        ctx.setLineDash([]);
        
        // Label
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.font = 'bold 28px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('VÍDEO', videoX + rightWidth / 2, contentY + contentSize / 2 - 20);
        
        // Icon
        ctx.font = '56px Inter, sans-serif';
        ctx.fillText('🎥', videoX + rightWidth / 2, contentY + contentSize / 2 + 30);
        
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.restore();
      }

      // Draw video overlay text
      if (state.video.overlay.enabled && state.video.overlay.text) {
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.font = 'bold 28px Inter, sans-serif';
        ctx.textAlign = 'center';
        const overlayY = contentY + contentSize - 40;
        ctx.strokeText(state.video.overlay.text, videoX + rightWidth / 2, overlayY);
        ctx.fillText(state.video.overlay.text, videoX + rightWidth / 2, overlayY);
        ctx.restore();
      }
      
      // Restore content transformations
      ctx.restore();
    };

    render();

    return () => {
      cancelled = true;
    };
  }, [state, canvasSize]);

  // Video playback and continuous render
  useEffect(() => {
    if (videoRef.current && state.video.blob) {
      videoRef.current.src = state.video.blob;
      videoRef.current.muted = state.video.muted;
      videoRef.current.play().catch(() => {});

      // Continuously update canvas when video is playing
      let animationId: number;
      const updateCanvas = () => {
        animationId = requestAnimationFrame(updateCanvas);
      };
      
      if (state.video.blob) {
        updateCanvas();
      }

      return () => {
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
      };
    }
  }, [state.video.blob, state.video.muted]);

  return (
    <div className="sticky top-4">
      <Card className="p-6 bg-slate-900 border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-100">Preview em Tempo Real</h3>
          <span className="text-xs text-slate-400">{state.aspectRatio}</span>
        </div>
        <div className="flex justify-center bg-slate-950/50 rounded-lg p-6 relative">
          <div 
            className="relative"
            style={{
              border: '2px dashed rgba(148, 163, 184, 0.3)',
              borderRadius: '8px',
              padding: '16px',
              background: 'rgba(0,0,0,0.2)'
            }}
          >
            <canvas
              ref={canvasRef}
              style={{
                width: '100%',
                height: 'auto',
                maxWidth: canvasSize.width,
                aspectRatio: `${canvasSize.width} / ${canvasSize.height}`,
              }}
              className="rounded shadow-2xl"
            />
            {/* Dimension labels */}
            <div className="absolute -top-8 left-0 right-0 text-center text-xs text-slate-500 font-mono">
              ↔ {canvasSize.width}px
            </div>
            <div className="absolute -left-12 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-mono">
              <span className="inline-block transform -rotate-90 whitespace-nowrap">
                ↕ {canvasSize.height}px
              </span>
            </div>
          </div>
        </div>
        <div className="text-xs text-slate-500 mt-3 text-center">
          🔒 Processado 100% localmente. Seus dados nunca saem do dispositivo.
        </div>
        {state.video.blob && (
          <video
            ref={videoRef}
            className="hidden"
            loop
            playsInline
          />
        )}
      </Card>
    </div>
  );
}
