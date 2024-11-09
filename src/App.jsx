import { MantineProvider } from '@mantine/core';
import { RouterProvider } from 'react-router-dom';
import routes from './routes';
import { ModalsProvider } from '@mantine/modals';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <ModalsProvider>
          <RouterProvider router={routes} />
        </ModalsProvider>
      </MantineProvider>
    </QueryClientProvider>
  );
}

export default App;
