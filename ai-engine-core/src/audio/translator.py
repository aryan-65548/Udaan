"""
Sarvam AI Translation Service (NMT).
Uses Sarvam AI 'mayura:v1' model for bi-directional translation between English, Gujarati (gu-IN), and Hindi (hi-IN).
"""

import os
import requests
from typing import Optional

SARVAM_API_URL = "https://api.sarvam.ai/translate"

LANG_CODE_MAP = {
    "en": "en-IN",
    "gu": "gu-IN",
    "hi": "hi-IN"
}


class SarvamTranslator:
    """
    Client for Sarvam AI Multilingual Neural Machine Translation (NMT).
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("SARVAM_API_KEY")

    def translate_text(
        self,
        text: str,
        target_lang: str = "gu",
        source_lang: str = "en"
    ) -> str:
        """
        Translates text into target Indic language (Gujarati 'gu', Hindi 'hi', or English 'en').

        Args:
            text: Input string to translate.
            target_lang: Target language code ('gu', 'hi', 'en').
            source_lang: Source language code ('en', 'gu', 'hi').

        Returns:
            Translated text string.
        """
        if not text or not text.strip():
            return ""

        if target_lang == source_lang:
            return text

        src_code = LANG_CODE_MAP.get(source_lang, "en-IN")
        tgt_code = LANG_CODE_MAP.get(target_lang, "gu-IN")

        if not self.api_key or self.api_key == "your_sarvam_api_key_here":
            return text

        try:
            headers = {
                "api-subscription-key": self.api_key,
                "Content-Type": "application/json"
            }

            payload = {
                "input": text,
                "source_language_code": src_code,
                "target_language_code": tgt_code,
                "model": "mayura:v1"
            }

            resp = requests.post(SARVAM_API_URL, json=payload, headers=headers, timeout=6)
            if resp.status_code == 200:
                result = resp.json()
                translated = result.get("translated_text")
                if translated:
                    return translated
        except Exception:
            pass

        return text
