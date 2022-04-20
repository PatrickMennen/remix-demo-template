import { Form, Link, useActionData } from '@remix-run/react';
import { Button, Stack, TextField, Typography } from '@mui/material';
import { PasswordStrength } from '~/components/PasswordStrength';
import React, { useCallback, useMemo, useState } from 'react';
import type { ZodIssue } from 'zod';
import { ZodError } from 'zod';
import { Box } from '@mui/system';
import type { ActionFunction} from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { getSession, requireAuthentication } from '~/sessions';
import queryString from 'query-string';
import { addPasswordToCategory, passwordEntryValidator } from '~/api/passwordManager.server';

export const action: ActionFunction = async ({ request, params }) => {
  if (!params.id) {
    throw new Error('You cannot use this action without a category identifier.');
  }

  const userId = await requireAuthentication(request);
  const session = await getSession(request.headers.get('Cookie'));

  const formData = queryString.parse(await request.text());
  const formUris: string[] = formData['uris[]'] as string[];

  try {
    const entry = passwordEntryValidator.parse({
      name: formData.name,
      username: formData.username,
      password: formData.password,
      uris: formUris.filter((f) => f !== ''),
    });

    await addPasswordToCategory(userId, params.id, entry, session);
    return redirect(`/dashboard/category/${params.id}`);
  } catch (e) {
    if (e instanceof ZodError) {
      return json(
        {
          errors: e.issues,
        },
        400,
      );
    }

    return json(
      {
        errors: [
          {
            code: 'internal-server-error',
            message: 'Something went wrong on our end, please try again later.',
          },
        ],
      },
      500,
    );
  }
};

type ActionData = {
  errors: ZodIssue[];
};

export default function NewPasswordPage() {
  const actionData = useActionData<ActionData>();

  const [password, setPassword] = useState<string>('');
  const [amountOfUris, setAmountOfUris] = useState<number>(3);
  const uriFields = useMemo(() => [...Array(amountOfUris).keys()], [amountOfUris]);

  const changeHandler = useCallback(
    (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setPassword(event.currentTarget.value);
    },
    [setPassword],
  );

  const addUriHandler = useCallback(() => {
    setAmountOfUris(amountOfUris + 1);
  }, [setAmountOfUris, amountOfUris]);

  return (
    <Form method="post">
      {JSON.stringify(actionData)}
      <Stack spacing={2}>
        <Typography variant="h6" component="h3">
          General details
        </Typography>
        <Typography>Please fill out all the required fields.</Typography>

        <TextField
          required
          name="name"
          label="Name:"
          placeholder={'Enter the name for your entry'}
        />

        <Typography variant="h6" component="h4">
          User details
        </Typography>

        <TextField
          name="username"
          label="Username:"
          placeholder={'Enter your username for this entry'}
          required
        />
        <TextField
          name="password"
          label="Password:"
          placeholder={'Enter your password for this entry'}
          onChange={changeHandler}
          value={password}
          type="password"
          required
        />

        <PasswordStrength password={password} verbose />

        <Typography variant="h6" component={'h3'}>
          Urls
        </Typography>
        {uriFields.map((field) => (
          <TextField
            key={`field-${field}`}
            name="uris[]"
            label="URI:"
            placeholder={'Enter login URL for this website here.'}
          />
        ))}
      </Stack>

      <Box sx={{ textAlign: 'right' }}>
        <Button onClick={addUriHandler}>Add another</Button>
      </Box>

      <Typography>All done? Click Save to save your entry</Typography>

      <Stack component="aside" direction={'row'} justifyContent={'flex-end'}>
        <Link to={'../'}>
          <Button>Cancel</Button>
        </Link>
        <Button variant="contained" type="submit">
          Save
        </Button>
      </Stack>
    </Form>
  );
}
