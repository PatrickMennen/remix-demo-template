import Typography from '@mui/material/Typography';
import { LoaderFunction } from '@remix-run/node';
import { getSession, requireAuthentication } from '~/sessions';
import { getPasswordsForCategory } from '~/api/passwordManager.server';
import { Link, useCatch, useLoaderData } from '@remix-run/react';
import {
  Alert,
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Box } from '@mui/system';
import { Password } from '@prisma/client';
import { PasswordRow } from '~/components/PasswordRow';

type LoaderData = {
  passwords: Password[];
};

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireAuthentication(request);
  const session = await getSession(request.headers.get('Cookie'));

  if (!params.id) {
    throw new Error('You cannot use this component without a category id.');
  }

  const userId = await requireAuthentication(request);
  const passwords = await getPasswordsForCategory(userId, params.id, session);

  return {
    passwords,
  };
};

export default function PasswordOverviewPage() {
  const { passwords } = useLoaderData<LoaderData>();

  return (
    <Stack spacing={2}>
      <Typography variant="h6" component="h3">
        Passwords
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Password</TableCell>
              <TableCell sx={{ width: '10%' }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {passwords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3}>No passwords found in this category</TableCell>
              </TableRow>
            ) : (
              passwords.map((p) => (
                <PasswordRow
                  key={p.id}
                  passwordId={p.id}
                  username={p.username}
                  password={p.password}
                  name={p.name}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ textAlign: 'right' }}>
        <Link to={'new'}>
          <Button variant="contained">New password entry</Button>
        </Link>
      </Box>
    </Stack>
  );
}
