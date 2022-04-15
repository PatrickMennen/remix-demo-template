import React, { useCallback, useState } from 'react';
import { Chip, Stack, TableCell, TableRow } from '@mui/material';

type PasswordRowProps = {
  username: string;
  password: string;
  name: string;
  passwordId: string;
};

export const PasswordRow: React.FC<PasswordRowProps> = ({ username, password, name }) => {
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
        {showPassword ? <Chip label={'Password hidden, click to show'} /> : password}
      </TableCell>
    </TableRow>
  );
};
