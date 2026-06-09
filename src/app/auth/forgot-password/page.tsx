import ForgotPasswordForm from "@/components/form/PasswordRecoveryForm/ForgotPasswordForm";
import styles from "../login/style.module.scss";

export default function ForgotPasswordPage() {
  return (
    <div className={styles.parentLogin}>
      <ForgotPasswordForm />
    </div>
  );
}
