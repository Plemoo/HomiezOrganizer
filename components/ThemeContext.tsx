import { ITheme, IThemeContextType } from '@/assets/interfaces/LightThemeInterface';
import { lightTheme } from '@/assets/ts/lightThemeProperties';
// import { lightTheme } from '@/assets/ts/lightThemeProperties';

import { darkTheme } from '@/assets/ts/darkThemeProperties';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { View } from 'react-native';
import { useUser } from './ProfileInformationContext';


const ThemeContext = createContext<IThemeContextType | undefined>(undefined);

// Create a Theme Provider component
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ITheme>(lightTheme); // Default theme
  const { user, userLoading } = useUser();
  useEffect(()=>{
    if(user && !userLoading) {
      if(user.appearance === "dark") {
        setTheme(darkTheme)
      }else{
        setTheme(lightTheme);
      }
    }
  },[user, userLoading])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <View style={{ flex: 1, backgroundColor: "white" }}>
        {children}
      </View>
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
