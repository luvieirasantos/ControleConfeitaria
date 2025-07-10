import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ProdutosProvider } from './context/ProdutosContext'
import { EncomendasProvider } from './context/EncomendasContext'
import { GastosProvider } from './context/GastosContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ProdutosProvider>
      <EncomendasProvider>
        <GastosProvider>
          <App />
        </GastosProvider>
      </EncomendasProvider>
    </ProdutosProvider>
  </React.StrictMode>
)
