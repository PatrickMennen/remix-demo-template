import { Category } from '@prisma/client';
import { LoaderFunction } from '@remix-run/node';
import { listCategoriesForUser } from '~/api/passwordManager.server';
import { requireAuthentication } from '~/sessions';
import { Link, useLoaderData } from '@remix-run/react';

type CategoriesOverviewData = {
  categories: Category[];
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireAuthentication(request);

  const categories = await listCategoriesForUser(userId);

  return {
    categories,
  };
};

export default function CategoriesPage() {
  const { categories } = useLoaderData<CategoriesOverviewData>();

  return (
    <>
      <h2>Categories</h2>
      <p>You have {categories.length} categories defined</p>

      <ul>
        {categories.map((category) => (
          <li key={category.id}>
            {category.name}
            <span>
              <Link to={`edit/${category.id}`}>Edit</Link> |{' '}
              <Link to={`delete/${category.id}`}>Delete</Link>
            </span>
          </li>
        ))}
      </ul>

      <Link to="new">New category</Link>
    </>
  );
}
