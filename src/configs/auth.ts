import dotenv from 'dotenv';
import z from 'zod';

dotenv.config();

const authConfigSchema = z.object({
  identifier: z.string().refine(
    (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneNumberRegex = /^\d{10,13}$/;

      return emailRegex.test(value) || phoneNumberRegex.test(value);
    },
    { message: 'Must be a valid email or phone number' },
  ),
  pin: z.string().refine(
    (value) => {
      const pinRegex = /^\d{6}$/;

      return pinRegex.test(value);
    },
    { message: 'Must be a valid PIN' },
  ),
});

const authConfig = authConfigSchema.parse({
  identifier: process.env.IDENTIFIER ?? '',
  pin: process.env.PIN ?? '',
});

export default authConfig;
