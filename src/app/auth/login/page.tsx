import LoginForm from "@/components/form/LoginForm";
import style from "./style.module.scss";
interface LoginPageProps {
  searchParams: Promise<{ from?: string | string[] }>;
}

// N'accepte qu'un chemin interne (évite les redirections ouvertes vers un autre site).
const getSafeRedirect = (value?: string | string[]): string | undefined => {
  const path = Array.isArray(value) ? value[0] : value;
  if (!path || !path.startsWith("/") || path.startsWith("//")) return undefined;
  if (path.startsWith("/auth/")) return undefined;
  return path;
};

const Login = async ({ searchParams }: LoginPageProps) => {
  const { from } = await searchParams;
  return (
    <div className={style.parentLogin}>
      <LoginForm redirectTo={getSafeRedirect(from)} />
    </div>
  );
};

export default Login;
