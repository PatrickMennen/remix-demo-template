import { createCookieSessionStorage } from '@remix-run/node';

export const { getSession, commitSession, destroySession } = createCookieSessionStorage({
  cookie: {
    name: '__session_cookie',
    expires: new Date(Date.now() + 60_000_000),
    secrets: ['tXF6M8VC6%XbBaquDgU2J@JPr@im*Ts*'],
  },
});
