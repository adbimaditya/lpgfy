import { config } from 'dotenv';

config();

export default {
  phoneNumber: process.env.PHONE_NUMBER ?? '',
  pin: process.env.PIN ?? '',
  nationalityID: process.env.NATIONALITY_ID ?? '',
};
