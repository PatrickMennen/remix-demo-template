import { Form, useActionData } from '@remix-run/react';
import { ActionFunction, json, redirect } from '@remix-run/node';
import { ZodError, ZodIssue } from 'zod';
import { requireAuthentication } from '~/sessions';
import { createCategory } from '~/api/passwordManager.server';
import React from 'react';
import { isValidCategory } from '~/utils/isValidCategory';
import { Alert, Button, Stack, TextField } from '@mui/material';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/system';

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
    return redirect('/dashboard');
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
    <Form method="post">
      <Stack spacing={2}>
        <Typography component="h2" variant="h5">
          New category
        </Typography>

        <TextField
          label="Category name:"
          type="text"
          name="category"
          placeholder={'Category name'}
        />

        {data && data.serverError && (
          <Alert severity="error">
            Something went wrong on our end when trying to create your category.
          </Alert>
        )}

        {data && data.validationErrors && (
          <Alert severity="error">
            Please correct the following errors:
            <ul>
              {data.validationErrors.map((e) => (
                <li key={e.code}>{e.message}</li>
              ))}
            </ul>
          </Alert>
        )}

        <Box sx={{ textAlign: 'right' }}>
          <Button variant="contained" type="submit">
            Create category
          </Button>
        </Box>
      </Stack>
    </Form>
  );
}
