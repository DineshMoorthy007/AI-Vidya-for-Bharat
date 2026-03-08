"use client";

import { MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";

type AIGuruFloatingButtonProps = {
  courseId: string;
};

export default function AIGuruFloatingButton({ courseId }: AIGuruFloatingButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/ai-guru?courseId=${encodeURIComponent(courseId)}`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Open AI Guru"
      className="fixed bottom-6 right-6 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-red-600 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
    >
      <MessageCircle className="h-6 w-6" aria-hidden="true" />
    </button>
  );
}