import { routerPolicy, Role } from "./router-policy";

/** Verifica se um role pode acessar uma rota:
 * 1. encontra a rota mais específica possível
 * 2. se não houver regra, então nega acesso
 * 3. se houver regra, valida se role está permitido      */
function normalizePath(path: string) {
  const clean = path.split("?")[0];
  return clean === "/" ? "/" : clean.replace(/\/+$/, "");
}

export function getMatchedRoute(pathname: string): string | null {
  const path = normalizePath(pathname);

  return (
    Object.keys(routerPolicy)
      .sort((a, b) => b.length - a.length)
      .find((route) => path === route || path.startsWith(route + "/")) ?? null
  );
}

export function canAccess(pathname: string, role: Role | null) {
  if (!role) return false;

  const matchedRoute = getMatchedRoute(pathname);

  if (!matchedRoute) return false;

  return routerPolicy[matchedRoute].includes(role);
}