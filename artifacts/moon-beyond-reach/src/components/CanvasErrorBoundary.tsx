import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Catches WebGL context creation failures and other Canvas-level errors,
 * displaying a graceful fallback instead of a white crash screen.
 */
export class CanvasErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[Moon Beyond Reach] Canvas error:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-[#05060A] text-[#DDD9E0]">
          <div className="text-center space-y-4 opacity-40">
            <p className="font-serif italic text-2xl tracking-widest">
              Dura Akasare Janha Tie
            </p>
            <p className="font-mono text-[10px] tracking-[0.3em] uppercase">
              WebGL unavailable in this environment
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
