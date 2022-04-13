import { Form } from '@remix-run/react';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';

export default function NewPasswordPage() {
  const [amountOfUrls, setAmountOfUrls] = useState<number>(1);
  const inputFields = useMemo(() => Array.from(Array(amountOfUrls).keys()), [amountOfUrls]);
  const createUriFieldHandler = useCallback(() => {
    setAmountOfUrls(amountOfUrls + 1);
  }, [setAmountOfUrls, amountOfUrls]);

  return (
    <Form>
      <Stack spacing={2}>
        <Typography component="h2" variant="h4">
          New Password
        </Typography>
        <TextField label="Name:" placeholder="Name" name="name" />
        <TextField label="Password:" placeholder="Password" name="password" />

        <Typography component="h3" variant="h5">
          Urls
        </Typography>
        {inputFields.map((p) => (
          <TextField key="p" label={`URI ${p + 1}`} name="urls[]" />
        ))}

        <Box sx={{ textAlign: 'right' }}>
          <Button onClick={createUriFieldHandler}>Add another URL</Button>
        </Box>
      </Stack>
    </Form>
  );
}
