import { Alert, Box, Button, Container, Stack, TextField } from '@mui/material';
import { ActionFunction, json, LoaderFunction, redirect } from '@remix-run/node';
import { Form, Link, useActionData, useLoaderData } from '@remix-run/react';
import { z } from 'zod';
import { login } from '~/api/login.server';
import { commitSession, getSession } from '~/sessions';
import Typography from '@mui/material/Typography';

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
  accountCreated?: string;
};

type LoaderData = {
  userId: string;
  accountCreated?: string;
};

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get('Cookie'));

  if (session.has('userId')) {
    return redirect('/');
  }

  const accountCreated = session.get('accountCreated') ?? null;

  return json(
    {
      userId: session.get('userId'),
      accountCreated,
    },
    {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    },
  );
};

export default function LoginPage() {
  const loginAction = useActionData<ActionData>();
  const { accountCreated } = useLoaderData<LoaderData>();

  return (
    <Form method="post">
      <Container component="main" maxWidth="xs">
        <Stack spacing={2} sx={{ marginTop: 8 }}>
          <Typography component={'h1'} variant={'h4'}>
            Philips Password Manager
          </Typography>

          {accountCreated && <Alert severity="success">{accountCreated}</Alert>}

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
            <Link to={'/register'}>
              <Button fullWidth>Don't have an account? Sign Up</Button>
            </Link>
          </Box>
        </Stack>
      </Container>
    </Form>
  );
}
