type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

type ChatBoxProps = {
  messages: ChatMessage[];
};

export default function ChatBox({ messages }: ChatBoxProps) {
  return (
    <div className="space-y-3">
      {messages.map((message) => {
        const isUser = message.role === "user";

        return (
          <div key={message.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm sm:max-w-[75%] ${
                isUser ? "bg-red-500 text-white" : "border border-slate-200 bg-white text-slate-900"
              }`}
            >
              {message.text}
            </div>
          </div>
        );
      })}
    </div>
  );
}