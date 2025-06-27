import React, { createContext, useContext, useState } from 'react';

const TitleContext = createContext();

export const useTitle = () => useContext(TitleContext);

export const TitleProvider = ({ children }) => {
  const [title, setTitle] = useState('');
  const [backButton, setBackButton] = useState(null);
  return (
    <TitleContext.Provider value={{ title, setTitle, backButton, setBackButton }}>
      {children}
    </TitleContext.Provider>
  );
}; 