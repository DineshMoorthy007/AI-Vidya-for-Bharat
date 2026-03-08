import { useTranslation } from "@/i18n/use-translation";

type TopicSuggestionChipsProps = {
  topics: string[];
  onSelectTopic: (topic: string) => void;
};

export default function TopicSuggestionChips({ topics, onSelectTopic }: TopicSuggestionChipsProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-500">{t("tryPopularTopics")}</p>
      <div className="flex flex-wrap gap-2">
        {topics.map((topic) => (
          <button
            key={topic}
            type="button"
            onClick={() => onSelectTopic(topic)}
            className="cursor-pointer rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:bg-gray-50"
          >
            {topic}
          </button>
        ))}
      </div>
    </div>
  );
}