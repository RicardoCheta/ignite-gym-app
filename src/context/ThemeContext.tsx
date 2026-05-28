import React, { createContext, useContext, useState } from 'react';

type Theme = 'dark' | 'light';

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
  colors: typeof darkColors;
};

const darkColors = {
  primary: '#ff4d4d',
  background: '#111111',
  card: '#1a1a1a',
  border: '#2a2a2a',
  text: '#ffffff',
  textMuted: '#aaaaaa',
  surface: '#222222',
};

const lightColors = {
  primary: '#ff4d4d',
  background: '#f5f5f5',
  card: '#ffffff',
  border: '#e0e0e0',
  text: '#111111',
  textMuted: '#666666',
  surface: '#eeeeee',
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
  colors: darkColors,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('dark');
  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  const colors = theme === 'dark' ? darkColors : lightColors;
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
