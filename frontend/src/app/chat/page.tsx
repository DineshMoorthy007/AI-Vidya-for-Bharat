"use client";

import { FormEvent, Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ChatBox from "@/components/ChatBox";
import VoiceButton from "@/components/VoiceButton";
import { sendChatMessage } from "@/lib/api";
import { loadAppSettings } from "@/lib/settings";
import { useTranslation } from "@/i18n/use-translation";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

export default function ChatPage() {
  return (
    <Suspense fallback={<ChatFallback />}>
      <ChatContent />
    </Suspense>
  );
}

function ChatContent() {
  const { t, currentLanguage } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = useMemo(() => searchParams.get("courseId") ?? "", [searchParams]);
  const chapter = useMemo(() => searchParams.get("chapter") ?? "", [searchParams]);
  const tool = useMemo(() => searchParams.get("tool") ?? "", [searchParams]);
  const prompt = useMemo(() => searchParams.get("prompt") ?? "", [searchParams]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(loadAppSettings().voiceInteractionEnabled);
  const [error, setError] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: t("chatWelcomeMessage"),
    },
  ]);

  useEffect(() => {
    setMessages((previous) => {
      if (previous.length === 0 || previous[0]?.id !== "welcome") {
        return previous;
      }

      const [welcome, ...rest] = previous;
      const nextWelcomeText = t("chatWelcomeMessage");

      if (welcome.text === nextWelcomeText) {
        return previous;
      }

      return [{ ...welcome, text: nextWelcomeText }, ...rest];
    });
  }, [currentLanguage, t]);

  useEffect(() => {
    const applySettings = () => {
      const settings = loadAppSettings();
      setVoiceEnabled(settings.voiceInteractionEnabled);
    };

    applySettings();
    window.addEventListener("app-settings-updated", applySettings);

    return () => {
      window.removeEventListener("app-settings-updated", applySettings);
    };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isSending]);

  useEffect(() => {
    if (prompt.trim()) {
      setInput(prompt);
    }
  }, [prompt]);

  const canSend = input.trim().length > 0 && !isSending && courseId.trim().length > 0;

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    const text = input.trim();

    if (!text || isSending) {
      return;
    }

    if (!courseId.trim()) {
      setError(t("courseContextMissing"));
      return;
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setError("");
    setIsSending(true);

    try {
      const response = await sendChatMessage(text, courseId, {
        chapter: chapter || undefined,
        tool: tool || undefined,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: response.reply,
        },
      ]);
    } catch (apiError) {
      const message = apiError instanceof Error ? apiError.message : t("sendMessageError");
      setError(message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="flex w-full flex-col" style={{ minHeight: 'calc(100vh - 8rem)' }}>
      <header className="rounded-xl border border-amber-100 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-3">
          <button
            type="button"
            onClick={() => {
              if (!courseId.trim()) {
                return;
              }

              router.push(`/course/${encodeURIComponent(courseId)}`);
            }}
            disabled={!courseId.trim()}
            aria-label={t("backToCourse")}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-red-700">{t("aiGuru")}</p>
          <h1 className="text-3xl font-semibold text-slate-900">{t("askYourQuestion")}</h1>
          <p className="text-sm text-gray-700">{t("chatSubtitle")}</p>
        </div>
      </header>

      {error && (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800" role="status">
          {error}
        </p>
      )}

      {!courseId.trim() && (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800" role="status">
          {t("courseContextMissing")}
        </p>
      )}

      {courseId.trim() && chapter.trim() && (
        <p className="mt-4 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700" role="status">
          {t("currentChapterContext")}: <span className="font-medium">{chapter}</span>
        </p>
      )}

      <section ref={scrollContainerRef} className="mt-4 flex-1 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
        <ChatBox messages={messages} />
        {isSending && (
          <p className="mt-3 text-sm text-slate-500">{t("aiGuruTyping")}</p>
        )}
        <div ref={endRef} />
      </section>

      {isListening && (
        <p className="mt-3 text-sm font-medium text-red-700">{t("listening")}</p>
      )}

      <form onSubmit={sendMessage} className="mt-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:p-4">
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={t("chatPlaceholder")}
          className="w-full flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
        />

        <div className="flex gap-2">
          {voiceEnabled && (
            <VoiceButton
              onTranscript={setInput}
              onListeningChange={setIsListening}
              onError={setError}
            />
          )}
          <button
            type="submit"
            disabled={!canSend}
            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSending ? t("sending") : t("send")}
          </button>
        </div>
      </form>

      <div className="mt-4 text-center">
        <Link href="/" className="text-sm font-semibold text-red-500 transition hover:text-red-600">
          {t("generateAnotherCourse")}
        </Link>
      </div>
    </main>
  );
}

function ChatFallback() {
  const { t } = useTranslation();

  return (
    <main className="flex w-full items-center justify-center" style={{ minHeight: 'calc(100vh - 8rem)' }}>
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
        <p className="mt-3 text-sm text-gray-700">{t("chatLoading")}</p>
      </div>
    </main>
  );
}