import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { string } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getToken(): string | null {
  if (typeof window === 'undefined') {
    console.log("getToken: window is undefined, returning null.");
    return null;
  }
  const token = localStorage.getItem('token');
  console.log("getToken: Retrieved token from localStorage:", token);
  return token;
}

export function setToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
    console.log("setToken: Token set in localStorage:", token);
  } else {
    console.log("setToken: window is undefined, cannot set token.");
  }
}

export function removeToken(): void {
  localStorage.removeItem('token');
  console.log("removeToken: Token removed from localStorage.");
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') {
    console.log("getRefreshToken: window is undefined, returning null.");
    return null;
  }
  const refreshToken = localStorage.getItem('refreshToken');
  console.log("getRefreshToken: Retrieved refresh token from localStorage:", refreshToken);
  return refreshToken;
}

export function setRefreshToken(refreshToken: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('refreshToken', refreshToken);
    console.log("setRefreshToken: Refresh token set in localStorage:", refreshToken);
  } else {
    console.log("setRefreshToken: window is undefined, cannot set refresh token.");
  }
}
export function removeRefreshToken():void{
  localStorage.removeItem('refreshToken')
  console.log("removeRefreshToken: Refresh token removed from localStorage.")
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function getUsername(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('username');
  }
  return null;
}
export function setUsername(username: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('username', username);
  }
}
export function removeUsername(): void {
  localStorage.removeItem('username');
}