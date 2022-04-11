import { Form, useActionData } from '@remix-run/react';
import { ActionFunction, json, redirect } from '@remix-run/node';
import { z, ZodError, ZodIssue } from 'zod';
import { requireAuthentication } from '~/sessions';
import { createCategory } from '~/api/passwordManager.server';
import React from 'react';
import { isValidCategory } from '~/utils/isValidCategory';

type ActionData = {
  validationErrors?: ZodIssue[];
  serverError: boolean;
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireAuthentication(request);
  const formData = await request.formData();

  try {
    const category = isValidCategory.parse(formData.get('category'));
    await createCategory(userId, category);
    return redirect('/dashboard/categories');
  } catch (e) {
    if (e instanceof ZodError) {
      return json(
        {
          validationErrors: e.issues,
          serverError: false,
        },
        400,
      );
    }

    return json({
      serverError: true,
    });
  }
};

export default function NewCategoryPage() {
  const data = useActionData<ActionData>();

  return (
    <>
      <h2>New category</h2>
      <Form method="post">
        <label>Category name:</label>
        <input type="text" name="category" />

        {data && data.serverError && (
          <p>Something went wrong on our end when trying to create your category.</p>
        )}

        {data && data.validationErrors && (
          <ul>
            {data.validationErrors.map((e) => (
              <li key={e.code}>{e.message}</li>
            ))}
          </ul>
        )}

        <input type="submit" value="Create category" />
      </Form>
    </>
  );
}
