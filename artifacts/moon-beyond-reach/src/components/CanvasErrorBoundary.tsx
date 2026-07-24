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
          <div className="text-center space-y-6 px-8">
            <p className="font-serif italic text-2xl md:text-3xl tracking-widest leading-relaxed">
              Dura Akasare<br />Janha Tie
            </p>
            <div className="w-px h-10 bg-gradient-to-b from-[#DDD9E0] to-transparent opacity-40 mx-auto" />
            <p className="font-mono text-[10px] tracking-[0.3em] uppercase opacity-50">
              3D rendering unavailable in this environment
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
