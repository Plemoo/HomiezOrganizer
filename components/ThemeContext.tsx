import { ITheme, IThemeContextType } from '@/assets/interfaces/LightThemeInterface';
import { lightTheme } from '@/assets/ts/lightThemeProperties';
import React, { createContext, ReactNode, useContext, useState } from 'react';


const ThemeContext = createContext<IThemeContextType | undefined>(undefined);

// Create a Theme Provider component
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ITheme>(lightTheme); // Default theme


  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Create a custom hook to use the Theme Context
export const useCustomTheme = (): IThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
