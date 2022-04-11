import { createCookieSessionStorage, redirect } from '@remix-run/node';

export const { getSession, commitSession, destroySession } = createCookieSessionStorage({
  cookie: {
    name: '__session_cookie',
    expires: new Date(Date.now() + 60_000_000),
    secrets: ['tXF6M8VC6%XbBaquDgU2J@JPr@im*Ts*'],
  },
});

export const requireAuthentication = async (
  request: Request,
  redirectTo: string = new URL(request.url).pathname,
) => {
  const session = await getSession(request.headers.get('Cookie'));
  const userId = session.get('userId');

  if (!userId || typeof userId !== 'string') {
    const searchParams = new URLSearchParams([['redirectTo', redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }

  return userId;
};
