import { ApiError } from '@/new-services/poo/shared/api/client';

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
        return 'Dados inválidos. Verifique e tente novamente.';
      case 401:
        return 'Sua sessão expirou. Faça login novamente.';
      case 403:
        return typeof error.body === 'object' && error.body && 'message' in error.body
          ? String(error.body.message)
          : 'Você não tem permissão para acessar este conteúdo.';
      case 404:
        return 'Conteúdo não encontrado.';
      case 409:
        return typeof error.body === 'object' && error.body && 'message' in error.body
          ? String(error.body.message)
          : 'Limite de tentativas atingido.';
      case 500:
        return 'Erro interno do servidor. Tente novamente mais tarde.';
      default:
        return typeof error.body === 'object' && error.body && 'message' in error.body
          ? String(error.body.message)
          : `Erro ${error.status}: não foi possível completar a ação.`;
    }
  }

  if (error instanceof Error && error.message?.includes('Network Error')) {
    return 'Erro de conexão. Verifique sua internet.';
  }

  return error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
}
