import React, { useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";

const Callback = () => {
  const location = useLocation();
  const history = useHistory();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const accessToken = queryParams.get("accessToken");
    const refreshToken = queryParams.get("refreshToken");

    if (accessToken && refreshToken) {
      // 1. Guardar tokens
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      // 2. Limpiar URL
      window.history.replaceState({}, document.title, "/auth/callback");

      // 3. Redirigir al Home
      history.push("/");
    } else {
      // Si no hay tokens, volver a login
      history.push("/login");
    }
  }, [location.search, history]);

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Procesando autenticación…</h2>
      <p>Por favor espera un momento 🚀</p>
    </div>
  );
};

export default Callback;
