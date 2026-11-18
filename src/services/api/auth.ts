import type {
  AuthApiResponse,
  ProfileApiResponse,
  UsersApiResponse,
} from "@/actions/types/auth";
import { API_BASE_URL, apiRequest } from "./client";
import type { ApiResponse, FormTokenParam } from "./client";

// AUTH API
// =====================================================

export const auth = {
  /**
   * Enregistrer un nouvel utilisateur
   * @param {FormData} formData - FormData avec nom, prenom, email, password, role, date_naissance, photo
   */
  register: async (
    formData: FormData,
  ): Promise<ApiResponse<AuthApiResponse>> => {
    const url = `${API_BASE_URL}/api/auth/register`;

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData, // FormData, pas JSON
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur enregistrement");
      }

      // Le jeton n'est pas stocké ici : les server actions le placent dans des
      // cookies httpOnly (voir actions/auth/authActions.ts).

      return { success: true, data: data as AuthApiResponse };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erreur inconnue";

      return {
        success: false,
        error: message,
      };
    }
  },

  /**
   * Se connecter
   * @param {string} email
   * @param {string} password
   */
  login: async (email: string, password: string) => {
    const result = await apiRequest<AuthApiResponse>("POST", "/auth/login", {
      body: { email, password },
    });

    return result;
  },

  refresh: async (refreshToken: string) => {
    return apiRequest<AuthApiResponse>("POST", "/auth/refresh", {
      body: { refreshToken },
    });
  },

  logout: async (refreshToken: string) => {
    return apiRequest("POST", "/auth/logout", {
      body: { refreshToken },
    });
  },

  /**
   * Vérifier l'email
   */
  verifyEmail: async (token: string) => {
    return apiRequest("GET", "/auth/emailVerify", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  /**
   * Demander réinitialisation de mot de passe
   * @param {string} email
   */
  forgotPassword: async (email: string) => {
    return apiRequest("POST", "/auth/password/forgot", {
      body: { email },
    });
  },

  /**
   * Réinitialiser le mot de passe
   * @param {Object} params - { email, newPassword, token }
   */
  resetPassword: async (password: string, token: string) => {
    return apiRequest("PATCH", "/auth/password/reset", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: { password },
    });
  },

  /**
   * Changer le mot de passe (authentifié)
   * @param {Object} params - { oldPassword, newPassword }
   */
  changePassword: async (oldPassword: string, newPassword: string) => {
    return apiRequest("POST", "/auth/change-password", {
      body: { oldPassword, newPassword },
    });
  },

  /**
   * Récupérer mon profil
   */
  getProfile: async (token: string) => {
    return apiRequest<ProfileApiResponse>("GET", "/auth/me", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  /**
   * Mettre à jour le profil
   * @param {FormData} formData
   */
  updateProfile: async ({
    formData,
    token,
  }: FormTokenParam): Promise<ApiResponse<unknown>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/editProfil`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur mise à jour");
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erreur inconnue";

      return {
        success: false,
        error: message,
      };
    }
  },

  /**
   * Récupérer tous les utilisateurs (ADMIN)
   */
  getAllUsers: async (token: string) => {
    return apiRequest<UsersApiResponse>("GET", "/auth/all", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * Supprimer mon compte
   */
  deleteAccount: async (token: string) => {
    return apiRequest("DELETE", "/auth/me", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  /**
   * Se déconnecter
   */
};

// =====================================================
