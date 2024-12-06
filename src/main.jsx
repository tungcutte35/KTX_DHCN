// index.js
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { UserProvider } from './context/UseContext';
import { BuildingProvider } from './context/BuildingContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserProvider>
      <BuildingProvider>
        <App />
      </BuildingProvider>
    </UserProvider>
  </StrictMode>
);
