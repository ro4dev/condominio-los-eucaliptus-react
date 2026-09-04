import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import App from './App';
import { AppProvider } from './store/AppContext';
import { DataProvider } from './store/DataContext';
import { Snackbar } from './components/Snackbar';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <DataProvider>
        <App />
        <Snackbar />
      </DataProvider>
    </AppProvider>
  </StrictMode>,
);
