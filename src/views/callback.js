// src/pages/Callback.js (o donde tengas este archivo)

import React, { useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";

const Callback = () => {
  const location = useLocation();
  const history = useHistory();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const accessToken = queryParams.get("accessToken");
    const refreshToken = queryParams.get("refreshToken");
    const idUsuario = queryParams.get("idUsuario"); // ⬅️ nuevo

    if (accessToken && refreshToken && idUsuario) {
      // Guardar en localStorage
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("idUsuario", idUsuario); // ⬅️ nuevo

      // Limpiar la URL
      window.history.replaceState({}, document.title, "/auth/callback");

      // Redirigir al home
      history.push("/");
    } else {
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
