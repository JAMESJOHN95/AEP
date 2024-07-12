import { createContext,useContext, useState } from "react";

const keyContext= createContext();

export const useKey = ()=>{
    return useContext(keyContext);
};

export const keysProvider = ({children})=>{
    const [keysArray,setKeysArray]=useState([]);

    return (
        <keyContext.Provider value={{ keysArray, setKeysArray }}>
          {children}
        </keyContext.Provider>
      );
};