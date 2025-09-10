// Club validation utilities
import { CreateClubData, UpdateClubData, CLUB_VALIDATION } from '@/types/club';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate club name
 */
export const validateClubName = (name: string): ValidationResult => {
  const errors: string[] = [];

  if (!name || name.trim().length === 0) {
    errors.push('클럽 이름을 입력해주세요.');
  } else {
    const trimmedName = name.trim();
    
    if (trimmedName.length < CLUB_VALIDATION.NAME_MIN_LENGTH) {
      errors.push(`클럽 이름은 최소 ${CLUB_VALIDATION.NAME_MIN_LENGTH}자 이상이어야 합니다.`);
    }
    
    if (trimmedName.length > CLUB_VALIDATION.NAME_MAX_LENGTH) {
      errors.push(`클럽 이름은 최대 ${CLUB_VALIDATION.NAME_MAX_LENGTH}자까지 가능합니다.`);
    }

    // Check for prohibited characters
    const prohibitedChars = /[<>\"'&]/;
    if (prohibitedChars.test(trimmedName)) {
      errors.push('클럽 이름에 특수문자 (<, >, ", \', &)는 사용할 수 없습니다.');
    }

    // Check for profanity (basic check)
    const profanityWords = ['욕설', '비속어', '나쁜말']; // Add more as needed
    if (profanityWords.some(word => trimmedName.toLowerCase().includes(word))) {
      errors.push('부적절한 단어가 포함되어 있습니다.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate club description
 */
export const validateClubDescription = (description: string): ValidationResult => {
  const errors: string[] = [];

  if (!description || description.trim().length === 0) {
    errors.push('클럽 설명을 입력해주세요.');
  } else {
    const trimmedDescription = description.trim();
    
    if (trimmedDescription.length > CLUB_VALIDATION.DESCRIPTION_MAX_LENGTH) {
      errors.push(`클럽 설명은 최대 ${CLUB_VALIDATION.DESCRIPTION_MAX_LENGTH}자까지 가능합니다.`);
    }

    // Check for prohibited content
    const prohibitedPatterns = [
      /https?:\/\/[^\s]+/gi, // URLs
      /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, // Email addresses
      /\b\d{2,3}-\d{3,4}-\d{4}\b/g, // Phone numbers
    ];

    prohibitedPatterns.forEach((pattern, index) => {
      if (pattern.test(trimmedDescription)) {
        const types = ['URL', '이메일 주소', '전화번호'];
        errors.push(`클럽 설명에 ${types[index]}를 포함할 수 없습니다.`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate club tags
 */
export const validateClubTags = (tags: string[]): ValidationResult => {
  const errors: string[] = [];

  if (tags.length > CLUB_VALIDATION.MAX_TAGS) {
    errors.push(`태그는 최대 ${CLUB_VALIDATION.MAX_TAGS}개까지 가능합니다.`);
  }

  // Check each tag
  tags.forEach((tag, index) => {
    const trimmedTag = tag.trim();
    
    if (trimmedTag.length === 0) {
      errors.push(`${index + 1}번째 태그가 비어있습니다.`);
    } else if (trimmedTag.length > CLUB_VALIDATION.TAG_MAX_LENGTH) {
      errors.push(`${index + 1}번째 태그가 너무 깁니다. (최대 ${CLUB_VALIDATION.TAG_MAX_LENGTH}자)`);
    }

    // Check for prohibited characters in tags
    const prohibitedChars = /[<>\"'&\s]/;
    if (prohibitedChars.test(trimmedTag)) {
      errors.push(`${index + 1}번째 태그에 사용할 수 없는 문자가 포함되어 있습니다.`);
    }
  });

  // Check for duplicate tags
  const uniqueTags = [...new Set(tags.map(tag => tag.trim().toLowerCase()))];
  if (uniqueTags.length !== tags.length) {
    errors.push('중복된 태그가 있습니다.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate max members
 */
export const validateMaxMembers = (maxMembers?: number): ValidationResult => {
  const errors: string[] = [];

  if (maxMembers !== undefined) {
    if (maxMembers < CLUB_VALIDATION.MIN_MEMBERS) {
      errors.push(`최대 멤버 수는 최소 ${CLUB_VALIDATION.MIN_MEMBERS}명 이상이어야 합니다.`);
    }

    if (maxMembers > CLUB_VALIDATION.MAX_MEMBERS_LIMIT) {
      errors.push(`최대 멤버 수는 ${CLUB_VALIDATION.MAX_MEMBERS_LIMIT}명을 초과할 수 없습니다.`);
    }

    if (!Number.isInteger(maxMembers) || maxMembers <= 0) {
      errors.push('최대 멤버 수는 양의 정수여야 합니다.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate create club data
 */
export const validateCreateClubData = (data: CreateClubData): ValidationResult => {
  const allErrors: string[] = [];

  // Validate club name
  const nameValidation = validateClubName(data.clubName);
  allErrors.push(...nameValidation.errors);

  // Validate description
  const descriptionValidation = validateClubDescription(data.description);
  allErrors.push(...descriptionValidation.errors);

  // Validate tags
  const tagsValidation = validateClubTags(data.tags);
  allErrors.push(...tagsValidation.errors);

  // Validate max members
  const maxMembersValidation = validateMaxMembers(data.maxMembers);
  allErrors.push(...maxMembersValidation.errors);

  // Validate settings
  if (data.settings) {
    if (data.settings.inactivityThresholdDays !== undefined) {
      if (data.settings.inactivityThresholdDays < 7 || data.settings.inactivityThresholdDays > 365) {
        allErrors.push('비활성 임계값은 7일에서 365일 사이여야 합니다.');
      }
    }
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
};

/**
 * Validate update club data
 */
export const validateUpdateClubData = (data: UpdateClubData): ValidationResult => {
  const allErrors: string[] = [];

  // Validate club name if provided
  if (data.clubName !== undefined) {
    const nameValidation = validateClubName(data.clubName);
    allErrors.push(...nameValidation.errors);
  }

  // Validate description if provided
  if (data.description !== undefined) {
    const descriptionValidation = validateClubDescription(data.description);
    allErrors.push(...descriptionValidation.errors);
  }

  // Validate tags if provided
  if (data.tags !== undefined) {
    const tagsValidation = validateClubTags(data.tags);
    allErrors.push(...tagsValidation.errors);
  }

  // Validate max members if provided
  if (data.maxMembers !== undefined) {
    const maxMembersValidation = validateMaxMembers(data.maxMembers);
    allErrors.push(...maxMembersValidation.errors);
  }

  // Validate settings if provided
  if (data.settings) {
    if (data.settings.inactivityThresholdDays !== undefined) {
      if (data.settings.inactivityThresholdDays < 7 || data.settings.inactivityThresholdDays > 365) {
        allErrors.push('비활성 임계값은 7일에서 365일 사이여야 합니다.');
      }
    }
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
};

/**
 * Sanitize club name
 */
export const sanitizeClubName = (name: string): string => {
  return name.trim().replace(/\s+/g, ' ');
};

/**
 * Sanitize club description
 */
export const sanitizeClubDescription = (description: string): string => {
  return description.trim().replace(/\s+/g, ' ');
};

/**
 * Sanitize club tags
 */
export const sanitizeClubTags = (tags: string[]): string[] => {
  return tags
    .map(tag => tag.trim().toLowerCase())
    .filter(tag => tag.length > 0)
    .filter((tag, index, array) => array.indexOf(tag) === index); // Remove duplicates
};

/**
 * Sanitize create club data
 */
export const sanitizeCreateClubData = (data: CreateClubData): CreateClubData => {
  return {
    ...data,
    clubName: sanitizeClubName(data.clubName),
    description: sanitizeClubDescription(data.description),
    tags: sanitizeClubTags(data.tags),
  };
};

/**
 * Sanitize update club data
 */
export const sanitizeUpdateClubData = (data: UpdateClubData): UpdateClubData => {
  const sanitized: UpdateClubData = { ...data };

  if (sanitized.clubName !== undefined) {
    sanitized.clubName = sanitizeClubName(sanitized.clubName);
  }

  if (sanitized.description !== undefined) {
    sanitized.description = sanitizeClubDescription(sanitized.description);
  }

  if (sanitized.tags !== undefined) {
    sanitized.tags = sanitizeClubTags(sanitized.tags);
  }

  return sanitized;
};