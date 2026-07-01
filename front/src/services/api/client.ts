import { getCookie } from "./cookies";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export class ApiError extends Error {
    status: number;
    constructor(status: number, message: string){
        super(message);
        this.status = status;
    }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = getCookie("token");
    const headers = new Headers(options.headers);

    headers.set("Content-Type", "application/json");
    
    if(token) headers.set("Authorization", `Bearer ${token}`);

    const res = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers
    });

    if(!res.ok){
        let message = "Erro na requisição";
        try{
            const body = await res.json();
            message = body.message ?? message;
        } catch {
            // ignora falhas ao interpretar o json
            // se o back n retornar um corpo válido, mantem a mensagem padrão de erro
        }
        throw new ApiError(res.status, message);
    }

    if(res.status == 204) return undefined as T;

    return res.json() as Promise<T>
}