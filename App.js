import React from 'react';
import { AppContainer } from './src/screens';
import { ThemeProvider } from './src/theme';

/**
 * LinguaPlay - Therapeutic Language Learning Game
 * Entry point with theme configuration and app container
 */
export default function App() {
  return (
    <ThemeProvider defaultMode="system">
      <AppContainer />
    </ThemeProvider>
  );
}
