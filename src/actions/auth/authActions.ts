"use server";
// import { fetchRestFull } from "../../services/fetchRestFull";
import { auth } from "../../services/api";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
// import { updateSocketAuth } from "@/socket";
import type {
  ActionResponse,
  ServerActionState,
  GetUserResponse,
  GetAllUsersResponse,
  RegisterDto,
  LoginDto,
  EditUserDto,
  Role,
} from "@/actions/types/auth";

const getFormString = (formData: FormData, key: string): string => {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
};

const isRole = (value: string): value is Role =>
  ["ADMIN", "ORGANISATEUR", "PARTICIPANT"].includes(value);

const isImageFile = (value: FormDataEntryValue | null): value is File => {
  if (!(value instanceof File) || value.size === 0) {
    return false;
  }

  return ["image/jpeg", "image/png"].includes(value.type);
};

const setAuthCookies = async (
  token: string,
  refreshToken: string,
): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60,
  });
  cookieStore.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
};

export async function register(
  _state: ServerActionState,
  formData: FormData,
): Promise<ActionResponse> {
  const role = getFormString(formData, "role");
  const photo = formData.get("photo");

  const user: RegisterDto = {
    nom: getFormString(formData, "nom"),
    prenom: getFormString(formData, "prenom"),
    email: getFormString(formData, "email"),
    password: getFormString(formData, "password"),
    passwordConfime: getFormString(formData, "passwordConfime"),
    role: isRole(role) ? role : "PARTICIPANT",
    date_naissance: getFormString(formData, "date_naissance"),
    photo: photo instanceof File ? photo : new File([], ""),
  };

  if (
    !user.nom ||
    !user.prenom ||
    !user.email ||
    !user.password ||
    !user.passwordConfime ||
    !isRole(role) ||
    !user.date_naissance ||
    !isImageFile(photo)
  ) {
    return {
      error: true,
      message: "Veuillez remplir tous les champs.",
    };
  }

  if (user.password !== user.passwordConfime) {
    return {
      error: true,
      message: "Les mots de passe ne correspondent pas.",
    };
  }

  const sendData = new FormData();
  sendData.append("nom", user.nom);
  sendData.append("prenom", user.prenom);
  sendData.append("email", user.email);
  sendData.append("password", user.password);
  sendData.append("role", user.role);
  sendData.append("photo", photo);
  sendData.append("date_naissance", user.date_naissance);

  try {
    const response = await auth.register(sendData);

    if (response.success) {
      await setAuthCookies(response.data.token, response.data.refreshToken);

      return {
        error: false,
        message: response.data.message,
        redirect: "/events",
      };
    }

    return {
      error: true,
      message: response.error,
    };
  } catch (error) {
    const err = error as Error;

    return {
      error: true,
      message: err.message,
    };
  }
}

export async function login(
  _state: ServerActionState,
  formData: FormData,
): Promise<ActionResponse> {
  const user: LoginDto = {
    email: getFormString(formData, "email"),
    password: getFormString(formData, "password"),
  };

  if (!user.email || !user.password) {
    return {
      error: true,
      message: "Please fill in all fields.",
    };
  }

  try {
    const res = await auth.login(user.email, user.password);

    if (!res.success) {
      return {
        error: true,
        message: res.error,
      };
    }

    await setAuthCookies(res.data.token, res.data.refreshToken);
    return {
      error: false,
      message: res.data.message,
      redirect: "/events",
    };
  } catch (error) {
    const err = error as Error;
    return {
      error: true,
      message: `Error: ${err.message}`,
    };
  }
}

export async function forgotPassword(
  _state: ServerActionState,
  formData: FormData,
): Promise<ActionResponse> {
  const email = getFormString(formData, "email");

  if (!email) {
    return {
      error: true,
      message: "Veuillez saisir votre adresse e-mail.",
    };
  }

  const response = await auth.forgotPassword(email);

  if (!response.success) {
    return {
      error: true,
      message: response.error,
    };
  }

  return {
    error: false,
    message:
      (response.data as { message?: string }).message ||
      "Un e-mail de réinitialisation vous a été envoyé.",
  };
}

export async function resetPassword(
  _state: ServerActionState,
  formData: FormData,
): Promise<ActionResponse> {
  const token = getFormString(formData, "token");
  const password = getFormString(formData, "password");
  const passwordConfirmation = getFormString(formData, "passwordConfirmation");

  if (!token) {
    return {
      error: true,
      message: "Le lien de réinitialisation est invalide ou incomplet.",
    };
  }

  if (password.length < 8) {
    return {
      error: true,
      message: "Le mot de passe doit contenir au moins 8 caractères.",
    };
  }

  if (password !== passwordConfirmation) {
    return {
      error: true,
      message: "Les mots de passe ne correspondent pas.",
    };
  }

  const response = await auth.resetPassword(password, token);

  if (!response.success) {
    return {
      error: true,
      message: response.error,
    };
  }

  return {
    error: false,
    message:
      (response.data as { message?: string }).message ||
      "Votre mot de passe a été modifié.",
    redirect: "/auth/login",
  };
}

export async function changeCurrentPassword(
  password: string,
): Promise<ActionResponse> {
  if (password.length < 8) {
    return {
      error: true,
      message: "Le mot de passe doit contenir au moins 8 caractères.",
    };
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || (await refreshAccessToken());

  if (!token) {
    return {
      error: true,
      message: "Votre session a expiré. Veuillez vous reconnecter.",
    };
  }

  const response = await auth.resetPassword(password, token);

  if (!response.success) {
    return {
      error: true,
      message: response.error || "Impossible de modifier le mot de passe.",
    };
  }

  return {
    error: false,
    message:
      (response.data as { message?: string }).message ||
      "Votre mot de passe a été modifié.",
  };
}

export async function deleteCurrentAccount(): Promise<ActionResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || (await refreshAccessToken());

  if (!token) {
    return {
      error: true,
      message: "Votre session a expiré. Veuillez vous reconnecter.",
    };
  }

  const response = await auth.deleteAccount(token);

  if (!response.success) {
    return {
      error: true,
      message: response.error || "Impossible de supprimer votre compte.",
    };
  }

  cookieStore.delete("token");
  cookieStore.delete("refreshToken");

  return {
    error: false,
    message: "Votre compte a été supprimé.",
  };
}

export async function editProfil(
  _state: ServerActionState,
  formData: FormData,
): Promise<ActionResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return {
      error: true,
      message: "Utilisateur non authentifié",
    };
  }

  const role = getFormString(formData, "role");
  const photo = formData.get("photo");
  const editUser: EditUserDto = {
    nom: getFormString(formData, "nom"),
    prenom: getFormString(formData, "prenom"),
    role: isRole(role) ? role : undefined,
    date_naissance: getFormString(formData, "date_naissance"),
    photo: isImageFile(photo) ? photo : undefined,
  };

  const sendData = new FormData();
  sendData.append("nom", editUser.nom || "");
  sendData.append("prenom", editUser.prenom || "");
  sendData.append("role", editUser.role || "");
  sendData.append("date_naissance", editUser.date_naissance || "");

  if (editUser.photo) {
    sendData.append("photo", editUser.photo);
  }

  try {
    const response = await auth.updateProfile({ formData: sendData, token });

    if (!response.success) {
      return {
        error: true,
        message: response.error,
      };
    }

    return {
      error: false,
      message: "Profil mis à jour avec succès.",
      redirect: "/settings",
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur réseau inconnue";
    return {
      error: true,
      message,
    };
  }
}
export async function getUser(): Promise<GetUserResponse | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return null;
  }

  try {
    const result = await auth.getProfile(token);

    if (result.success) {
      return {
        error: false,
        message: result.data.message,
        user: result.data.data,
      };
    }

    return {
      error: true,
      message: result.error,
      user: null,
    };
  } catch (error) {
    const err = error as Error;
    return {
      error: true,
      message: `Error: ${err.message}`,
      user: null,
    };
  }
}
export async function getAllUser(): Promise<GetAllUsersResponse | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return null;
  }

  try {
    const response = await auth.getAllUsers(token);

    if (response.success) {
      return {
        error: false,
        message: response.data.message,
        user: response.data.data,
      };
    }

    return {
      error: true,
      message: response.error,
      user: null,
    };
  } catch (error) {
    const err = error as Error;
    return {
      error: true,
      message: `Error: ${err.message}`,
      user: null,
    };
  }
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (refreshToken) {
    await auth.logout(refreshToken);
  }

  cookieStore.delete("token");
  cookieStore.delete("refreshToken");

  redirect("/auth/login");
}

export async function refreshAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) {
    return null;
  }

  const response = await auth.refresh(refreshToken);

  if (!response.success) {
    cookieStore.delete("token");
    cookieStore.delete("refreshToken");
    return null;
  }

  await setAuthCookies(response.data.token, response.data.refreshToken);
  return response.data.token;
}

export async function getTokenFromCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get("token")?.value;
}
export async function setTokenInCookie(
  token: string,
  refreshToken?: string,
): Promise<void> {
  if (refreshToken) {
    await setAuthCookies(token, refreshToken);
    return;
  }

  const cookieStore = await cookies();
  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60,
  });
}
