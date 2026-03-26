
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children?: ReactNode;
  fallback?: ReactNode;
  fullHeight?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false
  };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  handleRetry = () => {
    // Sadece state'i sıfırla, React yeniden render etmeyi dener
    this.setState({ hasError: false, error: undefined });
  };

  handleHardReload = () => {
      // Önbellek temizleyip tam yenileme
      window.sessionStorage.clear();
      window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // ChunkLoadError kontrolü (Versiyon güncellemesi sonrası sık olur)
      const isChunkError = this.state.error?.name === 'ChunkLoadError' || 
                           this.state.error?.message?.includes('Loading chunk');

      return (
        <div className={`flex flex-col items-center justify-center p-8 text-center bg-neutral-50 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 rounded-[2rem] shadow-xl ${this.props.fullHeight ? 'min-h-[80vh]' : 'min-h-[300px]'}`}>
          
          <div className="relative mb-6">
              <div className="absolute inset-0 bg-red-500 blur-2xl opacity-20 rounded-full"></div>
              <div className="w-16 h-16 bg-red-50 dark:bg-red-900/10 text-red-500 rounded-2xl flex items-center justify-center border border-red-100 dark:border-red-900/30 relative z-10">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
          </div>

          <h3 className="text-xl font-black text-neutral-900 dark:text-white mb-2 tracking-tight">
              {isChunkError ? 'Yeni Bir Versiyon Var!' : 'Beklenmedik Bir Hata'}
          </h3>
          
          <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-xs mx-auto mb-8 leading-relaxed">
            {isChunkError 
                ? 'Uygulama güncellendi. En son özellikleri görmek için sayfayı yenilemeniz gerekiyor.' 
                : 'Merak etmeyin, bu bazen olur. Sayfayı yenilemek genellikle sorunu çözer.'}
          </p>
          
          <div className="flex gap-3">
              <button 
                onClick={this.handleRetry}
                className="px-6 py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-white rounded-xl text-sm font-bold hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              >
                Tekrar Dene
              </button>
              
              <button 
                onClick={this.handleHardReload}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
              >
                {isChunkError ? 'Uygulamayı Güncelle' : 'Önbelleği Temizle'}
              </button>
          </div>

          {/* Developer Details (Hidden in Prod usually but good for debugging now) */}
          {this.state.error && !isChunkError && (
              <details className="mt-8 text-left w-full max-w-md">
                  <summary className="text-[10px] text-neutral-400 cursor-pointer hover:text-neutral-600 dark:hover:text-neutral-300 text-center uppercase tracking-widest font-bold">
                      Teknik Detaylar
                  </summary>
                  <div className="mt-2 p-3 bg-neutral-100 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-auto max-h-32">
                      <p className="text-[10px] font-mono text-red-600 dark:text-red-400">
                          {this.state.error.toString()}
                      </p>
                  </div>
              </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
