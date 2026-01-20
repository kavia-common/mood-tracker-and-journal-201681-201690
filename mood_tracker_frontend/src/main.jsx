import React from 'react'
import ReactDOM from 'react-dom'
import App from './App.jsx'
import './style.css'

// PUBLIC_INTERFACE
function renderApp() {
  /** Mounts the React application into the Vite HTML shell. */
  const el = document.getElementById('app')
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    el
  )
}

renderApp()
