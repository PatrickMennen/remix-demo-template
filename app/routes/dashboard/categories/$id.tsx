import { LoaderFunction } from '@remix-run/node';
import { getCategoryDetails } from '~/api/passwordManager.server';
import { requireAuthentication } from '~/sessions';
import { Category } from '@prisma/client';
import { Outlet, useLoaderData } from '@remix-run/react';
import Typography from '@mui/material/Typography';

type LoaderData = {
  category: Category;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  if (!params.id) {
    throw new Error('You cannot use this component without an id.');
  }

  const userId = await requireAuthentication(request);
  const category = await getCategoryDetails(userId, params.id);

  return {
    category,
  };
};

export default function CategoryOverviewPage() {
  const { category } = useLoaderData<LoaderData>();
  return (
    <>
      <Typography component="h2" variant="h5">
        {category.name}
      </Typography>

      <Outlet />
    </>
  );
}
