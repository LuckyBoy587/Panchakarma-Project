import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { StatusBar, Style } from '@capacitor/status-bar';

const setStatusBar = async () => {
  // Make the status bar visible
  await StatusBar.show();

  // Set the style to dark or light depending on your theme
  await StatusBar.setStyle({ style: Style.Dark });

  // Avoid overlay (so content doesn’t collide)
  await StatusBar.setOverlaysWebView({ overlay: false });
};

setStatusBar();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
