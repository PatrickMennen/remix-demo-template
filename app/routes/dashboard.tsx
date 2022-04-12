import { Link, Outlet, useLoaderData } from '@remix-run/react';
import { LoaderFunction } from '@remix-run/node';
import { requireAuthentication } from '~/sessions';
import { listCategoriesForUser } from '~/api/passwordManager.server';
import { Category } from '@prisma/client';
import { AppBar, Box, Button, Drawer, ListItem, Paper } from '@mui/material';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Toolbar from '@mui/material/Toolbar';

type LoaderData = {
  categories: Category[];
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireAuthentication(request);

  const categories = await listCategoriesForUser(userId);

  return {
    categories,
  };
};

export default function HomePage() {
  const { categories } = useLoaderData<LoaderData>();
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gridTemplateRows: 'auto 1fr',
        height: '100vh',
      }}
    >
      <Box sx={{ gridColumn: '1 / -1' }}>
        <AppBar position="static" component={'header'}>
          <Toolbar>
            <Typography component="h1" variant="h6">
              Philips Password Manager (PPM)
            </Typography>

            <Link to="/logout" style={{ marginLeft: 'auto', color: 'white' }}>
              <Button color="inherit">Logout</Button>
            </Link>
          </Toolbar>
        </AppBar>
      </Box>
      <Paper sx={{ gridColumn: '1 / 2' }} variant="outlined" square elevation={3}>
        <Toolbar>
          <List>
            {categories.length === 0 ? (
              <p>You have no categories.</p>
            ) : (
              <List>
                {categories.map((c) => (
                  <ListItem key={c.id}>{c.name}</ListItem>
                ))}
              </List>
            )}
          </List>
        </Toolbar>
      </Paper>
      <Box sx={{ gridColumn: '2 / -1', padding: '2rem' }}>
        <Outlet />
      </Box>
    </Box>
  );
}
