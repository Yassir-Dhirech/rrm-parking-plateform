import client from "./client";

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiration: string;
}

export interface CurrentUserResponse {
  id: number;
  email: string;
  authorities: string[];
}

export async function login(
  email: string,
  motDePasse: string,
): Promise<LoginResponse> {
  const response = await client.post<LoginResponse>("/v1/auth/login", {
    email,
    motDePasse,
  });

  localStorage.setItem("token", response.data.accessToken);

  return response.data;
}

export async function getCurrentUser(): Promise<CurrentUserResponse> {
  const response =
    await client.get<CurrentUserResponse>("/v1/auth/me");

  return response.data;
}