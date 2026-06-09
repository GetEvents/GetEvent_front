import React from "react";
import { useState } from "react";
import style from "./style.module.scss";

export default function Input({
  label,
  type = "text",
  name,
  required = false,
  handleChange,
  value,
  id,
  options = [],
  disabled,
  defaultValue,
  ...inputProps
}) {
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    if (handleChange) {
      if (type === "file") {
        handleChange(e.target.files[0]);
      } else {
        handleChange(e); // ← On passe l'événement pour que Register.js puisse accéder à e.target.name
      }
    }
  };

  const isPasswordField = type === "password";
  const inputType = isPasswordField && showPassword ? "text" : type;

  return (
    <>
      <div className={style.parent}>
        {label && (
          <label htmlFor={name} className="form-label" id={name}>
            {label}
          </label>
        )}

        {type === "select" ? (
          <select
            {...inputProps}
            name={name}
            id={id}
            className="form-control"
            onChange={handleInputChange}
            required={required}
            value={value}
            defaultValue={defaultValue}
          >
            <option value="">-- Sélectionnez --</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : type === "textarea" ? (
          <textarea
            {...inputProps}
            className="form-control"
            name={name}
            id={id}
            placeholder={label}
            required={required}
            onChange={handleInputChange}
            value={value}
          />
        ) : (
          <div className={isPasswordField ? style.passwordField : undefined}>
            <input
              {...inputProps}
              type={inputType}
              className="form-control"
              name={name}
              id={id}
              disabled={disabled}
              placeholder={label}
              required={required}
              onChange={handleInputChange}
              value={type === "file" ? undefined : value}
              defaultValue={defaultValue}
              accept={type === "file" ? "image/*" : undefined}
            />

            {isPasswordField && (
              <button
                type="button"
                className={style.passwordToggle}
                aria-label={
                  showPassword
                    ? "Masquer le mot de passe"
                    : "Afficher le mot de passe"
                }
                onClick={() => setShowPassword((prev) => !prev)}
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showPassword ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7zm9.542 3a3 3 0 100-6 3 3 0 000 6z"
                    />
                  )}
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
