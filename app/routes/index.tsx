import { login } from '~/api/login.server';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { ActionFunction, json, LoaderFunction, redirect } from '@remix-run/node';
import { commitSession, getSession } from '~/sessions';

export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get('Cookie'));

  const formData = await request.formData();
  const username = formData.get('username');
  const password = formData.get('password');

  if (typeof username !== 'string' || typeof password !== 'string') {
    throw new Error('Form data is incorrect!');
  }

  try {
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

export default function Index() {
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
