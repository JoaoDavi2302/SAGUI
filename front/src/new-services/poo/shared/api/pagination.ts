import { apiFetch } from "./client";

interface PageResponse<T> {
  content?: T[];
  totalPages?: number;
  totalElements?: number;
  /** Spring Boot 3.3+/4 pode aninhar metadados em `page`; DTOs do front usam `page` como índice. */
  page?: number | {
    totalPages?: number;
    totalElements?: number;
    size?: number;
    number?: number;
  };
}

function readPageMeta(data: PageResponse<unknown>) {
  return typeof data.page === "object" && data.page !== null ? data.page : undefined;
}

/** Lê totalElements tanto no formato clássico do Page quanto no aninhado (Spring Boot 3.3+/4). */
export function resolveTotalElements(data: PageResponse<unknown>): number {
  const nested = readPageMeta(data);
  const total = data.totalElements ?? nested?.totalElements ?? 0;
  return Number.isFinite(total) ? total : 0;
}

function resolveTotalPages(data: PageResponse<unknown>): number {
  const nested = readPageMeta(data);
  const totalPages = data.totalPages ?? nested?.totalPages ?? 1;
  return Number.isFinite(totalPages) && totalPages > 0 ? totalPages : 1;
}

export async function fetchAllPages<T>(
  path: string,
  params: Record<string, string> = {},
): Promise<T[]> {
  const items: T[] = [];
  let page = 0;
  let totalPages = 1;

  while (page < totalPages) {
    const searchParams = new URLSearchParams({
      ...params,
      page: String(page),
      size: "100",
    });

    const data = await apiFetch<PageResponse<T>>(`${path}?${searchParams}`);
    items.push(...(data.content ?? []));
    totalPages = resolveTotalPages(data);
    page += 1;
  }

  return items;
}
