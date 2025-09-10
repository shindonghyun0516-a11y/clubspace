// Input validation utilities for authentication
import { SignUpData } from '@/types/auth';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate email address format
 */
export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!email) {
    errors.push('이메일은 필수입니다.');
  } else {
    // Basic email regex pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('유효한 이메일 주소를 입력해주세요.');
    }
    
    // Check email length
    if (email.length > 254) {
      errors.push('이메일 주소가 너무 깁니다.');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('비밀번호는 필수입니다.');
  } else {
    // Minimum length check
    if (password.length < 6) {
      errors.push('비밀번호는 6자 이상이어야 합니다.');
    }
    
    // Maximum length check
    if (password.length > 128) {
      errors.push('비밀번호는 128자 이하여야 합니다.');
    }
    
    // Strength requirements (optional - can be made stricter)
    if (password.length >= 8) {
      let strengthScore = 0;
      
      // Check for lowercase
      if (/[a-z]/.test(password)) strengthScore++;
      
      // Check for uppercase
      if (/[A-Z]/.test(password)) strengthScore++;
      
      // Check for numbers
      if (/\d/.test(password)) strengthScore++;
      
      // Check for special characters
      if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strengthScore++;
      
      // Weak password warning (not an error, just a warning)
      if (strengthScore < 2) {
        errors.push('더 강한 비밀번호를 권장합니다. (대소문자, 숫자, 특수문자 조합)');
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate display name
 */
export const validateDisplayName = (displayName: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!displayName) {
    errors.push('이름은 필수입니다.');
  } else {
    // Trim whitespace for validation
    const trimmedName = displayName.trim();
    
    if (trimmedName.length < 2) {
      errors.push('이름은 2자 이상이어야 합니다.');
    }
    
    if (trimmedName.length > 50) {
      errors.push('이름은 50자 이하여야 합니다.');
    }
    
    // Check for invalid characters (optional - adjust based on requirements)
    const invalidCharsRegex = /[<>\"'&]/;
    if (invalidCharsRegex.test(trimmedName)) {
      errors.push('이름에는 특수문자 (<, >, ", \', &)를 사용할 수 없습니다.');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate complete sign-up data
 */
export const validateSignUpData = (data: SignUpData): ValidationResult => {
  const errors: string[] = [];
  
  // Validate each field
  const emailValidation = validateEmail(data.email);
  const passwordValidation = validatePassword(data.password);
  const nameValidation = validateDisplayName(data.displayName);
  
  // Collect all errors
  errors.push(...emailValidation.errors);
  errors.push(...passwordValidation.errors);
  errors.push(...nameValidation.errors);
  
  // Check password confirmation
  if (data.password !== data.confirmPassword) {
    errors.push('비밀번호가 일치하지 않습니다.');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate sign-in data
 */
export const validateSignInData = (email: string, password: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!email) {
    errors.push('이메일은 필수입니다.');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('유효한 이메일 주소를 입력해주세요.');
  }
  
  if (!password) {
    errors.push('비밀번호는 필수입니다.');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate password reset email
 */
export const validatePasswordResetEmail = (email: string): ValidationResult => {
  return validateEmail(email);
};

/**
 * Check password strength level
 */
export const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  if (!password || password.length < 6) {
    return 'weak';
  }
  
  let score = 0;
  
  // Length bonus
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  
  // Character variety
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;
  
  if (score < 3) return 'weak';
  if (score < 5) return 'medium';
  return 'strong';
};

/**
 * Sanitize user input (remove harmful characters)
 */
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>\"'&]/g, '') // Remove potentially harmful characters
    .substring(0, 1000); // Limit length to prevent abuse
};

/**
 * Check if email domain is allowed (optional - for enterprise use)
 */
export const isAllowedEmailDomain = (email: string, allowedDomains?: string[]): boolean => {
  if (!allowedDomains || allowedDomains.length === 0) {
    return true; // Allow all domains if no restrictions
  }
  
  const domain = email.split('@')[1]?.toLowerCase();
  return allowedDomains.some(allowedDomain => 
    domain === allowedDomain.toLowerCase()
  );
};