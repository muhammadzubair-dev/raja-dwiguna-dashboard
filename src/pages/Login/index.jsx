import {
  Anchor,
  Box,
  Button,
  Checkbox,
  Container,
  Flex,
  Group,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { hasLength, useForm } from '@mantine/form';
import { useEffect } from 'react';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import logoImage from '../../assets/logo.png';
import ErrorMessage from '../../components/ErrorMessage';
import { usePostLogin } from '../../helpers/apiHelper';

function Login() {
  const navigate = useNavigate();

  const { mutate, isLoading, error } = useMutation(usePostLogin, {
    onSuccess: (data) => {
      localStorage.setItem('token', data.response.token);
      navigate('/');
    },
  });

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: { username: '', password: '' },
    validate: {
      username: hasLength({ min: 1 }, 'Must be at least 3 characters'),
      password: hasLength({ min: 3 }, 'Must be at least 3 characters'),
    },
  });

  const handleLogin = ({ username, password }) => {
    const credentials = {
      employee_id: username,
      password,
    };

    mutate(credentials);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/');
    }
  }, [navigate]);

  return (
    <Container size={420} my={40} pt={100}>
      <form onSubmit={form.onSubmit(handleLogin)}>
        <Paper withBorder shadow="md" p={30} mt={20} radius="md">
          <Flex justify="center" align="center" gap="md" mb="md">
            <img height={100} src={logoImage} alt="logo" />
            <Box>
              <Title order={2} mb={-10}>
                Raja Dwiguna
              </Title>
              <Title order={2}>Semesta</Title>
            </Box>
          </Flex>
          {/* <Text c="dimmed" size="sm" ta="center" my="md">
            Do not have an account yet?{' '}
            <Anchor size="sm" component="button">
              Create account
            </Anchor>
          </Text> */}
          <TextInput
            {...form.getInputProps('username')}
            key={form.key('username')}
            label="Username"
            placeholder="Your Username"
            required
          />
          <PasswordInput
            {...form.getInputProps('password')}
            key={form.key('password')}
            label="Password"
            placeholder="Your password"
            required
            mt="md"
          />
          <Group justify="space-between" mt="lg">
            <Checkbox label="Remember me" />
            {/* <Anchor component="button" size="sm">
              Forgot password?
            </Anchor> */}
          </Group>
          <Button fullWidth mt="xl" type="submit" loading={isLoading}>
            Sign in
          </Button>
          {error && <ErrorMessage message={error?.message} />}
        </Paper>
      </form>
    </Container>
  );
}

export default Login;
