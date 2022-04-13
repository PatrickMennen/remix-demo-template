import Typography from '@mui/material/Typography';
import { LoaderFunction } from '@remix-run/node';
import { requireAuthentication } from '~/sessions';
import { getPasswordsForCategory } from '~/api/passwordManager.server';
import { Link, useLoaderData } from '@remix-run/react';
import {
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

export const loader: LoaderFunction = async ({ request, params }) => {
  if (!params.id) {
    throw new Error('You cannot use this component without a category id.');
  }

  const userId = await requireAuthentication(request);
  const passwords = await getPasswordsForCategory(userId, params.id);

  return {
    passwords,
  };
};

export default function PasswordOverviewPage() {
  const { passwords } = useLoaderData<ReturnType<typeof loader>>();

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
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {passwords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3}>No passwords found in this category</TableCell>
              </TableRow>
            ) : (
              <TableRow>ARf</TableRow>
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
