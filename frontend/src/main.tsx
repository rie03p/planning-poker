import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {ChakraProvider, createSystem, defaultConfig} from '@chakra-ui/react';
import App from './App';

const system = createSystem(defaultConfig);

const root = document.querySelector('#root');

if (!root) {
  throw new Error('Root element not found');
}

createRoot(root).render(
  <StrictMode>
    <ChakraProvider value={system}>
      <App />
    </ChakraProvider>
  </StrictMode>,
);
