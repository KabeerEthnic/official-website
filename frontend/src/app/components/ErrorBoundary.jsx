import { Component } from 'react';

/**
 * Stops one broken section from taking the whole storefront down. Wrapped
 * around each route and around individual homepage sections, so a failure is
 * contained to the piece that failed.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) console.error('Render error:', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback !== undefined) return this.props.fallback;

    return (
      <div className="px-6 py-20 text-center">
        <p className="text-white/70 font-serif italic text-lg mb-4">
          This section could not be displayed.
        </p>
        <button
          type="button"
          onClick={() => this.setState({ hasError: false })}
          className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
