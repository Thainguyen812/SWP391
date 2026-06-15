import React, { createContext, useState, useContext } from 'react';

const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [searchValue, setSearchValue] = useState("");
  const [activeLocation, setActiveLocation] = useState("toan-he-thong");

  return (
    <GlobalContext.Provider value={{ searchValue, setSearchValue, activeLocation, setActiveLocation }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);
