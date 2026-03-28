/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./index.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}",
    "./constants/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./context/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      zIndex: {
        'negative': '-1',
        'base': '0',
        'elevated': '10',   // Kartlar, küçük widgetlar
        'sticky': '40',     // Yapışkan filtreler, alt barlar
        'header': '50',     // Ana navigasyon
        'overlay': '60',    // Backdrop, mobil menü arka planı
        'modal': '70',      // Ana modallar (Profil, Oyun)
        'popover': '80',    // Dropdownlar, Select menüleri
        'toast': '100',     // Bildirimler (En üstte olmalı)
        'max': '9999',      // Kritik hata katmanları
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        vista: {
          dark: '#000000',
          light: '#F5F5F5',
        }
      },
      keyframes: {
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        toastIn: {
          '0%': { transform: 'translateY(100%) scale(0.9)', opacity: '0' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        marqueeVertical: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-50%)' },
        },
        marqueeVerticalReverse: {
          '0%': { transform: 'translateY(-50%)' },
          '100%': { transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        }
      },
      animation: {
        'slide-in-right': 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-up': 'slideInUp 0.4s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'toast-in': 'toastIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'shimmer': 'shimmer 2s infinite linear',
        'marquee-vertical': 'marqueeVertical 60s linear infinite',
        'marquee-vertical-reverse': 'marqueeVerticalReverse 60s linear infinite',
        'scale-in': 'scaleIn 0.2s ease-out forwards',
      }
    }
  },
  plugins: [],
}
