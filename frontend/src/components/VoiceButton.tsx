"use client";

import { useRef, useState } from "react";
import { useTranslation } from "@/i18n/use-translation";

type VoiceButtonProps = {
	onTranscript: (text: string) => void;
	onListeningChange?: (isListening: boolean) => void;
	onError?: (message: string) => void;
};

type RecognitionInstance = {
	lang: string;
	interimResults: boolean;
	continuous?: boolean;
	maxAlternatives: number;
	start: () => void;
	stop: () => void;
	onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript?: string }>> }) => void) | null;
	onerror: ((event: { error?: string }) => void) | null;
	onend: (() => void) | null;
};

type SpeechRecognitionWithWebkit = Window & {
	webkitSpeechRecognition?: new () => RecognitionInstance;
	SpeechRecognition?: new () => RecognitionInstance;
};

export default function VoiceButton({ onTranscript, onListeningChange, onError }: VoiceButtonProps) {
	const { t } = useTranslation();
	const recognitionRef = useRef<RecognitionInstance | null>(null);
	const [isListening, setIsListening] = useState(false);

	const stopListening = () => {
		recognitionRef.current?.stop();
		setIsListening(false);
		onListeningChange?.(false);
	};

	const ensureMicrophoneAccess = async (): Promise<boolean> => {
		if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
			return true;
		}

		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			stream.getTracks().forEach((track) => track.stop());
			return true;
		} catch {
			onError?.(t("microphonePermissionDenied"));
			return false;
		}
	};

	const handleClick = async () => {
		if (isListening) {
			stopListening();
			return;
		}

		if (typeof window !== "undefined" && !window.isSecureContext && window.location.hostname !== "localhost") {
			onError?.(t("voiceRequiresHttps"));
			return;
		}

		const hasMicAccess = await ensureMicrophoneAccess();
		if (!hasMicAccess) {
			return;
		}

		const speechWindow = window as SpeechRecognitionWithWebkit;
		const SpeechRecognitionConstructor = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

		if (!SpeechRecognitionConstructor) {
			onError?.(t("voiceNotSupported"));
			return;
		}

		onError?.("");

		const recognition = new SpeechRecognitionConstructor();
		recognitionRef.current = recognition;
		recognition.lang = "en-IN";
		recognition.interimResults = false;
		recognition.continuous = false;
		recognition.maxAlternatives = 1;

		setIsListening(true);
		onListeningChange?.(true);

		recognition.onresult = (event) => {
			const transcript = event.results?.[0]?.[0]?.transcript?.trim();
			if (transcript) {
				onTranscript(transcript);
			} else {
				onError?.(t("speechNotRecognized"));
			}
		};

		recognition.onerror = (event) => {
			if (event.error === "aborted") {
				return;
			}

			if (event.error === "not-allowed" || event.error === "service-not-allowed") {
				onError?.(t("microphonePermissionDenied"));
				return;
			}

			if (event.error === "no-speech") {
				onError?.(t("speechNotRecognized"));
				return;
			}

			onError?.(t("voiceInputFailed"));
		};

		recognition.onend = () => {
			recognitionRef.current = null;
			setIsListening(false);
			onListeningChange?.(false);
		};

		try {
			recognition.start();
		} catch {
			recognitionRef.current = null;
			setIsListening(false);
			onListeningChange?.(false);
			onError?.(t("voiceInputFailed"));
		}
	};

	return (
		<button
			type="button"
			onClick={handleClick}
			aria-pressed={isListening}
			className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-gray-50"
		>
			{isListening ? t("voiceButtonStop") : t("voiceButtonStart")}
		</button>
	);
}
