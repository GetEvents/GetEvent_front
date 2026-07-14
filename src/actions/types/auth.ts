export type Role = "ADMIN" | "ORGANISATEUR" | "PARTICIPANT";

export interface User {
  id: number;
  nom: string;
  prenom: string;
  photo?: string | null;
  date_naissance?: string | null;
  email: string;
  numero?: string | null;
  pays?: string | null;
  password?: string | null;
  email_verified?: boolean | null;
  verification_token?: string | null;
  datetime?: string | null;
  role: Role;
  stripeCustomerId?: string | null;
  organizerStripeAccountId?: string | null;
}
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  nom: string;
  prenom: string;
  email: string;
  numero?: string;
  pays?: string;
  password: string;
  passwordConfime: string;
  role: Role;
  date_naissance: string;
  photo: File;
}

export interface EditUserDto {
  nom?: string;
  prenom?: string;
  numero?: string;
  pays?: string;
  role?: Role;
  date_naissance?: string;
  photo?: File;
}

export interface ActionResponse {
  error: boolean;
  message: string;
  redirect?: string;
  user?: User;
}

export type ServerActionState = ActionResponse | null;

export type GetUserResponse =
  | {
      error: false;
      message: string;
      user: User | null;
    }
  | {
      error: true;
      message: string;
      user: User | null;
    };

export type GetAllUsersResponse =
  | {
      error: false;
      message: string;
      user: User[];
    }
  | {
      error: true;
      message: string;
      user: null;
    };

export interface AuthApiResponse {
  token: string;
  refreshToken: string;
  message: string;
}

export interface ProfileApiResponse {
  error?: string;
  message: string;
  data: User;
}

export interface UsersApiResponse {
  message: string;
  data: User[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error?: string | null;
}

export interface AuthContextType extends AuthState {
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
  logout: () => void;
}
