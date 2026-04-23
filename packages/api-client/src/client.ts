// ── HTTP API Client ──

import type { ApiResponse, PaginatedResponse } from "@questboard/types";

export interface ApiClientConfig {
  baseUrl: string;
  getToken?: () => Promise<string | null>;
  /** Cabeçalhos adicionais enviados em todas as requisições (ex.: x-user-id em dev). */
  defaultHeaders?: () => Record<string, string>;
}

export class ApiClient {
  private baseUrl: string;
  private getToken: (() => Promise<string | null>) | undefined;
  private defaultHeaders: (() => Record<string, string>) | undefined;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.getToken = config.getToken;
    this.defaultHeaders = config.defaultHeaders;
  }

  private async headers(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(this.defaultHeaders ? this.defaultHeaders() : {}),
    };
    if (this.getToken) {
      const token = await this.getToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return headers;
  }

  async get<T>(path: string, options?: { signal?: AbortSignal }): Promise<ApiResponse<T>> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "GET",
      headers: await this.headers(),
      signal: options?.signal,
    });
    return res.json() as Promise<ApiResponse<T>>;
  }

  async post<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: await this.headers(),
      body: body ? JSON.stringify(body) : undefined,
    });
    return res.json() as Promise<ApiResponse<T>>;
  }

  async put<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "PUT",
      headers: await this.headers(),
      body: body ? JSON.stringify(body) : undefined,
    });
    return res.json() as Promise<ApiResponse<T>>;
  }

  async patch<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "PATCH",
      headers: await this.headers(),
      body: body ? JSON.stringify(body) : undefined,
    });
    return res.json() as Promise<ApiResponse<T>>;
  }

  async delete<T>(path: string): Promise<ApiResponse<T>> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "DELETE",
      headers: await this.headers(),
    });
    return res.json() as Promise<ApiResponse<T>>;
  }

  async getPaginated<T>(path: string): Promise<PaginatedResponse<T>> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "GET",
      headers: await this.headers(),
    });
    return res.json() as Promise<PaginatedResponse<T>>;
  }
}
