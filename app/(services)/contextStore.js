"use client"

import { createContext, useContext, useState } from "react"

export const AppContext=createContext();
export const AppContextProvider=({children})=>{
    const [storedValue,setStoredvalue]=useState();
return <AppContext.Provider value={[storedValue, setStoredvalue]}>{children}</AppContext.Provider>
}

export const useAppContext=()=>{
    return useContext(AppContext)
}