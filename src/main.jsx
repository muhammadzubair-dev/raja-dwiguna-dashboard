import '@mantine/core/styles.css';
import 'mantine-datatable/styles.layer.css';
import '@mantine/charts/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dropzone/styles.css';
import '@mantine/carousel/styles.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <App />
  // </StrictMode>
);
