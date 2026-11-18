/**
 * Client HTTP commun : URL de base, types partagés et apiRequest.
 * Les appels par domaine sont dans les fichiers voisins (auth, events…).
 */

const getApiBaseUrl = () => {
  if (typeof window === "undefined" && process.env.API_INTERNAL_URL) {
    return process.env.API_INTERNAL_URL;
  }

  return (
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    process.env.NEXT_PUBLIC_API_ENDPOINT ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3001"
  );
};

export const API_BASE_URL = getApiBaseUrl();

// Helper pour les requêtes
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiRequestOptions {
  headers?: Record<string, string>;
  body?: unknown;
  fetchOptions?: RequestInit;
}
export type ApiResponse<T = unknown> =
  | {
      success: true;
      message?: string;
      data: T;
      error?: string;
    }
  | {
      success: false;
      message?: string;
      error: string;
      data?: T;
    };

// interface string {
//   token: string;
// }

export interface IdTokenParam {
  id: number;
  token: string;
}

export interface UnsubscribeParticipantParam extends IdTokenParam {
  eventId?: number;
  reason?: string;
}

export interface EventTokenParam {
  eventId: number;
  token: string;
  quantity?: number;
}

export interface QrCodeTokenParam {
  qrCode: string;
  eventId: number;
  token: string;
}

export interface FormTokenParam {
  formData: FormData;
  token: string;
}

export interface GetAllParams {
  page?: number;
  search?: string;
  location?: string;
  category?: string;
  filter?: string;
}
export interface NotificationParams {
  token: string;
  limit?: number;
  skip?: number;
}
export interface NotificationAction {
  notificationId: string | number;
  token: string;
}

export interface PaymentParam {
  eventid: number;
  token: string;
}

export interface PaginationParams {
  skip?: number;
  take?: number;
}

export const apiRequest = async <T = unknown>(
  method: HttpMethod,
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> => {
  const url = `${API_BASE_URL}/api${endpoint}`;

  const headers =
    options.body instanceof FormData
      ? {
          ...options.headers,
        }
      : {
          "Content-Type": "application/json",
          ...options.headers,
        };

  try {
    const response = await fetch(url, {
      method,
      headers,
      credentials: "include",
      body:
        options.body instanceof FormData
          ? options.body
          : options.body
            ? JSON.stringify(options.body)
            : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erreur API");
    }

    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";

    return {
      success: false,
      error: message,
    };
  }
};

// =====================================================
