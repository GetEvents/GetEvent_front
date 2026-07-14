import styles from "./style.module.scss";
import { React } from "react";

const PopUp = ({ message, type, visible }) => {
  if (!visible) return null;

  return (
    <div
      className={`
        ${styles.wrapper} 
        ${styles[type]} 
        ${styles.btnDe} 
      `}
    >
      <p>{message}</p>
    </div>
  );
};

export default PopUp;
