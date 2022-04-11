import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Container, Grid,
  Link,
  TextField,
  Typography
} from '@mui/material';
import { ActionFunction, json, LoaderFunction, redirect } from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { z } from 'zod';
import { login } from '~/api/login.server';
import { commitSession, getSession } from '~/sessions';

const formData = z.object({
  username: z.string(),
  password: z.string(),
});

export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get('Cookie'));
  const userInput = await request.formData();

  try {
    const { username, password } = formData.parse({
      username: userInput.get('username'),
      password: userInput.get('password'),
    });

    const userId = await login(username, password);
    session.set('userId', userId);

    return redirect('/', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  } catch (e) {
    return json(
      {
        loginFailed: true,
      },
      403,
    );
  }
};

type ActionData = {
  loginFailed: boolean;
};

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get('Cookie'));

  return {
    userId: session.get('userId'),
  };
};

export default function LoginPage() {
  const { userId } = useLoaderData();
  const loginAction = useActionData<ActionData>();

  return (
    <Form method="post">
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            {userId ? `Currently logged in as: ${userId}` : 'Sign in'}
          </Typography>
          <Box>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
            />
            {loginAction && loginAction.loginFailed && (
              <Alert severity="error">Your username or password is incorrect.</Alert>
            )}
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
              Sign In
            </Button>
            <Grid container>
              <Grid item>
                <Link href="#" variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </Form>
  );
}
