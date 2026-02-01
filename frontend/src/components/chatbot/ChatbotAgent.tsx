import { MessageCircleMore, CircleX, Minimize2, Send } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Message } from "@/components/chatbot/Message";
import { useN8n } from "@/hooks/useN8n";
import { useProjects } from "@/contexts/ProjectsContext";

export function ChatbotAgent() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Referencia para el scroll automático
  const scrollRef = useRef<HTMLDivElement>(null);

  const { fetchProjects } = useProjects();

  const { callN8nAgent, messages, isLoading, setMessages, setIsLoading } =
    useN8n();

  // Efecto para bajar el scroll cuando hay mensajes nuevos
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleChatOpen = () => {
    setIsChatOpen(!isChatOpen);
  };

  const dateNow = new Date();
  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "p.m" : "a.m";
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes} ${ampm}`;
  };
  const displayDate = `Hoy, ${formatTime(dateNow)}`;

  // Corrección: React.FormEvent para formularios
  const handleSendMessage = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(), // Usamos timestamp para ID único
      text: inputValue,
      user: "customer",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    const responseData = await callN8nAgent(inputValue);

    // Si la IA ejecuto la accion, refrescamos la UI
    if (responseData?.actionExecuted === "project_created") {
      await fetchProjects(); // Esto actualiza el estado global de los proyectos
    }
  };

  return (
    <div className="fixed bottom-4 2xl:bottom-8 right-8 z-50">
      <button
        className={`relative rounded-full p-3.5 hover:scale-105 transition-all duration-300 cursor-pointer group ${
          isChatOpen
            ? "bg-zinc-600 hover:bg-zinc-500"
            : "bg-blue-500 hover:bg-blue-400 hover:rotate-12"
        } shadow-lg shadow-blue-500/20`}
        onClick={handleChatOpen}
      >
        <div className="relative size-6 2xl:size-8">
          <CircleX
            className={`absolute inset-0 size-6 2xl:size-8 text-white transition-all duration-400 transform ${
              isChatOpen
                ? "scale-100 opacity-100 rotate-0"
                : "scale-0 opacity-0 -rotate-90"
            }`}
          />
          <MessageCircleMore
            className={`absolute inset-0 size-6 2xl:size-8 text-white transition-all duration-400 transform ${
              isChatOpen
                ? "scale-0 opacity-0 rotate-90"
                : "scale-100 opacity-100 rotate-0"
            }`}
          />
        </div>
      </button>

      {isChatOpen && (
        <article className="flex flex-col gap-4 border border-gray-200 absolute bottom-16 2xl:bottom-20 right-0 w-[400px] h-[450px] 2xl:h-[600px] bg-white rounded-xl shadow-2xl transition-all duration-300">
          <header className="border-b border-gray-200 pb-4">
            <div className="flex items-center justify-between px-4 pt-4">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center text-sm 2xl:text-lg font-medium text-white bg-blue-400 rounded-lg size-8 2xl:size-10 shadow-md">
                  WL
                </span>
                <h3 className="text-sm 2xl:text-lg font-medium text-gray-700">
                  Asistente Worklyst
                </h3>
              </div>
              <button onClick={handleChatOpen}>
                <Minimize2 className="size-5 2xl:size-6 text-gray-400 hover:text-gray-800 hover:scale-110 transition-all duration-300 cursor-pointer" />
              </button>
            </div>
          </header>

          {/* CUERPO DEL CHAT DINÁMICO */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 flex flex-col gap-4 custom-scrollbar"
          >
            <div className="flex justify-center my-2">
              <span className="border border-gray-200 px-3 py-1 bg-gray-50 rounded-full text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                {displayDate}
              </span>
            </div>

            {/* Renderizamos el array de mensajes de useN8n */}
            {messages.map((msg) => (
              <Message
                key={msg.id}
                message={msg.text}
                user={msg.user as "agent" | "customer"}
              />
            ))}

            {/* Indicador de carga visual */}
            {isLoading && (
              <div className="flex gap-1.5 p-2 ml-2">
                <span className="size-1.5 bg-blue-400 rounded-full animate-bounce [animation-duration:0.8s]"></span>
                <span className="size-1.5 bg-blue-400 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.2s]"></span>
                <span className="size-1.5 bg-blue-400 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.4s]"></span>
              </div>
            )}
          </div>

          <footer className="flex flex-col gap-2 px-4 pb-4">
            <form className="relative" onSubmit={handleSendMessage}>
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
                className="flex items-center gap-2 bg-zinc-100 border border-gray-200 rounded-xl px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all text-sm"
                type="text"
                placeholder={
                  isLoading ? "Worklyst está pensando..." : "Escribe tu mensaje"
                }
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="absolute top-1/2 -translate-y-1/2 right-2 flex items-center p-2 bg-white text-gray-400 rounded-md hover:bg-blue-500 hover:text-white transition-all duration-300 disabled:opacity-0"
              >
                <Send className="size-4" />
              </button>
            </form>
            <span className="text-[10px] text-center text-gray-400 px-2">
              La IA puede cometer errores. Por favor, verifica la información
              importante.
            </span>
          </footer>
        </article>
      )}
    </div>
  );
}
