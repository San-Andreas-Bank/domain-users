export const TOKEN_EXPIRATION_MS = Number(
  process.env.TOKEN_EXPIRATION_MS ?? 10 * 60 * 1000,
); // 10 minutes

export const EMAIL_RESET_PASSWORD_URL =
  process.env.EMAIL_RESET_PASSWORD_URL ?? ''; // client website to reset password
