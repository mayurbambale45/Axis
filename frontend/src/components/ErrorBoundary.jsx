import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'system-ui' }}>
          <h2>Oops, something went wrong.</h2>
          <p>The application encountered an unexpected error. Please refresh the page.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{ 
              padding: '8px 16px', background: '#3b82f6', color: 'white', 
              border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '1rem' 
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
