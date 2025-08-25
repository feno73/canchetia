// Validation utilities for forms

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Email validation
export const validateEmail = (email: string): ValidationResult => {
  if (!email.trim()) {
    return { isValid: false, error: 'El correo electrónico es requerido' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'El formato del correo electrónico no es válido' };
  }
  
  return { isValid: true };
};

// Password validation
export const validatePassword = (password: string): ValidationResult => {
  if (!password.trim()) {
    return { isValid: false, error: 'La contraseña es requerida' };
  }
  
  if (password.length < 8) {
    return { isValid: false, error: 'La contraseña debe tener al menos 8 caracteres' };
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, error: 'La contraseña debe contener al menos una letra minúscula' };
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, error: 'La contraseña debe contener al menos una letra mayúscula' };
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, error: 'La contraseña debe contener al menos un número' };
  }
  
  return { isValid: true };
};

// Password confirmation validation
export const validatePasswordConfirmation = (password: string, confirmPassword: string): ValidationResult => {
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Las contraseñas no coinciden' };
  }
  
  return { isValid: true };
};

// Name validation
export const validateName = (name: string, fieldName: string = 'nombre'): ValidationResult => {
  if (!name.trim()) {
    return { isValid: false, error: `El ${fieldName} es requerido` };
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, error: `El ${fieldName} debe tener al menos 2 caracteres` };
  }
  
  if (name.trim().length > 50) {
    return { isValid: false, error: `El ${fieldName} no puede tener más de 50 caracteres` };
  }
  
  return { isValid: true };
};

// Phone validation (optional field)
export const validatePhone = (phone: string): ValidationResult => {
  if (!phone.trim()) {
    return { isValid: true }; // Optional field
  }
  
  // Basic phone validation for Argentina format
  const phoneRegex = /^(\+54|0)?[\s\-]?(\d{2,4})[\s\-]?\d{3,4}[\s\-]?\d{3,4}$/;
  if (!phoneRegex.test(phone)) {
    return { isValid: false, error: 'El formato del teléfono no es válido (ej: +54 11 1234-5678)' };
  }
  
  return { isValid: true };
};

// Login form validation
export const validateLoginForm = (email: string, password: string): ValidationResult => {
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    return emailValidation;
  }
  
  if (!password.trim()) {
    return { isValid: false, error: 'La contraseña es requerida' };
  }
  
  return { isValid: true };
};

// Register form validation
export const validateRegisterForm = (data: {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  confirmPassword: string;
  telefono?: string;
}): ValidationResult => {
  const nameValidation = validateName(data.nombre, 'nombre');
  if (!nameValidation.isValid) {
    return nameValidation;
  }
  
  const lastNameValidation = validateName(data.apellido, 'apellido');
  if (!lastNameValidation.isValid) {
    return lastNameValidation;
  }
  
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) {
    return emailValidation;
  }
  
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.isValid) {
    return passwordValidation;
  }
  
  const confirmPasswordValidation = validatePasswordConfirmation(data.password, data.confirmPassword);
  if (!confirmPasswordValidation.isValid) {
    return confirmPasswordValidation;
  }
  
  if (data.telefono) {
    const phoneValidation = validatePhone(data.telefono);
    if (!phoneValidation.isValid) {
      return phoneValidation;
    }
  }
  
  return { isValid: true };
};