window.onerror = function(msg, url, lineNo, columnNo, error) {
  document.body.innerHTML = '<div style="color:red;padding:20px;z-index:999999;position:absolute;background:white;top:0;left:0;width:100vw;height:100vh;overflow:auto;">' + 
    '<h1>Global Error</h1><pre>' + msg + '\\n' + (error && error.stack) + '</pre></div>';
};
window.onunhandledrejection = function(event) {
  document.body.innerHTML = '<div style="color:red;padding:20px;z-index:999999;position:absolute;background:white;top:0;left:0;width:100vw;height:100vh;overflow:auto;">' + 
    '<h1>Promise Rejection</h1><pre>' + event.reason + '</pre></div>';
};

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
