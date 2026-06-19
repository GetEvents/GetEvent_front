"use client";
import style from "./style.module.scss";
import Dashboard from "@/components/Dashboard";

export default function Welcome() {
  return (
    <div className={style.page}>
      <div className={style.container}>
        <div className={style.content}>
          <Dashboard />
        </div>
      </div>
    </div>
  );
}
