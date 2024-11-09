import { MantineProvider } from '@mantine/core';
import { RouterProvider } from 'react-router-dom';
import routes from './routes';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <RouterProvider router={routes} />
      </MantineProvider>
    </QueryClientProvider>
  );
}

export default App;
