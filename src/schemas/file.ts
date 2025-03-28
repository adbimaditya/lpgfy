import z from 'zod';

import { NATIONALITY_ID_LENGTH } from '../libs/constants.ts';

export const nationalityIdsSchema = z.array(z.string().length(NATIONALITY_ID_LENGTH));

export type NationalityIds = z.infer<typeof nationalityIdsSchema>;
