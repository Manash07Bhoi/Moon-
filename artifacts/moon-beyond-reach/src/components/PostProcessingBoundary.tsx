import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  failed: boolean;
}

/**
 * Error boundary specifically for the PostProcessing effect stack.
 *
 * @react-three/postprocessing can fail on mobile browsers or low-end GPUs
 * (missing WebGL extensions, driver bugs, unsupported render targets).
 * When it crashes this boundary catches the error and renders null — the 3D
 * scene continues rendering normally, just without post-process effects.
 * This is far better than the entire Canvas going black.
 */
export class PostProcessingBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    console.warn('[Moon Beyond Reach] PostProcessing failed, rendering without effects:', error.message);
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}
