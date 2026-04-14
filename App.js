import React from 'react';
import { AppContainer } from './src/screens/AppContainer';
import { ThemeProvider } from './src/theme';

/**
 * LinguaPlay - Therapeutic Language Learning Game
 */
export default function App() {
  return (
    <ThemeProvider initialMode="auto">
      <AppContainer />
    </ThemeProvider>
  );
}
