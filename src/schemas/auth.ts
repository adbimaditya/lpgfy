import { z } from 'zod';

export const identifierSchema = z.string().refine(
  (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneNumberRegex = /^\d{10,13}$/;

    return emailRegex.test(value) || phoneNumberRegex.test(value);
  },
  { message: 'Must be a valid email or phone number' },
);

export const pinSchema = z.string().refine(
  (value) => {
    const pinRegex = /^\d{6}$/;

    return pinRegex.test(value);
  },
  { message: 'Must be a valid PIN' },
);
