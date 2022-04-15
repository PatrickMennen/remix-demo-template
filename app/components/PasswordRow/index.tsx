import React, { useCallback, useState } from 'react';
import { Button, Chip, Stack, TableCell, TableRow } from '@mui/material';
import { Link } from '@remix-run/react';

type PasswordRowProps = {
  username: string;
  password: string;
  name: string;
  passwordId: string;
};

export const PasswordRow: React.FC<PasswordRowProps> = ({
  username,
  password,
  name,
  passwordId,
}) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const togglePasswordVisibility = useCallback(
    () => setShowPassword(!showPassword),
    [showPassword, setShowPassword],
  );

  return (
    <TableRow>
      <TableCell>{name}</TableCell>
      <TableCell>{username}</TableCell>
      <TableCell onClick={togglePasswordVisibility}>
        {showPassword ? password : <Chip label={'Password hidden, click to show'} />}
      </TableCell>
      <TableCell>
        <Link to={`delete/${passwordId}`}>
          <Button color={'error'}>Delete</Button>
        </Link>
        <Link to={`edit/${passwordId}`}>
          <Button>Edit</Button>
        </Link>
      </TableCell>
    </TableRow>
  );
};
