import { apiFetch } from "../api/client";
import { components } from "../types/api-schema";

export type LoginResponseDTO = components["schemas"]["LoginResponse"];
export type UserProfileResponseDTO = components["schemas"]["UserProfileResponse"];

export function LoginRequest(email:string, password:string){
    return apiFetch<LoginResponseDTO>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({email, password})
    });
}

export function getMyProfile(){
    return apiFetch<UserProfileResponseDTO>("/api/users/me");
}

export function logoutRequest(refreshToken: string){
    return apiFetch<void>("/api/auth/logout", {
        method: "POST",
        body: JSON.stringify({refreshToken})
    })
}