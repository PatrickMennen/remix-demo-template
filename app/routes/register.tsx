import { Form, Link, useActionData } from '@remix-run/react';
import { Alert, Button, Container, Stack, TextField, Typography } from '@mui/material';
import { ActionFunction, LoaderFunction, redirect } from '@remix-run/node';
import { z, ZodError, ZodIssue } from 'zod';
import { registerUser } from '~/api/login.server';
import { commitSession, getSession } from '~/sessions';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

type ActionData = {
  validationErrors?: ZodIssue[];
  serverError: boolean;
};

export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get('Cookie'));
  const formData = await request.formData();

  const registrationConfirmation = z
    .object({
      email: z.string().email('The e-mail address you entered is invalid.'),
      password: z.string().min(8, 'Your master password should at least be 8 characters long.'),
      confirmation: z.string(),
    })
    .refine((data) => data.password === data.confirmation, {
      message: 'Password and confirmation do not match',
      path: ['confirmation'],
    });

  try {
    const registration = registrationConfirmation.parse({
      email: formData.get('email'),
      password: formData.get('password'),
      confirmation: formData.get('password-confirmation'),
    });

    await registerUser(registration.email, registration.password);

    session.flash(
      'accountCreated',
      'Your account has been created. You can now login using your master password',
    );

    return redirect('/login', { headers: { 'Set-Cookie': await commitSession(session) } });
  } catch (e) {
    if (e instanceof ZodError) {
      return {
        validationErrors: e.issues,
        serverError: false,
      };
    }

    if (e instanceof PrismaClientKnownRequestError) {
      return {
        validationErrors: [
          {
            message: 'This e-mail address has already been registered',
            path: ['email'],
            code: 'e-mail-in-use',
          },
        ],
      };
    }

    return { serverError: true };
  }
};

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get('Cookie'));

  if (session.has('userId')) {
    return redirect('/dashboard');
  }

  return null;
};

const getErrorsForField = (field: string, data?: ActionData) => {
  if (!data || !Array.isArray(data.validationErrors)) {
    return null;
  }

  const fieldErrors = data.validationErrors.filter((f) => f.path.includes(field));
  if (fieldErrors.length === 0) {
    return null;
  }

  return fieldErrors.map((e) => (
    <span key={e.code}>
      {e.message}
      <br />
    </span>
  ));
};

export default function RegisterPage() {
  const data = useActionData<ActionData>();

  return (
    <Container component="main" maxWidth="xs" sx={{ marginTop: 8 }}>
      <Typography component="h1" variant="h4" gutterBottom={true}>
        Register a new account
      </Typography>

      {data && data.serverError && (
        <Alert severity="error">Something went wrong on our side, please try again later.</Alert>
      )}

      <Form method="post">
        <Stack spacing={2}>
          <Typography>
            Wow, looks like you also want a <strong>free</strong> and <strong>super secure</strong>{' '}
            password manager. Let's create a new account.
          </Typography>

          <TextField
            label="E-mail address."
            name="email"
            placeholder="Your e-mail address."
            fullWidth
            autoFocus={true}
            helperText={getErrorsForField('email', data)}
            error={getErrorsForField('email', data) !== null}
          />

          <TextField
            label="Master password"
            name="password"
            placeholder="Your master password"
            type="password"
            fullWidth
            helperText={getErrorsForField('password', data)}
            error={getErrorsForField('password', data) !== null}
          />

          <TextField
            label={'Repeat your master password'}
            name={'password-confirmation'}
            placeholder="Repeat your master password"
            type="password"
            fullWidth
            helperText={getErrorsForField('confirmation', data)}
            error={getErrorsForField('confirmation', data) !== null}
          />

          <Alert severity="warning">
            <Typography gutterBottom variant="caption" component="p">
              Please bare in mind that we <strong>cannot recover your master password</strong>.
            </Typography>
            <Typography variant="caption" component="p">
              Should you lose your master password, you will lose access to this application and all
              your stored passwords
            </Typography>
          </Alert>

          <Stack component="aside" direction="row" justifyContent="flex-end" spacing={2}>
            <Link to="/login">
              <Button>Back to login screen</Button>
            </Link>

            <Button type="submit" variant="contained">
              Create account
            </Button>
          </Stack>
        </Stack>
      </Form>
    </Container>
  );
}
