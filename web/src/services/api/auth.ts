import { apiFetch } from "./client";
import {
  GoogleLoginRequest,
  JwtResponse,
  LoginRequest,
  RegisterRequest,
  TiktokLoginRequest,
  UserResponse,
} from "@/types/api";

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

export function loginWithGoogle(data: GoogleLoginRequest) {
  return apiFetch<JwtResponse>("/api/auth/google", {
    method: "POST",
    body: JSON.stringify(data),
    auth: false,
  });
}

export function loginWithTiktok(data: TiktokLoginRequest) {
  return apiFetch<JwtResponse>("/api/auth/tiktok", {
    method: "POST",
    body: JSON.stringify(data),
    auth: false,
  });
}
