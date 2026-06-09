import LoginForm from "@/components/form/LoginForm";
import style from "./style.module.scss";
const Login = async () => {
  return (
    <div className={style.parentLogin}>
      <LoginForm />
    </div>
  );
};

export default Login;
