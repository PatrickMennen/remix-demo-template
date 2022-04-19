import { Link, NavLink, Outlet, useLoaderData } from '@remix-run/react';
import { LoaderFunction } from '@remix-run/node';
import { requireAuthentication } from '~/sessions';
import { listCategoriesForUser } from '~/api/passwordManager.server';
import { Category } from '@prisma/client';
import { AppBar, Box, Button, ListItem, Paper, Stack } from '@mui/material';
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

export default function DashboardPage() {
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
      <Paper sx={{ gridColumn: '1 / 2' }} square elevation={3}>
        <List>
          {categories.length === 0 ? (
            <ListItem>
              <Stack spacing={2}>
                <Typography>You have no categories</Typography>
                <Link to={'new'}>
                  <Button variant="contained">Create a category</Button>
                </Link>
              </Stack>
            </ListItem>
          ) : (
            <List>
              {categories.map((c) => (
                <NavLink to={`category/${c.id}`} key={c.id}>
                  {({ isActive }) => (
                    <ListItem key={c.id} selected={isActive}>
                      {c.name}
                    </ListItem>
                  )}
                </NavLink>
              ))}
            </List>
          )}
        </List>
      </Paper>
      <Box sx={{ gridColumn: '2 / -1', padding: '2rem' }}>
        <Outlet />
      </Box>
    </Box>
  );
}
