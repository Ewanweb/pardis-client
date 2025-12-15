import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { HelmetProvider } from "react-helmet-async";

const helmetContext = {};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <HelmetProvider context={helmetContext}>
        <App />
      </HelmetProvider>
    </ErrorBoundary>
  </StrictMode>,
)
