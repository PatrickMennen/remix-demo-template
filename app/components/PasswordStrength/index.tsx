import React, { useMemo } from 'react';
import zxcvbn from 'zxcvbn';
import { Alert, Stack } from '@mui/material';
import { Box } from '@mui/system';
import Typography from '@mui/material/Typography';

type PasswordStrengthProps = {
  password: string;
  verbose: boolean;
};

type BarProps = {
  color: string;
  level: number;
  minLevel: number;
};

const Bar: React.FC<BarProps> = ({ minLevel, level, color }) => (
  <Box
    sx={{
      backgroundColor: level >= minLevel ? color : '#ccc',
      flex: 1,
      height: '0.5rem',
      userSelect: 'none',
    }}
  >
    &nbsp;
  </Box>
);

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({
  password,
  verbose = false,
}) => {
  const validatedPassword = useMemo(() => zxcvbn(password), [password]);
  const bars = useMemo(() => [...Array(5).keys()], []);
  const barColor = useMemo(() => {
    const score = validatedPassword.score;
    if (score < 2) {
      return 'red';
    }

    if (score < 4) {
      return 'orange';
    }

    return 'green';
  }, [validatedPassword]);

  return (
    <Stack spacing={2}>
      <Stack spacing={0.25} direction="row" justifyContent="space-between">
        {bars.map((bar, index) => (
          <Bar
            key={`bar-${index}`}
            color={barColor}
            level={validatedPassword.score}
            minLevel={password ? index : Infinity}
          />
        ))}
      </Stack>

      {verbose &&
        password &&
        (validatedPassword.feedback.warning ||
          validatedPassword.feedback.suggestions.length > 0) && (
          <Alert severity="warning">
            <Typography variant="caption" component="p" gutterBottom>
              {validatedPassword.feedback.warning}
            </Typography>

            {validatedPassword.feedback.suggestions.map((suggestion, index) => (
              <Typography variant="caption" component="p" key={index}>
                {suggestion}
              </Typography>
            ))}
          </Alert>
        )}
    </Stack>
  );
};
