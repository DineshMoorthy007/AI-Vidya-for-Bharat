"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TopicLanguageSelectorModal from "@/components/TopicLanguageSelectorModal";
import { useTranslation } from "@/i18n/use-translation";
import type { TranslationKey } from "../../i18n/translations";

type ExploreTopicGroup = {
  titleKey: TranslationKey;
  topics: TranslationKey[];
};

const exploreTopicGroups: ExploreTopicGroup[] = [
  {
    titleKey: "programming",
    topics: [
      "topicPython",
      "topicJavaScript",
      "topicReact",
      "topicTypeScript",
      "topicDataStructures",
      "topicAlgorithms",
      "topicNodeJs",
      "topicWebDevelopment",
    ],
  },
  {
    titleKey: "artificialIntelligence",
    topics: [
      "topicMachineLearning",
      "topicNeuralNetworks",
      "topicPromptEngineering",
      "topicComputerVision",
      "topicNlp",
      "topicDeepLearning",
    ],
  },
  {
    titleKey: "mathematics",
    topics: ["topicAlgebra", "topicCalculus", "topicStatistics", "topicProbability", "topicLinearAlgebra"],
  },
  {
    titleKey: "careerSkills",
    topics: [
      "topicResumeWriting",
      "topicInterviewPreparation",
      "topicCommunicationSkills",
      "topicTimeManagement",
      "topicProblemSolving",
    ],
  },
  {
    titleKey: "agriculture",
    topics: [
      "topicSoilHealth",
      "topicCropRotation",
      "topicSustainableFarming",
      "topicIrrigationBasics",
      "topicOrganicFarming",
    ],
  },
];

export default function ExplorePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [generatingTopic, setGeneratingTopic] = useState("");
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("");

  const handleTopicSelect = (topicKey: TranslationKey) => {
    if (generatingTopic) {
      return;
    }

    const topic = t(topicKey);
    setSelectedTopic(topic);
    setIsTopicModalOpen(true);
  };

  const handleLanguageSelect = (languageCode: string) => {
    if (!selectedTopic.trim() || generatingTopic) {
      return;
    }

    setGeneratingTopic(selectedTopic);
    setIsTopicModalOpen(false);
    router.push(`/generate?topic=${encodeURIComponent(selectedTopic)}&lang=${encodeURIComponent(languageCode)}`);
  };

  return (
    <main className="w-full space-y-6">
      <TopicLanguageSelectorModal
        isOpen={isTopicModalOpen}
        topic={selectedTopic}
        isLoading={Boolean(generatingTopic)}
        onClose={() => setIsTopicModalOpen(false)}
        onSelectLanguage={handleLanguageSelect}
      />

      <section className="rounded-xl border border-amber-100 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-semibold text-slate-900">{t("exploreTitle")}</h1>
        <p className="mt-2 text-sm text-gray-700">{t("exploreSubtitle")}</p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {exploreTopicGroups.map((group) => (
          <article key={group.titleKey} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900">{t(group.titleKey)}</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {group.topics.map((topicKey) => {
                const translatedTopic = t(topicKey);
                const isGeneratingThis = generatingTopic === translatedTopic;

                return (
                  <button
                    key={topicKey}
                    type="button"
                    onClick={() => handleTopicSelect(topicKey)}
                    disabled={Boolean(generatingTopic)}
                    className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isGeneratingThis ? t("generating") : translatedTopic}
                  </button>
                );
              })}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
