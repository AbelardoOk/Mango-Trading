import { apiFetch } from "./client";
import { JwtResponse, LoginRequest, RegisterRequest, UserResponse } from "@/types/api";

export function register(data: RegisterRequest) {
  return apiFetch<UserResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
    auth: false,
  });
}

export function login(data: LoginRequest) {
  return apiFetch<JwtResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
    auth: false,
  });
}
