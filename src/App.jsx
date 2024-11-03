import { MantineProvider } from '@mantine/core';
import { RouterProvider } from 'react-router-dom';
import routes from './routes';

function App() {
  return (
    <MantineProvider>
      <RouterProvider router={routes} />
    </MantineProvider>
  );
}

export default App;
