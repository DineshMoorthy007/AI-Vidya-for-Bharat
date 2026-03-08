import { useEffect, useState } from "react";
import type { LanguageOption } from "@/lib/constants";
import { useTranslation } from "@/i18n/use-translation";

type LanguageSelectorProps = {
	label?: string;
	languages: LanguageOption[];
	selectedLanguageCode: string;
	onSelect: (languageCode: string) => void;
};

export default function LanguageSelector({
	label,
	languages,
	selectedLanguageCode,
	onSelect,
}: LanguageSelectorProps) {
	const { t } = useTranslation();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return null;
	}

	return (
		<div className="space-y-2">
			<p className="text-sm font-medium text-gray-500">{label}</p>
			<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
				{languages.map((language) => {
					const isSelected = selectedLanguageCode === language.code;

					return (
						<button
							key={language.code}
							type="button"
							aria-pressed={isSelected}
							onClick={() => onSelect(language.code)}
						className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
							isSelected
								? "border-red-500 bg-red-50 text-red-700"
									: "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
							}`}
						>
							{t(language.translationKey)}
						</button>
					);
				})}
			</div>
		</div>
	);
}
