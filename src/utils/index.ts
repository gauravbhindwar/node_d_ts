import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

const capitalCharacter = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const smallCharacter = "abcdefghijklmnopqrstuvwxyz";
const numericCharacter = "0123456789";
const specialCharacter = "!@#$%^&*()_+-=[]{}|;:,.<>?";

const getRandomChar = (set: string) =>
  set[Math.floor(Math.random() * set.length)];

export const generateSecurePassword = async () => {
  let rawPassword = "";

  // Ensure at least one of each type
  rawPassword += getRandomChar(capitalCharacter);
  rawPassword += getRandomChar(smallCharacter);
  rawPassword += getRandomChar(numericCharacter);
  rawPassword += getRandomChar(specialCharacter);

  // Fill the rest randomly to make it 10-12 characters
  const allChars =
    capitalCharacter + smallCharacter + numericCharacter + specialCharacter;

  const targetLength = 12;
  for (let i = rawPassword.length; i < targetLength; i++) {
    rawPassword += getRandomChar(allChars);
  }

  // Shuffle the password to avoid predictable pattern
  rawPassword = rawPassword
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");

  const hashedPassword = await bcrypt.hash(rawPassword, SALT_ROUNDS);

  console.log("🔐 Raw Password:", rawPassword);
  console.log("🔒 Hashed Password:", hashedPassword);

  return { rawPassword, hashedPassword };
};
