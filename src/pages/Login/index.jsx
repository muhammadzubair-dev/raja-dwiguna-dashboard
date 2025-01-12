import {
  Anchor,
  Box,
  Button,
  Center,
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
import { jwtDecode } from 'jwt-decode';
import { hasLength, useForm } from '@mantine/form';
import { useEffect, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import logoImage from '../../assets/logo.png';
import ErrorMessage from '../../components/ErrorMessage';
import { usePostLogin } from '../../helpers/apiHelper';
import { notificationError } from '../../helpers/notificationHelper';
import mappingPermission from '../../helpers/mappingPermission';
import moment from 'moment';
// Import the images at the top of the file
import morningImage from '../../assets/morning.jpg';
import afternoonImage from '../../assets/afternoon.jpg';
import eveningImage from '../../assets/evening.jpg';
import nightImage from '../../assets/night.jpg';

// Function to determine the background image based on the time of day using Moment.js
const getBackgroundImage = () => {
  const currentTime = moment(); // Get current time as a moment object
  const currentFormattedTime = currentTime.format('HH:mm'); // Format time to 'HH:mm' (24-hour format)

  // Define time ranges as formatted strings ('HH:mm')
  if (currentFormattedTime >= '05:00' && currentFormattedTime <= '10:59') {
    return morningImage; // Morning image from 05:00 to 10:59
  } else if (
    currentFormattedTime >= '11:00' &&
    currentFormattedTime <= '15:59'
  ) {
    return afternoonImage; // Afternoon image from 11:00 to 15:59
  } else if (
    currentFormattedTime >= '15:01' &&
    currentFormattedTime <= '18:31'
  ) {
    return eveningImage; // Evening image from 15:01 to 18:59
  } else {
    return nightImage; // Night image from 19:00 to 04:59
  }
};

function Login() {
  const [backgroundImage, setBackgroundImage] = useState(getBackgroundImage());
  const navigate = useNavigate();
  const { mutate, isLoading, error } = useMutation(usePostLogin, {
    onSuccess: (data) => {
      const decoded = jwtDecode(data.response.token);
      const findDashboard = decoded.privilege.find(
        (item) => item.module === 'dashboard'
      );

      if (findDashboard.permission.dashboard) {
        localStorage.setItem('token', data.response.token);
        navigate('/');
      } else {
        const truePermissions = decoded.privilege
          .filter((item) => item.status)
          .flatMap((item) =>
            Object.entries(item.permission)
              .filter(([key, value]) => value)
              .map(([key, value]) => key)
          );
        if (truePermissions.length !== 0) {
          localStorage.setItem('token', data.response.token);
          const findPath = mappingPermission.find(
            (item) => item.permission === truePermissions[0]
          );
          navigate(findPath.path);
        } else {
          notificationError("You don't have permission");
        }
      }
    },
  });

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: { username: '', password: '' },
    validate: {
      username: hasLength({ min: 1 }, 'Must be at least 1 characters'),
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

  // Function to update background image
  const updateBackgroundImage = () => {
    setBackgroundImage(getBackgroundImage());

    // Recursively call setTimeout to check again in 60 seconds
    setTimeout(updateBackgroundImage, 60000); // 60000ms = 1 minute
  };

  useEffect(() => {
    // Start the background image update process on mount
    updateBackgroundImage();
  }, []);

  return (
    <Box
      style={{
        backgroundImage: `url(${backgroundImage})`, // Use the state for the background image
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '100vh',
      }}
    >
      <Center style={{ height: '100%' }}>
        <form onSubmit={form.onSubmit(handleLogin)}>
          <Paper withBorder shadow="md" p={30} m={30} miw={300} radius="md">
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
      </Center>
    </Box>
  );
}

export default Login;
