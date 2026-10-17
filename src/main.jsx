import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource/dm-sans/latin-400.css'
import '@fontsource/dm-sans/latin-500.css'
import '@fontsource/dm-sans/latin-600.css'
import '@fontsource/instrument-serif/latin-400.css'
import '@fontsource/instrument-serif/latin-400-italic.css'
import App from './App.jsx'
import './index.css'
import './lib/analytics.js'

const root = document.getElementById('root')
const app = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
if (root.hasAttribute('data-prerendered')) ReactDOM.hydrateRoot(root, app)
else ReactDOM.createRoot(root).render(app)
