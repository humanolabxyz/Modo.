import {Component, type ReactNode} from 'react';

/** Si una vista, un panel o el escenario fallan al dibujarse, el resto de la aplicación sigue viva y el proyecto no se toca. */
export class ErrorBoundary extends Component<{label: string; resetKey?: string; onRetry?: () => void; children: ReactNode}, {error: Error | null}> {
  state = {error: null as Error | null};
  static getDerivedStateFromError(error: Error) { return {error}; }
  componentDidCatch(error: Error) { console.error(`[Industria] «${this.props.label}» falló:`, error); }
  componentDidUpdate(prev: {resetKey?: string}) { if (this.state.error && prev.resetKey !== this.props.resetKey) this.setState({error: null}); }
  render() {
    if (!this.state.error) return this.props.children;
    return <div className="ind-crash" role="alert"><strong>«{this.props.label}» tuvo un problema</strong>
      <p>El proyecto no se modificó. Puedes reintentar o exportarlo desde el menú del proyecto para no perder nada.</p>
      <button type="button" onClick={() => { this.props.onRetry?.(); this.setState({error: null}); }}>Reintentar</button></div>;
  }
}
