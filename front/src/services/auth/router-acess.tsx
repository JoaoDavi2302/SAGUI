import { isAdminPanelRoute, routerPolicy, Role } from "./router-policy";

/** Verifica se um role pode acessar uma rota:
 * 1. encontra a rota mais específica possível
 * 2. se não houver regra, então nega acesso
 * 3. se houver regra, valida se role está permitido      */
function normalizePath(path: string) {
  const clean = path.split("?")[0];
  return clean === "/" ? "/" : clean.replace(/\/+$/, "");
}

export function canAccess(pathname: string, role: Role | null) {
  if (!role) return false;

  const path = normalizePath(pathname);

  if (role === "ADMIN") {
    return isAdminPanelRoute(path);
  }

  const matchedRoute = Object.keys(routerPolicy)
    .sort((a, b) => b.length - a.length)
    .find((route) => path === route || path.startsWith(route + "/"));

  if (!matchedRoute) return false;

  return routerPolicy[matchedRoute].includes(role);
}