import { ActionFunction, json, LoaderFunction, redirect } from '@remix-run/node';
import { requireAuthentication } from '~/sessions';
import { getCategoryDetails, updateCategory } from '~/api/passwordManager.server';
import { Category } from '@prisma/client';
import { Form, Link, useActionData, useLoaderData } from '@remix-run/react';
import { isValidCategory } from '~/utils/isValidCategory';
import { ZodError, ZodIssue } from 'zod';
import React from 'react';

type LoaderData = {
  category: Category;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  if (!params.id) {
    throw new Error('You cannot call this route without an id.');
  }

  const userId = await requireAuthentication(request);
  const category = await getCategoryDetails(userId, params.id).catch((e) => {
    throw redirect('/dashboard/categories');
  });

  return { category };
};

type ActionData = {
  validationErrors?: ZodIssue[];
  serverError: boolean;
};

export const action: ActionFunction = async ({ request, params }) => {
  if (!params.id) {
    throw new Error('You cannot call this route without an id.');
  }
  const userId = await requireAuthentication(request);
  const formData = await request.formData();

  try {
    const categoryName = isValidCategory.parse(formData.get('category'));
    const category = await getCategoryDetails(userId, params.id);
    if (!category) {
      return json(
        {
          serverError: true,
        },
        404,
      );
    }

    await updateCategory(params.id, userId, categoryName);

    return redirect('/dashboard/categories');
  } catch (e) {
    if (e instanceof ZodError) {
      return json({ validationErrors: e.issues, serverError: false }, 400);
    }

    return json({ serverError: true }, 500);
  }
};

export default function EditCategory() {
  const { category } = useLoaderData<LoaderData>();
  const data = useActionData<ActionData>();

  return (
    <>
      <h2>Editing {category.name}</h2>

      <Form method="post">
        <label htmlFor="category">Category:</label>
        <input type="text" id="category" defaultValue={category.name} name="category" />
        {data && data.serverError && (
          <p>Something went wrong on our end when trying to rename your category.</p>
        )}
        {data && data.validationErrors && (
          <ul>
            {data.validationErrors.map((e) => (
              <li key={e.code}>{e.message}</li>
            ))}
          </ul>
        )}
        <Link to="/dashboard/categories">Cancel</Link>{' '}
        <input type="submit" name="action" value="Edit" />
      </Form>
    </>
  );
}
