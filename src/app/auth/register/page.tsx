import RegisterForm from "@/components/form/RegisterForm/";
// Même conteneur centré que la connexion et le mot de passe oublié.
import style from "../login/style.module.scss";

const Register = async () => {
  return (
    <div className={style.parentLogin}>
      <RegisterForm id={false} />
    </div>
  );
};

export default Register;
