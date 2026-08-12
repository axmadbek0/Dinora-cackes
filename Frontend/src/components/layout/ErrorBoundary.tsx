import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

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
    console.error('Uncaught Error Boundary Exception:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-6 bg-white rounded-3xl border border-dinora-border shadow-dinora my-8 max-w-lg mx-auto text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-dinora-pink-light flex items-center justify-center text-dinora-pink mx-auto shadow-md">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-serif text-dinora-chocolate">
              Nimadir xato ketdi
            </h3>
            <p className="text-xs text-dinora-gray mt-1 max-w-sm mx-auto">
              Interfeysda kutilmagan xatolik yuz berdi. Iltimos sahifani qayta yuklab ko'ring.
            </p>
          </div>

          <button
            onClick={this.handleReset}
            className="inline-flex items-center space-x-2 bg-dinora-chocolate text-white px-5 py-2.5 rounded-2xl text-xs font-bold shadow-md hover:bg-dinora-chocolate-light transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Sahifani Qayta Yuklash</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
