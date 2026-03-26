
// --- SES YÖNETİCİSİ (WEB AUDIO API) ---
// Harici ses dosyası bağımlılığı olmadan, tarayıcı içinde matematiksel ses dalgaları (sinüs, kare vb.) üretir.
// Bu yöntem "dosya bulunamadı" veya "format desteklenmiyor" hatalarını ortadan kaldırır ve performanslıdır.

let audioCtx: AudioContext | null = null;
let isMuted = false;

// AudioContext'i başlatır veya mevcut olanı döndürür (Singleton)
const initAudio = () => {
    if (!audioCtx) {
        // Tarayıcı uyumluluğu için kontrol
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
            audioCtx = new AudioContextClass();
        }
    }
    // Chrome gibi tarayıcılarda context 'suspended' başlayabilir, kullanıcı etkileşimiyle uyandırılmalı
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
    }
    return audioCtx;
};

// Belirli bir frekansta ve sürede ses tonu çalar
const playTone = (
    freq: number, 
    type: OscillatorType, 
    duration: number, 
    startTime: number = 0, 
    vol: number = 0.1
) => {
    const ctx = initAudio();
    if (!ctx || isMuted) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

    // Ses seviyesini ayarla
    gain.gain.setValueAtTime(vol, ctx.currentTime + startTime);
    // Sesin sonunda "çıt" etmemesi için yumuşak bitiş (fade out) uygula
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + startTime);
    osc.stop(ctx.currentTime + startTime + duration);
};

export const SoundManager = {
    preload: () => {
        // Web Audio API için dosya indirmeye gerek yok, sadece context'i hazırlıyoruz.
        initAudio();
    },
    
    play: (type: 'CORRECT' | 'WRONG' | 'TICK' | 'WIN' | 'GAMEOVER', volume: number = 0.5) => {
        if (isMuted) return;
        
        // Context'in hazır olduğundan emin ol
        const ctx = initAudio();
        if(!ctx) return;

        switch (type) {
            case 'TICK':
                // Mekanik Slot Sesi: Çok kısa, yüksek perdede kare dalga (8bit hissi)
                playTone(800, 'square', 0.05, 0, volume * 0.05); 
                playTone(200, 'sawtooth', 0.05, 0, volume * 0.05); // Alt frekans tok ses
                break;
            
            case 'CORRECT':
                // Başarı: Ding! (İki aşamalı sinüs dalgası - C5 ve C6 notaları)
                playTone(523.25, 'sine', 0.1, 0, volume * 0.3); // C5
                playTone(1046.50, 'sine', 0.4, 0.05, volume * 0.3); // C6
                break;

            case 'WRONG':
                // Hata: Buzz! (Testere dişi dalga - düşük frekans)
                playTone(150, 'sawtooth', 0.15, 0, volume * 0.15);
                playTone(100, 'sawtooth', 0.15, 0.1, volume * 0.15);
                break;

            case 'WIN':
                // Kazanma: Fanfare (Major Arpej - C5, E5, G5, C6)
                playTone(523.25, 'triangle', 0.1, 0, volume * 0.2);    // C5
                playTone(659.25, 'triangle', 0.1, 0.1, volume * 0.2);  // E5
                playTone(783.99, 'triangle', 0.1, 0.2, volume * 0.2);  // G5
                playTone(1046.50, 'square', 0.6, 0.3, volume * 0.1);   // C6 (Ana vurgu)
                break;

            case 'GAMEOVER':
                // Kaybetme: Düşen tonlar
                playTone(400, 'sawtooth', 0.3, 0, volume * 0.1);
                playTone(380, 'sawtooth', 0.3, 0.2, volume * 0.1);
                playTone(360, 'sawtooth', 0.3, 0.4, volume * 0.1);
                playTone(340, 'sawtooth', 0.8, 0.6, volume * 0.1);
                break;
        }
    },
    
    toggleMute: () => {
        isMuted = !isMuted;
        return isMuted;
    },
    
    isMuted: () => isMuted
};

// --- GÖRÜNTÜ İŞLEME MOTORU (CANVAS) ---

/**
 * Resmi canvas üzerine, belirtilen efekt ve şiddetle çizer.
 * @param ctx Canvas Context
 * @param img Kaynak Resim
 * @param width Canvas Genişliği
 * @param height Canvas Yüksekliği
 * @param effectType Efekt Tipi (Şimdilik sadece 'BLUR')
 * @param severity Efekt Şiddeti (0-100)
 */
export const renderDistortedImage = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    width: number,
    height: number,
    effectType: 'BLUR', 
    severity: number 
) => {
    ctx.clearRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = true; // Blur kalitesi için smoothing açık olmalı

    // Efekt yoksa (Net görüntü)
    if (severity <= 0) {
        ctx.filter = 'none';
        drawImageProp(ctx, img, 0, 0, width, height);
        return;
    }

    // BULANIKLAŞTIRMA MANTIĞI
    // Zorluk seviyesini yumuşatmak için kuvvet fonksiyonu (Power curve) kullanılır.
    const blurAmount = Math.pow(severity / 100, 2.0) * 50; 
    
    // Bulanıkken şekillerin ve renklerin daha belirgin olması için kontrast ve satürasyon artırılır.
    ctx.filter = `blur(${blurAmount}px) contrast(1.3) saturate(1.4)`;
    
    // Bulanıklık kenarlarda beyazlık yapmasın diye hafifçe yakınlaştır (scale)
    const scale = 1.1; 
    ctx.save();
    ctx.translate(width/2, height/2);
    ctx.scale(scale, scale);
    ctx.translate(-width/2, -height/2);
    
    drawImageProp(ctx, img, 0, 0, width, height);
    
    ctx.restore();
    ctx.filter = 'none'; 
};

/**
 * Resmi aspect ratio (en-boy oranı) bozulmadan canvas'ı dolduracak şekilde çizer (Object-fit: Cover mantığı).
 */
function drawImageProp(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number, offsetX: number = 0.5, offsetY: number = 0.5) {
    if (arguments.length === 2) {
        x = y = 0;
        w = ctx.canvas.width;
        h = ctx.canvas.height;
    }

    const iw = img.width;
    const ih = img.height;
    const r = Math.min(w / iw, h / ih);
    
    let nw = iw * r;
    let nh = ih * r;
    let cx, cy, cw, ch, ar = 1;

    // Cover mantığı: Görüntü canvas'tan küçükse büyüt
    if (nw < w) ar = w / nw;
    if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;
    nw *= ar;
    nh *= ar;

    // Kesilecek alanı hesapla
    cw = iw / (nw / w);
    ch = ih / (nh / h);

    cx = (iw - cw) * offsetX;
    cy = (ih - ch) * offsetY;

    // Sınır kontrolleri
    if (cx < 0) cx = 0;
    if (cy < 0) cy = 0;
    if (cw > iw) cw = iw;
    if (ch > ih) ch = ih;

    ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
}

// --- OYUN MANTIĞI YARDIMCILARI ---

export const calculateScore = (
    distortionLevel: number, 
    timeLeft: number, 
    mode: 'TIMED' | 'ZEN'
) => {
    // Puanlama: Bulanıklık seviyesi (zorluk) * 10 + Kalan Süre * 10
    const blurScore = distortionLevel * 10;
    let timeScore = 0;
    if (mode === 'TIMED') {
        timeScore = timeLeft * 10;
    }
    return Math.floor(blurScore + timeScore);
};
