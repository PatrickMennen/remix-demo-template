import type { LoaderFunction} from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { requireAuthentication } from '~/sessions';

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireAuthentication(request, '/');
  return redirect(userId ? '/dashboard' : '/');
};

export default function () {
  return null;
}
