
import React, { useEffect } from 'react';
import { renderDistortedImage } from '../utils/frameFocusUtils';
import { Movie } from '../types';

export const useFrameFocusRenderer = (
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    containerRef: React.RefObject<HTMLDivElement | null>,
    currentMovie: Movie | null,
    preloadedImages: Map<number, HTMLImageElement>,
    distortionLevel: number
) => {
    useEffect(() => {
        const render = () => {
            const canvas = canvasRef.current;
            const container = containerRef.current;
            
            if (canvas && container && currentMovie) {
                const ctx = canvas.getContext('2d');
                const imgObj = preloadedImages.get(currentMovie.id);

                if (ctx && imgObj) {
                    // Yüksek DPI ekranlar için ölçekleme
                    const dpr = window.devicePixelRatio || 1;
                    const rect = container.getBoundingClientRect();
                    
                    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
                        canvas.width = rect.width * dpr;
                        canvas.height = rect.height * dpr;
                    }
                    
                    ctx.setTransform(1, 0, 0, 1, 0, 0);
                    ctx.scale(dpr, dpr);

                    // Bulanıklaştırma/Bozma efektini uygula
                    renderDistortedImage(
                        ctx,
                        imgObj,
                        rect.width,
                        rect.height,
                        'BLUR',
                        distortionLevel
                    );
                }
            }
        };

        let animationId: number;
        const loop = () => {
            render();
            animationId = requestAnimationFrame(loop);
        };
        loop();

        return () => cancelAnimationFrame(animationId);
    }, [currentMovie, distortionLevel, preloadedImages, canvasRef, containerRef]);
};
