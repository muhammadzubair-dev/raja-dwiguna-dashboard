import { MantineProvider } from '@mantine/core';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <MantineProvider>
      <Dashboard />
    </MantineProvider>
  );
}

export default App;
