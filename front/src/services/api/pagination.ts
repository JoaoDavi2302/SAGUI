import { apiFetch } from "./client";

interface PageResponse<T> {
  content: T[];
  totalPages: number;
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
    totalPages = data.totalPages ?? 1;
    page += 1;
  }

  return items;
}
