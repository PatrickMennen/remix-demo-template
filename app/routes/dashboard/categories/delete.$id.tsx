import { Form, Link, useActionData, useLoaderData } from '@remix-run/react';
import { ActionFunction, json, LoaderFunction, redirect } from '@remix-run/node';
import { requireAuthentication } from '~/sessions';
import { Category } from '@prisma/client';
import { deleteCategory, getCategoryDetails } from '~/api/passwordManager.server';
import { z, ZodError } from 'zod';

type LoaderData = {
  category: Category;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireAuthentication(request);

  if (!params.id) {
    throw new Error('You cannot use this component without an id.');
  }

  const category = await getCategoryDetails(userId, params.id);
  if (!category) {
    return redirect('/dashboard/categories');
  }

  return {
    category,
  };
};

type ActionData = {
  error: string;
};

export const action: ActionFunction = async ({ request, params }) => {
  if (!params.id) {
    throw new Error('You did not provide an id.');
  }

  const formData = await request.formData();
  const userId = await requireAuthentication(request);
  const category = await getCategoryDetails(userId, params.id);

  if (!category) {
    return redirect('/dashboard/categories');
  }
  const canRemoveCategory = z.literal(category.name);
  try {
    canRemoveCategory.parse(formData.get('confirmation'));
    await deleteCategory(userId, category.id);

    return redirect('/dashboard/categories');
  } catch (e) {
    if (e instanceof ZodError) {
      return json({ error: 'You did not enter the category name correctly.' }, 400);
    }

    return json({ error: 'Something went wrong on our side, please try again later' }, 500);
  }
};

export default function DeleteCategoryPage() {
  const { category } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();

  return (
    <>
      <h2>Removing &quot;{category.name}&quot;</h2>
      <Form method="post">
        <p>
          Are you sure you want to remove the category <strong>{category.name}</strong>.
        </p>
        <p>
          <strong>This action cannot be undone</strong>
        </p>
        <p>
          To confirm deletion please enter <em>&quot;{category.name}&quot;</em> in the box below.
        </p>
        <input type="text" name="confirmation" />
        {actionData && <p>{actionData.error}</p>}

        <Link to={'/dashboard/categories'}>Nope get me out of here</Link>
        <input type="submit" value="Delete" />
      </Form>
    </>
  );
}
