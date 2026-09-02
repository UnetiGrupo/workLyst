import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useCallback } from "react";

export const useN8n = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hola soy Worklyst, ¿en qué puedo ayudarte?",
      user: "agent",
    },
  ]);

  const callN8nAgent = useCallback(
    async (query: string) => {
      try {
        // El cuerpo del POST (lo que n8n recibirá en el nodo Webhook)
        const payload = {
          message: query,
          history: messages.slice(-5), // Contexto de la conversación
          userId: user?.id,
          userName: user?.nombre || user?.usuario || "Usuario", // Útil para que la IA te salude
        };

        const n8nUrl =
          process.env.NEXT_PUBLIC_N8N_URL ||
          process.env.NEXT_PUBLIC_N8N_TEST_URL ||
          "";

        const response = await axios.post(n8nUrl, payload, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("sessionToken") || ""}`,
            "x-api-key": process.env.NEXT_PUBLIC_AI_API_KEY || "",
          },
        });

        // El agente de n8n devuelve la respuesta en data.output
        const data = response.data;
        console.log("Respuesta completa de n8n:", data);

        let assistantMessage = data.mensaje || "No se pudo obtener respuesta.";

        // --- FORMATEAR MENSAJE PARA MEJOR LECTURA ---
        // 1. Insertar saltos de línea antes de los números si no los hay
        // 2. Asegurar que los puntos numerados empiecen en línea nueva
        assistantMessage = assistantMessage
          .replace(/(\d+\.)\s/g, "\n$1 ") // Saltos antes de "1. ", "2. ", etc.
          .replace(/¿/g, "\n¿") // Saltos antes de preguntas finales para separarlas
          .replace(/\.\s+(?=[A-ZÁÉÍÓÚ])/g, ".\n\n") // Doble salto después de punto seguido si empieza con mayúscula
          .trim()
          .split("\n")
          .filter((line: string) => line.trim() !== "")
          .join("\n\n");

        console.log("Mensaje procesado para el usuario:", assistantMessage);

        // --- DETECTAR ACCIONES DE ÉXITO PARA REFRESCAR ---
        // Nueva lógica: metadata (cuando se detecte que no es null ni vacío se recargará)
        if (
          data.metadata !== null &&
          data.metadata !== "" &&
          data.metadata !== undefined
        ) {
          console.log("Detectada metadata válida, refrescando datos...");
          // Disparamos el evento global para refrescar los datos sin perder el estado del chat
          window.dispatchEvent(new Event("refresh_worklyst_data"));
        }

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: assistantMessage,
            user: "agent",
          },
        ]);
        return data;
      } catch (error) {
        console.error("Error callN8n:", error);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: "Lo siento, tuve problemas para conectarme con mis herramientas.",
            user: "agent",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, user],
  );

  return { callN8nAgent, messages, isLoading, setMessages, setIsLoading };
};
