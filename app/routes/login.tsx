import { login } from '~/api/login.server';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { ActionFunction, json, LoaderFunction, redirect } from '@remix-run/node';
import { commitSession, getSession } from '~/sessions';
import { z } from 'zod';

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
    userId: session.get('userId') ?? 'Not logged in.',
  };
};

export default function LoginPage() {
  const { userId } = useLoaderData();
  const loginAction = useActionData<ActionData>();

  return (
    <Form method="post">
      <p>Currently logged in as: {userId}</p>

      <label>
        Username:
        <input type={'text'} name={'username'} />
      </label>

      <label>
        Password:
        <input type={'password'} name={'password'} />
      </label>

      {loginAction && loginAction.loginFailed && <p>Your username or password is incorrect.</p>}

      <button type="submit">Login</button>
    </Form>
  );
}
