
export const passwordRules = (t) => [
  {
    label: t("RESET_PASSWORD.RULES.LENGTH"),
    test: (pw) => pw.length >= 8,
  },
  {
    label: t("RESET_PASSWORD.RULES.UPPERCASE"),
    test: (pw) => /[A-Z]/.test(pw),
  },
  {
    label: t("RESET_PASSWORD.RULES.LOWERCASE"),
    test: (pw) => /[a-z]/.test(pw),
  },
  {
    label: t("RESET_PASSWORD.RULES.NUMBER"),
    test: (pw) => /\d/.test(pw),
  },
  {
    label: t("RESET_PASSWORD.RULES.SPECIAL"),
    test: (pw) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw),
  },
];

// Common password requirements for forms
export const passwordRequirements = (t) => [
  {
    test: (password) => password.length >= 8,
    label: t("ADD_USER.VALIDATION.PASSWORD_LENGTH"),
  },
  {
    test: (password) => /[A-Z]/.test(password),
    label: t("ADD_USER.VALIDATION.PASSWORD_UPPERCASE"),
  },
  {
    test: (password) => /[a-z]/.test(password),
    label: t("ADD_USER.VALIDATION.PASSWORD_LOWERCASE"),
  },
  {
    test: (password) => /\d/.test(password),
    label: t("ADD_USER.VALIDATION.PASSWORD_NUMBER"),
  },
  {
    test: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
    label: t("ADD_USER.VALIDATION.PASSWORD_SPECIAL"),
  },
];

// Password validation functions
export const validatePassword = (password, t) => {
  if (!password?.trim()) return t("LOGIN.ERRORS.PASSWORD_REQUIRED");
  return "";
};

export const validateNewPassword = (password, t) => {
  if (!password?.trim()) return t("RESET_PASSWORD.ERRORS.PASSWORD_REQUIRED");
  if (password.length < 8) return t("RESET_PASSWORD.ERRORS.PASSWORD_SHORT");
  
  const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
  if (!strongRegex.test(password)) return t("RESET_PASSWORD.ERRORS.PASSWORD_WEAK");
  
  return "";
};

export const validateConfirmPassword = (confirmPassword, newPassword, t) => {
  if (!confirmPassword?.trim()) return t("RESET_PASSWORD.ERRORS.CONFIRM_PASSWORD_REQUIRED");
  if (confirmPassword !== newPassword) return t("RESET_PASSWORD.ERRORS.PASSWORDS_MISMATCH");
  return "";
};

// Password strength calculator
export const calculatePasswordStrength = (password) => {
  if (!password) return "";
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isLongEnough = password.length >= 8;

  const strengthScore = [
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar,
    isLongEnough,
  ].filter(Boolean).length;

  if (strengthScore >= 4) return "strong";
  if (strengthScore >= 3) return "medium";
  return "weak";
};

// Get password strength text
export const getPasswordStrengthText = (strength, t) => {
  switch (strength) {
    case "strong":
      return t("ADD_USER.PASSWORD_STRONG");
    case "medium":
      return t("ADD_USER.PASSWORD_MEDIUM");
    case "weak":
      return t("ADD_USER.PASSWORD_WEAK");
    default:
      return "";
  }
};

// Comprehensive password validator for forms
export const validateFormPassword = (password, confirmPassword, t, isNewUser = false) => {
  const errors = {};
  
  if (isNewUser && !password) {
    errors.password = t("ADD_USER.VALIDATION.PASSWORD_REQUIRED");
  } else if (password && password.length < 8) {
    errors.password = t("ADD_USER.VALIDATION.PASSWORD_TOO_SHORT");
  }
  
  if (password !== confirmPassword) {
    errors.confirmPassword = t("ADD_USER.VALIDATION.PASSWORDS_MISMATCH");
  }
  
  return errors;
};