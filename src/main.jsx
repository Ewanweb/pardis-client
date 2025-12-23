import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { HelmetProvider } from "react-helmet-async";

const helmetContext = {};

const AppWrapper = () => (
  <ErrorBoundary>
    <HelmetProvider context={helmetContext}>
      <App />
    </HelmetProvider>
  </ErrorBoundary>
);

createRoot(document.getElementById('root')).render(
  // StrictMode فقط در production برای جلوگیری از درخواست‌های تکراری در development
  import.meta.env.PROD ? (
    <StrictMode>
      <AppWrapper />
    </StrictMode>
  ) : (
    <AppWrapper />
  )
)
