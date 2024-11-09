import {
  Anchor,
  Button,
  Checkbox,
  Container,
  Group,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { hasLength, useForm } from '@mantine/form';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../../helpers/apiHelper';
import classes from './index.module.css';
import ErrorMessage from '../../components/ErrorMessage';

function Login() {
  const navigate = useNavigate();

  const { mutate, isLoading, error } = useMutation(useLogin, {
    onSuccess: (data) => {
      localStorage.setItem('token', data.response.token);
      navigate('/');
    },
  });

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: { username: '', password: '' },
    validate: {
      username: hasLength({ min: 3 }, 'Must be at least 3 characters'),
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

  return (
    <Container size={420} my={40} pt={100}>
      <Title ta="center" className={classes.title}>
        Login
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Do not have an account yet?{' '}
        <Anchor size="sm" component="button">
          Create account
        </Anchor>
      </Text>

      <form onSubmit={form.onSubmit(handleLogin)}>
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
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
            <Anchor component="button" size="sm">
              Forgot password?
            </Anchor>
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
