/** Validação alinhada ao RegisterRequest do backend. */
export const REGISTER_LIMITS = {
  nameMax: 100,
  emailMax: 200,
  passwordMin: 6,
  addressMax: 300,
} as const;

export type RegisterField =
  | "name"
  | "email"
  | "password"
  | "confirmPassword"
  | "birthDate"
  | "address";

export type RegisterFieldErrors = Partial<Record<RegisterField, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegisterForm(input: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthDate: string;
  address: string;
}): RegisterFieldErrors {
  const errors: RegisterFieldErrors = {};
  const name = input.name.trim();
  const email = input.email.trim();
  const address = input.address.trim();

  if (!name) {
    errors.name = "Nome é Obrigatório";
  } else if (name.length > REGISTER_LIMITS.nameMax) {
    errors.name = `Nome deve ter no máximo ${REGISTER_LIMITS.nameMax} caracteres`;
  }

  if (!email) {
    errors.email = "Email é Obrigatório";
  } else if (email.length > REGISTER_LIMITS.emailMax) {
    errors.email = `Email deve ter no máximo ${REGISTER_LIMITS.emailMax} caracteres`;
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Email Inválido";
  }

  if (!input.password) {
    errors.password = "Senha é Obrigatória";
  } else if (input.password.length < REGISTER_LIMITS.passwordMin) {
    errors.password = "Senha deve ter mais de 6 caracteres";
  }

  if (!input.confirmPassword) {
    errors.confirmPassword = "Confirme sua senha";
  } else if (input.password !== input.confirmPassword) {
    errors.confirmPassword = "As senhas não coincidem";
  }

  if (input.birthDate) {
    const parsed = new Date(`${input.birthDate}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) {
      errors.birthDate = "Data de nascimento inválida";
    } else if (parsed >= new Date()) {
      errors.birthDate = "Data de nascimento inválida";
    }
  }

  if (address.length > REGISTER_LIMITS.addressMax) {
    errors.address = `Endereço deve ter no máximo ${REGISTER_LIMITS.addressMax} caracteres`;
  }

  return errors;
}

export function mapApiFieldErrors(
  fields: { field: string; message: string }[] | undefined,
): RegisterFieldErrors {
  if (!fields?.length) return {};

  const mapped: RegisterFieldErrors = {};

  for (const item of fields) {
    if (
      item.field === "name" ||
      item.field === "email" ||
      item.field === "password" ||
      item.field === "birthDate" ||
      item.field === "address"
    ) {
      mapped[item.field] = item.message;
    }
  }

  return mapped;
}
