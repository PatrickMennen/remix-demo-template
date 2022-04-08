import { LoaderFunction } from '@remix-run/node';
import { login } from '~/api/login.server';
import { useLoaderData } from '@remix-run/react';

export const loader: LoaderFunction = async () => {
  const attempt = await login('admin@example.com', 'salamander');

  return {
    userId: attempt ? attempt : null,
  };
};

export default function Index() {
  const data = useLoaderData();

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}>
      <h1>Welcome to Remix</h1>
      <ul>
        <p>You are currently logged in with user Id: {data.userId}</p>
      </ul>
    </div>
  );
}
