"""
Multilingual Question Bank for adaptive questioning across enterprise categories.
Supports English (en), Hindi (hi), and Gujarati (gu).
"""

from typing import Any, Dict, List, Optional
from .question_models import QuestionItem, QuestionInputType, QuestionOption


# Question definitions with multilingual prompts and options
QUESTION_DEFINITIONS: Dict[str, Dict[str, Any]] = {
    "has_shop": {
        "key": "has_shop",
        "inputType": QuestionInputType.BOOLEAN,
        "category": "resources",
        "importance": "HIGH",
        "prompts": {
            "en": "Do you already own or rent a commercial shop/room for this business?",
            "hi": "क्या आपके पास इस व्यवसाय के लिए पहले से कोई दुकान या कमरा (किराये पर या खुद का) उपलब्ध है?",
            "gu": "શું તમારી પાસે આ વ્યવસાય માટે પહેલેથી કોઈ દુકાન કે ઓરડો (ભાડે અથવા પોતાની) ઉપલબ્ધ છે?"
        },
        "options": {
            "en": [{"label": "Yes, I have a shop/space", "value": True}, {"label": "No, I need to arrange one", "value": False}],
            "hi": [{"label": "हाँ, मेरे पास दुकान/स्थान है", "value": True}, {"label": "नहीं, व्यवस्था करनी होगी", "value": False}],
            "gu": [{"label": "હા, મારી પાસે દુકાન/જગ્યા છે", "value": True}, {"label": "ના, વ્યવસ્થા કરવી પડશે", "value": False}]
        }
    },
    "shop_area": {
        "key": "shop_area",
        "inputType": QuestionInputType.NUMBER,
        "category": "resources",
        "importance": "MEDIUM",
        "prompts": {
            "en": "What is the approximate area of your shop/commercial space (in sq. ft.)?",
            "hi": "आपकी दुकान या व्यावसायिक स्थान का अनुमानित क्षेत्रफल (वर्ग फुट में) कितना है?",
            "gu": "તમારી દુકાન અથવા જગ્યાનું અંદાજિત ક્ષેત્રફળ (ચોરસ ફૂટમાં) કેટલું છે?"
        }
    },
    "own_contribution": {
        "key": "own_contribution",
        "inputType": QuestionInputType.NUMBER,
        "category": "resources",
        "importance": "CRITICAL",
        "prompts": {
            "en": "How much of your own savings/capital (in ₹) can you invest directly in this business?",
            "hi": "आप इस व्यवसाय में अपनी बचत से कितनी पूंजी (रुपये में) सीधे निवेश कर सकते हैं?",
            "gu": "તમે આ વ્યવસાયમાં તમારી બચતમાંથી કેટલી મૂડી (રૂપિયામાં) રોકાણ કરી શકો છો?"
        }
    },
    "previous_experience": {
        "key": "previous_experience",
        "inputType": QuestionInputType.SELECT,
        "category": "user",
        "importance": "HIGH",
        "prompts": {
            "en": "How much prior experience do you have in this type of business or trade?",
            "hi": "इस प्रकार के व्यवसाय या कार्य में आपका पिछला अनुभव कितना है?",
            "gu": "આ પ્રકારના વ્યવસાય કે કામમાં તમારો અગાઉનો અનુભવ કેટલો છે?"
        },
        "options": {
            "en": [
                {"label": "None (First time entrepreneur)", "value": "None"},
                {"label": "1 - 2 years as helper/employee", "value": "1-2 years"},
                {"label": "3+ years of experience", "value": "3+ years"},
                {"label": "Family tradition / heritage", "value": "Family business"}
            ],
            "hi": [
                {"label": "कोई अनुभव नहीं (पहली बार)", "value": "None"},
                {"label": "1 से 2 साल का काम/सहायक अनुभव", "value": "1-2 years"},
                {"label": "3 साल या अधिक का अनुभव", "value": "3+ years"},
                {"label": "पारिवारिक व्यवसाय", "value": "Family business"}
            ],
            "gu": [
                {"label": "કોઈ અનુભવ નથી (પ્રથમ વખત)", "value": "None"},
                {"label": "1 થી 2 વર્ષનો સહાયક અનુભવ", "value": "1-2 years"},
                {"label": "3 વર્ષ કે તેથી વધુ અનુભવ", "value": "3+ years"},
                {"label": "પારિવારિક વ્યવસાય", "value": "Family business"}
            ]
        }
    },
    "has_known_customers": {
        "key": "has_known_customers",
        "inputType": QuestionInputType.BOOLEAN,
        "category": "business",
        "importance": "HIGH",
        "prompts": {
            "en": "Do you already know potential buyers or clients who will purchase from you?",
            "hi": "क्या आप पहले से ऐसे संभावित ग्राहकों या खरीदारों को जानते हैं जो आपसे सामान/सेवा लेंगे?",
            "gu": "શું તમે પહેલેથી એવા ગ્રાહકો કે ખરીદદારોને ઓળખો છો જે તમારી પાસેથી ખરીદી કરશે?"
        },
        "options": {
            "en": [{"label": "Yes, I have existing contacts", "value": True}, {"label": "No, I will need to find them", "value": False}],
            "hi": [{"label": "हाँ, मेरे पास पहले से ग्राहक संपर्क हैं", "value": True}, {"label": "नहीं, मुझे नए ग्राहक ढूंढने होंगे", "value": False}],
            "gu": [{"label": "હા, મારી પાસે સંપર્કો છે", "value": True}, {"label": "ના, નવા ગ્રાહકો શોધવા પડશે", "value": False}]
        }
    },
    "has_supplier_access": {
        "key": "has_supplier_access",
        "inputType": QuestionInputType.BOOLEAN,
        "category": "operations",
        "importance": "MEDIUM",
        "prompts": {
            "en": "Do you have established suppliers or wholesalers for purchasing inventory/raw materials?",
            "hi": "क्या आपके पास कच्चा माल या सामान खरीदने के लिए थोक व्यापारी/सप्लायर उपलब्ध हैं?",
            "gu": "શું તમારી પાસે કાચો માલ અથવા સામાન ખરીદવા માટે હોલસેલર/સપ્લાયર્સ ઉપલબ્ધ છે?"
        },
        "options": {
            "en": [{"label": "Yes, suppliers identified", "value": True}, {"label": "No, need supplier connections", "value": False}],
            "hi": [{"label": "हाँ, सप्लायर तय हैं", "value": True}, {"label": "नहीं, सप्लायर तलाशने होंगे", "value": False}],
            "gu": [{"label": "હા, સપ્લાયર્સ નક્કી છે", "value": True}, {"label": "ના, સપ્લાયર્સ શોધવા પડશે", "value": False}]
        }
    },
    "three_phase_power": {
        "key": "has_three_phase_power",
        "inputType": QuestionInputType.BOOLEAN,
        "category": "resources",
        "importance": "CRITICAL",
        "prompts": {
            "en": "Is 3-phase commercial/industrial electricity power available at your planned location?",
            "hi": "क्या आपके प्रस्तावित स्थल पर 3-फेज (3-phase) बिजली कनेक्शन उपलब्ध है?",
            "gu": "શું તમારા સૂચિત સ્થળે 3-ફેઝ (3-phase) વીજળી કનેક્શન ઉપલબ્ધ છે?"
        },
        "options": {
            "en": [{"label": "Yes, 3-phase power available", "value": True}, {"label": "No / Single phase only", "value": False}],
            "hi": [{"label": "हाँ, 3-फेज बिजली उपलब्ध है", "value": True}, {"label": "नहीं, केवल सिंगल फेज है", "value": False}],
            "gu": [{"label": "હા, 3-ફેઝ વીજળી ઉપલબ્ધ છે", "value": True}, {"label": "ના, માત્ર સિંગલ ફેઝ છે", "value": False}]
        }
    },
    "water_supply": {
        "key": "has_water_supply",
        "inputType": QuestionInputType.BOOLEAN,
        "category": "resources",
        "importance": "HIGH",
        "prompts": {
            "en": "Do you have adequate daily water supply (borewell, tap connection, or canal) for operations?",
            "hi": "क्या आपके पास प्रतिदिन के काम के लिए पर्याप्त पानी की सुविधा (बोरवेल, नल, या नहर) उपलब्ध है?",
            "gu": "શું તમારી પાસે દૈનિક કામકાજ માટે પૂરતા પાણીની વ્યવસ્થા (બોરવેલ, નળ કે નહેર) ઉપલબ્ધ છે?"
        },
        "options": {
            "en": [{"label": "Yes, reliable water supply", "value": True}, {"label": "No, water is limited", "value": False}],
            "hi": [{"label": "हाँ, पानी की पर्याप्त सुविधा है", "value": True}, {"label": "नहीं, पानी की सीमित व्यवस्था है", "value": False}],
            "gu": [{"label": "હા, પાણીની પૂરતી સુવિધા છે", "value": True}, {"label": "ના, પાણીની મર્યાદિત વ્યવસ્થા છે", "value": False}]
        }
    },
    "expected_working_hours": {
        "key": "expected_working_hours",
        "inputType": QuestionInputType.NUMBER,
        "category": "user",
        "importance": "MEDIUM",
        "prompts": {
            "en": "How many hours per day can you personally dedicate to running this business?",
            "hi": "आप इस व्यवसाय को चलाने के लिए व्यक्तिगत रूप से प्रतिदिन कितने घंटे दे सकते हैं?",
            "gu": "તમે આ વ્યવસાય ચલાવવા માટે વ્યક્તિગત રીતે દરરોજ કેટલા કલાક આપી શકો છો?"
        }
    }
}


class QuestionBank:
    """Retrieves localized question items based on field keys and language preferences."""

    @classmethod
    def get_question(cls, key: str, language: str = "en") -> Optional[QuestionItem]:
        defn = QUESTION_DEFINITIONS.get(key)
        if not defn:
            return None

        lang = language if language in ("en", "hi", "gu") else "en"
        text = defn["prompts"].get(lang) or defn["prompts"]["en"]
        
        options = None
        if "options" in defn:
            opts_raw = defn["options"].get(lang) or defn["options"]["en"]
            options = [QuestionOption(label=o["label"], value=o["value"]) for o in opts_raw]

        return QuestionItem(
            key=defn["key"],
            text=text,
            inputType=defn["inputType"],
            options=options,
            category=defn["category"],
            importance=defn["importance"]
        )
