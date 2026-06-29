import { Platform } from 'react-native'

function resolverApiUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL
  if (Platform.OS === 'android') return 'http://10.0.2.2:3333'
  return 'http://localhost:3333'
}

const API_URL = resolverApiUrl()

export class ApiError extends Error {}

async function request<T>(
  path: string,
  options: { method?: string; body?: object; token?: string } = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new ApiError(data.message ?? 'Erro inesperado, tente novamente')
  }

  return data as T
}

export const api = {
  post: <T>(path: string, body: object, token?: string) =>
    request<T>(path, { method: 'POST', body, token }),
  patch: <T>(path: string, body: object, token?: string) =>
    request<T>(path, { method: 'PATCH', body, token }),
  get: <T>(path: string, token?: string) => request<T>(path, { token }),
  delete: <T>(path: string, token?: string) =>
    request<T>(path, { method: 'DELETE', token }),
}
