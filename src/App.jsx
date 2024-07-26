import { useState } from 'react'
import './App.css'
import Audience from './Componants/Audience'
import Home from './Componants/Home'
import Profile from './Componants/Profile'
import Query from './Componants/Query'

function App() {

  const [token, setToken] = useState('')                      // Store Token
  const [clpId, setClpId] = useState("")                      // CLPID


  // const [keysArray,setKeysArray] = useState([]);

  return (
    <>
    <Home token={token}   setToken={setToken} clpId={clpId} setClpId={setClpId}/>
    <Query token={token} clpId={clpId}/>
    <Audience/>
    </>
  )
}

export default App
