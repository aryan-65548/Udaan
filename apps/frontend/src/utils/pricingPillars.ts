import type { SupportedLanguage } from '../i18n/translations';

export interface LocalizedPricingPillar {
  pillarNumber: number;
  title: string;
  recommendedApproach: string;
  approach?: string;
  whyItMatters: string;
}

export const PRICING_PILLARS_DATA: Record<SupportedLanguage, LocalizedPricingPillar[]> = {
  en: [
    {
      pillarNumber: 1,
      title: '1. Essential Staples (Grains, Flour, Oils, Sugar)',
      recommendedApproach:
        'Benchmark competitive pricing against regional suppliers, maintain lean 5%–8% gross margins to build high store footfall, and prioritize fast-moving stock turnover on daily cooking essentials.',
      approach:
        'Benchmark competitive pricing against regional suppliers, maintain lean 5%–8% gross margins to build high store footfall, and prioritize fast-moving stock turnover on daily cooking essentials.',
      whyItMatters:
        'Essential staples build daily household store visit habits and price trust across local consumers.',
    },
    {
      pillarNumber: 2,
      title: '2. Packaged Foods, Biscuits & Snacks',
      recommendedApproach:
        'Secure 14%–20% trade margins by stocking high-turnover products, position fast-moving impulse items near the billing checkout counter, and promote family value packs.',
      approach:
        'Secure 14%–20% trade margins by stocking high-turnover products, position fast-moving impulse items near the billing checkout counter, and promote family value packs.',
      whyItMatters:
        'Provides a reliable gross margin cushion with fast weekly turnover and minimal product spoilage.',
    },
    {
      pillarNumber: 3,
      title: '3. Personal Care, Soaps & Household Cleaners',
      recommendedApproach:
        'Curate an essential product assortment focusing on affordable sachet and family pack sizes with 18%–25% margins, maintaining disciplined inventory rotation to prevent shelf obsolescence.',
      approach:
        'Curate an essential product assortment focusing on affordable sachet and family pack sizes with 18%–25% margins, maintaining disciplined inventory rotation to prevent shelf obsolescence.',
      whyItMatters:
        'Higher margin density per square foot increases total transaction basket size on routine weekly shopping.',
    },
    {
      pillarNumber: 4,
      title: '4. Fresh Dairy & Daily Perishables (Milk, Curd, Bread)',
      recommendedApproach:
        'Procure daily from local dairy suppliers at 6%–10% retail margin, maintain cold storage refrigeration, enforce strict expiry monitoring, and limit initial daily stock to guaranteed demand.',
      approach:
        'Procure daily from local dairy suppliers at 6%–10% retail margin, maintain cold storage refrigeration, enforce strict expiry monitoring, and limit initial daily stock to guaranteed demand.',
      whyItMatters:
        'Creates an anchor for mandatory morning and evening customer visits that drives cross-sales of packaged groceries.',
    },
    {
      pillarNumber: 5,
      title: '5. Customer Promotions & Monthly Combo Offers',
      recommendedApproach:
        'Deploy practical monthly combo offers (staples + cooking oil + spices), reward repeat customers with transparent pricing, and offer seasonal festive hampers during harvest cycles.',
      approach:
        'Deploy practical monthly combo offers (staples + cooking oil + spices), reward repeat customers with transparent pricing, and offer seasonal festive hampers during harvest cycles.',
      whyItMatters:
        'Increases average customer basket size and locks in high-value monthly household grocery budgets against external competition.',
    },
    {
      pillarNumber: 6,
      title: '6. Inventory & Margin Management',
      recommendedApproach:
        'Track stock using structured digital or register records, establish clear reorder levels, enforce strict FIFO rotation with daily expiry tracking, and review category gross margins monthly.',
      approach:
        'Track stock using structured digital or register records, establish clear reorder levels, enforce strict FIFO rotation with daily expiry tracking, and review category gross margins monthly.',
      whyItMatters:
        'Prevents locked working capital, minimizes product expiry waste, and maintains liquidity for timely supplier payments.',
    },
  ],
  hi: [
    {
      pillarNumber: 1,
      title: '1. आवश्यक मुख्य खाद्य सामग्री (अनाज, आटा, तेल, चीनी)',
      recommendedApproach:
        'क्षेत्रीय थोक विक्रेताओं के साथ प्रतिस्पर्धी दरों की तुलना करें, ग्राहकों की आवक बढ़ाने के लिए 5%–8% का उचित मार्जिन रखें, और तेजी से बिकने वाले मुख्य सामान का 7–10 दिनों का स्टॉक चक्र बनाए रखें।',
      approach:
        'क्षेत्रीय थोक विक्रेताओं के साथ प्रतिस्पर्धी दरों की तुलना करें, ग्राहकों की आवक बढ़ाने के लिए 5%–8% का उचित मार्जिन रखें, और तेजी से बिकने वाले मुख्य सामान का 7–10 दिनों का स्टॉक चक्र बनाए रखें।',
      whyItMatters:
        'यह दैनिक घरेलू ग्राहकों में विश्वास और नियमित आवागमन स्थापित करता है, जिससे अन्य उच्च-मार्जिन उत्पादों की बिक्री बढ़ती है।',
    },
    {
      pillarNumber: 2,
      title: '2. पैकेजबंद खाद्य पदार्थ, बिस्कुट और स्नैक्स',
      recommendedApproach:
        'लोकप्रिय और तेजी से बिकने वाले उत्पादों पर 14%–20% ट्रेड मार्जिन प्राप्त करें, बिलिंग काउंटर के पास आकर्षक डिस्प्ले लगाएं और फैमिली-पैक बचत ऑफ़र करें।',
      approach:
        'लोकप्रिय और तेजी से बिकने वाले उत्पादों पर 14%–20% ट्रेड मार्जिन प्राप्त करें, बिलिंग काउंटर के पास आकर्षक डिस्प्ले लगाएं और फैमिली-पैक बचत ऑफ़र करें।',
      whyItMatters:
        'तेज साप्ताहिक नकदी चक्र और न्यूनतम खराबी के साथ स्थिर सकल लाभ (मार्जिन) प्रदान करता है।',
    },
    {
      pillarNumber: 3,
      title: '3. पर्सनल केयर, साबुन और घरेलू स्वच्छता उत्पाद',
      recommendedApproach:
        'किफायती पाउच (सैशेट) और फैमिली पैक पर ध्यान केंद्रित करते हुए आवश्यक उत्पाद विविधता रखें, 18%–25% मार्जिन प्राप्त करें और स्टॉक को खराब होने से बचाने के लिए निरंतर रोटेशन करें।',
      approach:
        'किफायती पाउच (सैशेट) और फैमिली पैक पर ध्यान केंद्रित करते हुए आवश्यक उत्पाद विविधता रखें, 18%–25% मार्जिन प्राप्त करें और स्टॉक को खराब होने से बचाने के लिए निरंतर रोटेशन करें।',
      whyItMatters:
        'प्रति वर्ग फुट अधिक मार्जिन से साप्ताहिक खरीदारी में कुल बिल और लाभ की राशि बढ़ती है।',
    },
    {
      pillarNumber: 4,
      title: '4. ताजा डेयरी और दैनिक खराब होने वाले उत्पाद (दूध, दही, ब्रेड)',
      recommendedApproach:
        'स्थानीय डेयरी से दैनिक खरीद करें, 6%–10% रिटेल मार्जिन रखें, उपयुक्त रेफ्रिजरेशन का उपयोग करें, एक्सपायरी की सख्त निगरानी करें और शुरुआती स्टॉक दैनिक मांग तक सीमित रखें।',
      approach:
        'स्थानीय डेयरी से दैनिक खरीद करें, 6%–10% रिटेल मार्जिन रखें, उपयुक्त रेफ्रिजरेशन का उपयोग करें, एक्सपायरी की सख्त निगरानी करें और शुरुआती स्टॉक दैनिक मांग तक सीमित रखें।',
      whyItMatters:
        'दुकान पर प्रतिदिन सुबह और शाम नियमित ग्राहकों का आना सुनिश्चित करता है, जिससे अन्य किराना सामान की बिक्री भी बढ़ती है।',
    },
    {
      pillarNumber: 5,
      title: '5. ग्राहक प्रचार और मासिक कॉम्बो ऑफर्स',
      recommendedApproach:
        'व्यावहारिक मासिक कॉम्बो पैक (अनाज + तेल + मसाले) बनाएं, पारदर्शी मूल्य निर्धारण के साथ नियमित ग्राहकों को प्रोत्साहित करें और त्योहारी मौसम में विशेष लाभ दें।',
      approach:
        'व्यावहारिक मासिक कॉम्बो पैक (अनाज + तेल + मसाले) बनाएं, पारदर्शी मूल्य निर्धारण के साथ नियमित ग्राहकों को प्रोत्साहित करें और त्योहारी मौसम में विशेष लाभ दें।',
      whyItMatters:
        'औसत बिल आकार बढ़ाता है, ग्राहकों का दीर्घकालिक विश्वास मजबूत करता है और पूरे महीने के बजट को स्थानीय दुकान से जोड़ता है।',
    },
    {
      pillarNumber: 6,
      title: '6. इन्वेंट्री और मार्जिन प्रबंधन',
      recommendedApproach:
        'सरल रजिस्टर या डिजिटल रिकॉर्ड से स्टॉक ट्रैक करें, स्पष्ट री-ऑर्डर स्तर तय करें, FIFO (पहले आया पहले बिका) पद्धति और एक्सपायरी जांच लागू करें, तथा मासिक मार्जिन की समीक्षा करें।',
      approach:
        'सरल रजिस्टर या डिजिटल रिकॉर्ड से स्टॉक ट्रैक करें, स्पष्ट री-ऑर्डर स्तर तय करें, FIFO (पहले आया पहले बिका) पद्धति और एक्सपायरी जांच लागू करें, तथा मासिक मार्जिन की समीक्षा करें।',
      whyItMatters:
        'कार्यशील पूंजी को फंसने से रोकता है, माल के नुकसान को समाप्त करता है और समय पर सप्लायर भुगतान के लिए नकदी बनाए रखता है।',
    },
  ],
  gu: [
    {
      pillarNumber: 1,
      title: '1. આવશ્યક અનાજ અને કરીયાણું (અનાજ, લોટ, તેલ, ખાંડ)',
      recommendedApproach:
        'પ્રાદેશિક જથ્થાબંધ વેપારીઓ સાથે સ્પર્ધાત્મક દરોની સરખામણી કરો, ગ્રાહકોની અવરજવર વધારવા માટે 5%–8% નું વ્યાજબી માર્જિન રાખો, અને ઝડપથી વેચાતા અનાજનો 7–10 દિવસનો સ્ટોક ચક્ર જાળવો.',
      approach:
        'પ્રાદેશિક જથ્થાબંધ વેપારીઓ સાથે સ્પર્ધાત્મક દરોની સરખામણી કરો, ગ્રાહકોની અવરજવર વધારવા માટે 5%–8% નું વ્યાજબી માર્જિન રાખો, અને ઝડપથી વેચાતા અનાજનો 7–10 દિવસનો સ્ટોક ચક્ર જાળવો.',
      whyItMatters:
        'આ દૈનિક ઘરગથ્થુ ગ્રાહકોમાં વિશ્વાસ અને નિયમિત મુલાકાત વધારે છે, જે અન્ય વધુ નફાકારક વસ્તુઓના વેચાણમાં મદદ કરે છે.',
    },
    {
      pillarNumber: 2,
      title: '2. પેકેજ્ડ ફૂડ્સ, બિસ્કિટ અને નાસ્તો',
      recommendedApproach:
        'ઝડપથી વેચાતા બ્રાન્ડેડ નાસ્તા પર 14%–20% વેપાર માર્જિન મેળવો, બિલિંગ કાઉન્ટર પાસે આકર્ષક ગોઠવણી રાખો અને ફેમિલી-પેક બચત ઓફર કરો.',
      approach:
        'ઝડપથી વેચાતા બ્રાન્ડેડ નાસ્તા પર 14%–20% વેપાર માર્જિન મેળવો, બિલિંગ કાઉન્ટર પાસે આકર્ષક ગોઠવણી રાખો અને ફેમિલી-પેક બચત ઓફર કરો.',
      whyItMatters:
        'ઝડપી સાપ્તાહિક રોકડ ચક્ર અને નહિવત બગાડ સાથે સ્થિર ગ્રોસ માર્જિન સુરક્ષા પૂરી પાડે છે.',
    },
    {
      pillarNumber: 3,
      title: '3. પર્સનલ કેર, સાબુ અને ઘરગથ્થુ સફાઈ ઉત્પાદનો',
      recommendedApproach:
        'કિફાયતી પાઉચ (સેશે) અને ફેમિલી પેકનું સંતુલિત ઉત્પાદન રાખો, 18%–25% માર્જિન મેળવો અને માલ બગડતો અટકાવવા સતત સ્ટોક રોટેશન કરો.',
      approach:
        'કિફાયતી પાઉચ (સેશે) અને ફેમિલી પેકનું સંતુલિત ઉત્પાદન રાખો, 18%–25% માર્જિન મેળવો અને માલ બગડતો અટકાવવા સતત સ્ટોક રોટેશન કરો.',
      whyItMatters:
        'દર ચોરસ ફૂટ દીઠ ઊંચા માર્જિનથી સાપ્તાહિક ખરીદીમાં ગ્રાહકના કુલ બિલ અને નફામાં વધારો થાય છે.',
    },
    {
      pillarNumber: 4,
      title: '4. તાજી ડેરી અને દૈનિક નાશવંત વસ્તુઓ (દૂધ, દહીં, બ્રેડ)',
      recommendedApproach:
        'સ્થાનિક ડેરી સહકારી મંડળીઓમાંથી દૈનિક ખરીદી કરો, 6%–10% રિટેલ માર્જિન રાખો, યોગ્ય રેફ્રિજરેશન જાળવો, એક્સપાયરીની કડક દેખરેખ રાખો અને શરૂઆતનો સ્ટોક દૈનિક માંગ પૂરતો મર્યાદિત રાખો.',
      approach:
        'સ્થાનિક ડેરી સહકારી મંડળીઓમાંથી દૈનિક ખરીદી કરો, 6%–10% રિટેલ માર્જિન રાખો, યોગ્ય રેફ્રિજરેશન જાળવો, એક્સપાયરીની કડક દેખરેખ રાખો અને શરૂઆતનો સ્ટોક દૈનિક માંગ પૂરતો મર્યાદિત રાખો.',
      whyItMatters:
        'રોજ સવાર-સાંજ ગ્રાહકોની ચોક્કસ મુલાકાતો વધારે છે, જેથી ઊંચા નફાવાળા અન્ય કરિયાણાનું વેચાણ પણ વધે છે.',
    },
    {
      pillarNumber: 5,
      title: '5. ગ્રાહક પ્રમોશન અને માસિક કોમ્બો ઓફર્સ',
      recommendedApproach:
        'વ્યવહારુ માસિક કોમ્બો પેક (અનાજ + તેલ + મસાલા) તૈયાર કરો, પારદર્શક કિંમત સાથે નિયમિત ગ્રાહકોને પ્રોત્સાહિત કરો અને તહેવારોની મોસમમાં ખાસ છૂટ આપો.',
      approach:
        'વ્યવહારુ માસિક કોમ્બો પેક (અનાજ + તેલ + મસાલા) તૈયાર કરો, પારદર્શક કિંમત સાથે નિયમિત ગ્રાહકોને પ્રોત્સાહિત કરો અને તહેવારોની મોસમમાં ખાસ છૂટ આપો.',
      whyItMatters:
        'સરેરાશ બિલનું કદ વધારે છે, ગ્રાહકોની લાંબા ગાળાની વફાદારી બનાવે છે અને માસિક કરિયાણાનું બજેટ બાંધી રાખે છે.',
    },
    {
      pillarNumber: 6,
      title: '6. ઈન્વેન્ટરી અને માર્જિન મેનેજમેન્ટ',
      recommendedApproach:
        'સરળ રજિસ્ટર કે ડિજિટલ રેકોર્ડ દ્વારા સ્ટોક ટ્રેક કરો, રિ-ઓર્ડર લેવલ નક્કી કરો, FIFO (પ્રથમ આવે પ્રથમ વેચાય) અને એક્સપાયરી ચેક લાગુ કરો અને માસિક માર્જિનની સમીક્ષા કરો.',
      approach:
        'સરળ રજિસ્ટર કે ડિજિટલ રેકોર્ડ દ્વારા સ્ટોક ટ્રેક કરો, રિ-ઓર્ડર લેવલ નક્કી કરો, FIFO (પ્રથમ આવે પ્રથમ વેચાય) અને એક્સપાયરી ચેક લાગુ કરો અને માસિક માર્જિનની સમીક્ષા કરો.',
      whyItMatters:
        'કાર્યકારી મૂડીને અટકતી અટકાવે છે, માલનો બગાડ દૂર કરે છે અને સમયસર સપ્લાયરને ચૂકવણી માટે રોકડ પ્રવાહ જાળવી રાખે છે.',
    },
  ],
};

/**
 * Resolves pricing pillars ensuring:
 * 1. Exactly 6 strategic categories are present.
 * 2. `recommendedApproach`, `title`, and `whyItMatters` are ALWAYS defined, actionable, and non-empty.
 * 3. Text automatically adapts to English, Hindi, or Gujarati.
 */
export function resolvePricingPillars(
  rawPillars?: Array<{
    pillarNumber?: number;
    title?: string;
    approach?: string;
    recommendedApproach?: string;
    whyItMatters?: string;
  }>,
  language: SupportedLanguage = 'en'
): LocalizedPricingPillar[] {
  const localizedDefaults = PRICING_PILLARS_DATA[language] || PRICING_PILLARS_DATA.en;

  if (language !== 'en') {
    // Return high-quality localized pillars in Hindi or Gujarati
    return localizedDefaults;
  }

  // In English mode, blend any server custom values with complete fallback guarantees
  return localizedDefaults.map((def, idx) => {
    const raw = rawPillars?.[idx];
    const serverApproach = raw?.recommendedApproach?.trim() || raw?.approach?.trim();
    const serverTitle = raw?.title?.trim();
    const serverWhy = raw?.whyItMatters?.trim();

    return {
      pillarNumber: def.pillarNumber,
      title: serverTitle || def.title,
      recommendedApproach: serverApproach || def.recommendedApproach,
      approach: serverApproach || def.recommendedApproach,
      whyItMatters: serverWhy || def.whyItMatters,
    };
  });
}
