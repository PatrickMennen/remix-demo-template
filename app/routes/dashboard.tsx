import { Outlet, useLoaderData } from '@remix-run/react';
import { LoaderFunction } from '@remix-run/node';
import { requireAuthentication } from '~/sessions';
import { listCategoriesForUser } from '~/api/passwordManager.server';
import { Category } from '@prisma/client';

type LoaderData = {
  categories: Category[];
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireAuthentication(request);

  const categories = await listCategoriesForUser(userId);

  return {
    categories,
  };
};

export default function HomePage() {
  const { categories } = useLoaderData<LoaderData>();
  return (
    <>
      <header>
        <h1>Philips Password Manager (PPM)</h1>
      </header>
      <nav>
        {categories.length === 0 ? (
          <p>You have no categories.</p>
        ) : (
          <ul>
            {categories.map((c) => (
              <li key={c.id}>{c.name}</li>
            ))}
          </ul>
        )}
      </nav>
      <main>
        <Outlet />
      </main>
    </>
  );
}
