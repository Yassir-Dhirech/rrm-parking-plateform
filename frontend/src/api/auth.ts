import client from "./client";

export interface LoginResponse {
  token: string;
  role: string;
}

export async function login(email: string, motDePasse: string): Promise<LoginResponse> {
  const response = await client.post<LoginResponse>("/auth/login", {
    email,
    motDePasse,
  });
  return response.data;
}