import { Category } from '@prisma/client';
import { LoaderFunction } from '@remix-run/node';
import { listCategoriesForUser } from '~/api/passwordManager.server';
import { requireAuthentication } from '~/sessions';
import { Link, useLoaderData } from '@remix-run/react';
import Typography from '@mui/material/Typography';
import {
  Box,
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

type CategoriesOverviewData = {
  categories: Category[];
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireAuthentication(request);

  const categories = await listCategoriesForUser(userId);

  return {
    categories,
  };
};

export default function CategoriesPage() {
  const { categories } = useLoaderData<CategoriesOverviewData>();

  return (
    <Stack spacing={2}>
      <Typography component="h2" variant="h5">
        Categories
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: '90%' }}>Category name</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={2}>You currently have no categories defined</TableCell>
              </TableRow>
            )}

            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.name}</TableCell>
                <TableCell>
                  <Stack spacing={2} direction="row">
                    <Link to={`edit/${category.id}`}>
                      <Button>Edit</Button>
                    </Link>
                    <Link to={`delete/${category.id}`}>
                      <Button>Delete</Button>
                    </Link>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ textAlign: 'right' }}>
        <Link to="new">
          <Button variant="contained">New category</Button>
        </Link>
      </Box>
    </Stack>
  );
}
