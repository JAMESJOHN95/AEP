import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './bootstrap.min.css'
import { keysProvider } from './Componants/Context.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(

    <React.StrictMode> 
      <App />
     </React.StrictMode> 

)
