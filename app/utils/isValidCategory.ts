import { z } from 'zod';

export const isValidCategory = z.string().nonempty('Category name cannot be empty');
