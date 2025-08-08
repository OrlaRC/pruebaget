// src/pages/Callback.js

import React, { useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";

const Callback = () => {
  const location = useLocation();
  const history = useHistory();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const accessToken = queryParams.get("accessToken");
    const refreshToken = queryParams.get("refreshToken");
    const idUsuario = queryParams.get("idUsuario");

    const verificarTokenYRedirigir = async () => {
      if (!accessToken || !refreshToken || !idUsuario) {
        history.push("/login");
        return;
      }

      try {
        // Decodificar el token JWT (solo la parte del payload)
        const payloadBase64 = accessToken.split(".")[1];
        const payload = JSON.parse(atob(payloadBase64));
        const ahora = Math.floor(Date.now() / 1000);

        if (payload.exp < ahora) {
          // Token vencido, usar refresh token
          const response = await fetch("https://financiera-backend.vercel.app/api/auth/refresh", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken }),
          });

          const result = await response.json();

          if (response.ok && result.success) {
            const nuevoAccessToken = result.data.accessToken;
            const nuevoRefreshToken = result.data.refreshToken || refreshToken; // si lo devuelve

            // Guardar nuevos tokens e idUsuario
            localStorage.setItem("accessToken", nuevoAccessToken);
            localStorage.setItem("refreshToken", nuevoRefreshToken);
            localStorage.setItem("idUsuario", result.data.user.idUsuario);

            window.history.replaceState({}, document.title, "/auth/callback");
            history.push("/");
          } else {
            // No se pudo refrescar el token
            history.push("/login");
          }
        } else {
          // Token válido, guardar directamente
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken);
          localStorage.setItem("idUsuario", idUsuario);

          window.history.replaceState({}, document.title, "/auth/callback");
          history.push("/");
        }
      } catch (error) {
        console.error("Error al verificar o refrescar token:", error);
        history.push("/login");
      }
    };

    verificarTokenYRedirigir();
  }, [location.search, history]);

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Procesando autenticación…</h2>
      <p>Por favor espera un momento 🚀</p>
    </div>
  );
};

export default Callback;
