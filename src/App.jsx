import React from 'react';
import { AppProvider, ThemeProvider, UserProvider, useUser } from './contexts';
import { AppPage, LoginPage } from './pages';

const AuthGate = () => {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Validando autenticação...
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <AppProvider>
      <AppPage />
    </AppProvider>
  );
};

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <AuthGate />
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
