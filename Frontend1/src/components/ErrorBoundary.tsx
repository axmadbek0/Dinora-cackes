import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('DINORA Storefront Uncaught Error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF6F0] flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#2B1810]/10 shadow-xl max-w-md w-full space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#F8E7EA] flex items-center justify-center text-[#D65B78] mx-auto shadow-sm">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <span className="font-serif text-2xl font-bold tracking-tight text-[#2B1810]">
                  DINORA
                </span>
                <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#F8E7EA] text-[#D65B78] font-bold">
                  Pastry & Art
                </span>
              </div>
              <h2 className="text-xl font-serif font-bold text-[#2B1810]">
                Nimadir xato ketdi
              </h2>
              <p className="text-xs text-[#6B5B52] leading-relaxed">
                Tizimda kutilmagan xatolik yuz berdi. Iltimos sahifani qayta yuklab ko'ring.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-[#FAF6F0] rounded-2xl text-[11px] font-mono text-[#2B1810]/70 text-left overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full inline-flex items-center justify-center space-x-2 bg-[#2B1810] hover:bg-[#3D2318] text-[#FAF6F0] px-6 py-3 rounded-2xl text-xs font-bold shadow-md active:scale-95 transition-all"
            >
              <RefreshCw className="w-4 h-4 text-[#D65B78]" />
              <span>Sahifani Qayta Yuklash</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
