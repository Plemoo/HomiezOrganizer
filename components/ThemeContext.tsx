import React, { createContext, ReactNode, useContext, useState } from 'react';

// Define the shape of your theme
interface Theme {
  background: string;
  text: string;
  primary: string;
}

// Define the shape of the context
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

// Create the Theme Context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Define your themes
const lightTheme: Theme = {
  background: '#ffffff',
  text: 'red',
  primary: '#6200ee',
};

const darkTheme: Theme = {
  background: '#000000',
  text: '#ffffff',
  primary: '#bb86fc',
};

// Create a Theme Provider component
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(lightTheme); // Default theme

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === lightTheme ? darkTheme : lightTheme));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Create a custom hook to use the Theme Context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
