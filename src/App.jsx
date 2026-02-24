import React from 'react';
import { AppProvider } from './contexts/AppContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppPage } from './pages';

// Login com Google desativado temporariamente.
// Renderiza AppPage diretamente sem autenticacao.
function App() {
    return (
        <ThemeProvider>
            <AppProvider>
                <AppPage />
            </AppProvider>
        </ThemeProvider>
    )
}

export default App;