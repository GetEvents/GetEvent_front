import ResetPasswordForm from "@/components/form/PasswordRecoveryForm/ResetPasswordForm";
import styles from "../login/style.module.scss";

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { token = "" } = await searchParams;

  return (
    <div className={styles.parentLogin}>
      <ResetPasswordForm token={token} />
    </div>
  );
}
