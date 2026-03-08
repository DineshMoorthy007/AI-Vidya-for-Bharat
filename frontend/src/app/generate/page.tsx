"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { generateCourse } from "@/lib/api";
import { useTranslation } from "@/i18n/use-translation";

const pendingGenerationRequests = new Map<string, Promise<{ courseId: string }>>();

function requestCourseGeneration(topic: string, language: string): Promise<{ courseId: string }> {
  const requestKey = `${topic}::${language}`;
  const existingRequest = pendingGenerationRequests.get(requestKey);

  if (existingRequest) {
    return existingRequest;
  }

  const requestPromise = generateCourse(topic, language).finally(() => {
    if (pendingGenerationRequests.get(requestKey) === requestPromise) {
      pendingGenerationRequests.delete(requestKey);
    }
  });

  pendingGenerationRequests.set(requestKey, requestPromise);
  return requestPromise;
}

export default function GeneratePage() {
  return (
    <Suspense fallback={<GeneratingView />}>
      <GenerateContent />
    </Suspense>
  );
}

function GenerateContent() {
  const router = useRouter();
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const isMountedRef = useRef(true);

  const topic = useMemo(() => searchParams.get("topic")?.trim() ?? "", [searchParams]);
  const language = useMemo(() => searchParams.get("lang")?.trim() ?? "en", [searchParams]);

  const runGeneration = useCallback(async (retrying: boolean) => {
    if (!topic) {
      setError(t("topicMissingGenerate"));
      setIsGenerating(false);
      setIsRetrying(false);
      return;
    }

    setError("");
    setIsRetrying(retrying);
    setIsGenerating(true);

    try {
      const { courseId } = await requestCourseGeneration(topic, language);

      if (isMountedRef.current) {
        router.replace(`/course/${courseId}`);
      }
    } catch {
      if (isMountedRef.current) {
        setError(t("couldNotGenerateNow"));
        setIsGenerating(false);
        setIsRetrying(false);
      }
    }
  }, [language, router, topic]);

  useEffect(() => {
    isMountedRef.current = true;
    void runGeneration(false);

    return () => {
      isMountedRef.current = false;
    };
  }, [runGeneration]);

  if (isGenerating) {
    return (
      <GeneratingView
        message={isRetrying ? t("retryingCourseGeneration") : t("generatingCourseUsingAi")}
      />
    );
  }

  return (
    <main className="flex min-h-[60vh] w-full max-w-2xl mx-auto items-center">
      <section className="w-full rounded-xl border border-red-200 bg-white p-6 text-center shadow-sm sm:p-10">
        <h1 className="text-3xl font-semibold text-slate-900">{t("unableGenerateCourse")}</h1>
        <p className="mt-2 text-sm text-gray-700">{error}</p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => router.replace("/")}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-gray-50"
          >
            {t("backToHome")}
          </button>
          <button
            type="button"
            onClick={() => {
              void runGeneration(true);
            }}
            disabled={isRetrying}
            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRetrying ? t("retrying") : t("tryAgain")}
          </button>
        </div>
      </section>
    </main>
  );
}

function GeneratingView({ message }: { message?: string }) {
  const { t } = useTranslation();
  const resolvedMessage = message ?? t("generatingCourseUsingAi");

  return (
    <main className="flex min-h-[60vh] w-full max-w-2xl mx-auto items-center">
      <section className="w-full rounded-xl border border-amber-100 bg-white p-6 text-center shadow-sm sm:p-10">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
        <h1 className="mt-5 text-3xl font-semibold text-slate-900">{resolvedMessage}</h1>
        <p className="mt-2 text-sm text-gray-700">{t("preparingChapters")}</p>
      </section>
    </main>
  );
}