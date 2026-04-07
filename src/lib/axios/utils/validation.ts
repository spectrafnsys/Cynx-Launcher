export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateSecret(secret: string): ValidationResult {
  if (!secret) {
    return { isValid: false, error: "Secret is required" };
  }

  if (typeof secret !== "string") {
    return { isValid: false, error: "Secret must be a string" };
  }

  if (!secret.trim()) {
    return { isValid: false, error: "Secret cannot be empty" };
  }

  // if (accountId.length > 50) {
  //   return {
  //     isValid: false,
  //     error: "Account ID must be less than 50 characters",
  //   };
  // }

  return { isValid: true };
}
