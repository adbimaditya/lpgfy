import { z } from 'zod';

export const responseSchema = z.object({
  success: z.boolean(),
  code: z.number(),
  message: z.string(),
  data: z.any(),
});

export function createResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return responseSchema.extend({ data: dataSchema });
}

export type Response = z.infer<typeof responseSchema>;
