interface MessageProps {
  message: string;
  user?: "customer" | "agent";
}

export function Message({ message, user = "customer" }: MessageProps) {
  return (
    <div
      className={`flex justify-between items-start gap-2 ${user === "customer" ? "justify-end" : "justify-start"}`}
    >
      <span
        className={`flex items-center justify-center text-xs 2xl:text-sm font-medium text-white bg-blue-400 rounded-lg size-6 2xl:size-8 ${
          user === "customer" ? "bg-blue-400 order-1" : "bg-zinc-700 order-0"
        }`}
      >
        {user === "customer" ? "Tu" : "WL"}
      </span>
      <article
        className={`flex items-center gap-2 text-xs 2xl:text-sm text-white p-2 2xl:p-4 rounded-xl max-w-[75%] ${
          user === "customer"
            ? "bg-blue-400 rounded-tr-xs"
            : "bg-zinc-700 rounded-tl-xs"
        }`}
      >
        <p>{message}</p>
      </article>
    </div>
  );
}
