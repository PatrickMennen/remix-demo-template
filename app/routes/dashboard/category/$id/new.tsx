import { Form } from '@remix-run/react';
import { Stack, TextField, Typography } from '@mui/material';
import { PasswordStrength } from '~/components/PasswordStrength';
import React, { useCallback, useState } from 'react';

export default function NewPasswordPage() {
  const [password, setPassword] = useState<string>('');
  const changeHandler = useCallback(
    (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setPassword(event.currentTarget.value);
    },
    [password],
  );

  return (
    <Form>
      <Stack spacing={2}>
        <Typography variant="h6" component="h3">
          General details
        </Typography>
        <TextField name="name" label="Name:" placeholder={'Enter the name for your entry'} />

        <Typography variant="h6" component="h4">
          User details
        </Typography>
        <TextField name="username" label="Username:" placeholder={'Username'} />
        <TextField
          name="password"
          label="Password:"
          placeholder={'Enter your password for this entry'}
          onChange={changeHandler}
          value={password}
          type="password"
        />

        <PasswordStrength password={password} verbose />
      </Stack>
    </Form>
  );
}
