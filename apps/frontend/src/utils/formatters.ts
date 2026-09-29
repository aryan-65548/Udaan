/**
 * Centralized human-readable label formatting utility for UDAAN
 * Converts snake_case, internal codes, and technical keys to polished display labels
 * Supports English, Hindi, and Gujarati
 */

export const HUMAN_LABELS: Record<string, { en: string; hi: string; gu: string }> = {
  // Customer Segments
  online_customers: {
    en: 'Online customers',
    hi: 'ऑनलाइन ग्राहक',
    gu: 'ઓનલાઈન ગ્રાહકો',
  },
  local_residents: {
    en: 'Local neighbourhood residents',
    hi: 'स्थानीय निवासी परिवार',
    gu: 'સ્થાનિક રહેવાસીઓ',
  },
  wholesale_buyers: {
    en: 'Wholesale buyers & local vendors',
    hi: 'थोक खरीदार और स्थानीय विक्रेता',
    gu: 'જથ્થાબંધ ગ્રાહકો અને વેપારીઓ',
  },
  passersby: {
    en: 'Daily commuters and passersby',
    hi: 'दैनिक यात्री और राहगीर',
    gu: 'દૈનિક મુસાફરો અને રાહદારીઓ',
  },
  farmers_producers: {
    en: 'Farmers & local agricultural producers',
    hi: 'किसान और स्थानीय उत्पादक',
    gu: 'ખેડૂતો અને સ્થાનિક ઉત્પાદકો',
  },
  businesses_institutions: {
    en: 'Small businesses & local institutions',
    hi: 'स्थानीय व्यवसाय और संस्थान',
    gu: 'નાના વેપારીઓ અને સંસ્થાઓ',
  },
  students_youth: {
    en: 'Students and youth',
    hi: 'छात्र और युवा वर्ग',
    gu: 'વિદ્યાર્થીઓ અને યુવાનો',
  },

  // Seasonal Factors
  seasonal_demand: {
    en: 'Seasonal demand variations',
    hi: 'मौसमी मांग में उतार-चढ़ाव',
    gu: 'મોસમી માંગમાં ફેરફાર',
  },
  monsoon_rain: {
    en: 'Monsoon rains and waterlogging',
    hi: 'मानसून की बारिश और जलभराव',
    gu: 'ચોમાસાનો વરસાદ અને પાણી ભરાવું',
  },
  summer_heat: {
    en: 'Summer heat (perishables & cooling)',
    hi: 'गर्मी का मौसम (शीतलन और खराब होने वाले उत्पाद)',
    gu: 'ઉનાળાની ગરમી (શિતલતા અને જલ્દી બગડતો માલ)',
  },
  winter_cold: {
    en: 'Winter season shifts',
    hi: 'सर्दियों का मौसम',
    gu: 'શિયાળાની ઋતુ',
  },
  harvest_festival: {
    en: 'Harvest & agricultural seasons',
    hi: 'फसल कटाई और कृषि मौसम',
    gu: 'લણણી અને કૃષિ સીઝન',
  },
  festival_season: {
    en: 'Festive peaks (Diwali, Eid, Uttrayan)',
    hi: 'त्योहारों के अवसर (दीपावली, ईद, उत्तरायण)',
    gu: 'તહેવારોની સિઝન (દિવાળી, ઈદ, ઉત્તરાયણ)',
  },
  no_constraints: {
    en: 'No significant seasonal constraints',
    hi: 'कोई महत्वपूर्ण मौसमी रुकावट नहीं',
    gu: 'કોઈ નોંધપાત્ર મોસમી અવરોધ નથી',
  },

  // Business Risks & Challenges
  skilled_labour: {
    en: 'Skilled labour availability',
    hi: 'कुशल श्रमिकों की उपलब्धता',
    gu: 'કુશળ કારીગરોની ઉપલબ્ધતા',
  },
  working_capital: {
    en: 'Working capital & cash flow liquidity',
    hi: 'कार्यशील पूंजी और नकदी प्रवाह',
    gu: 'કાર્યકારી મૂડી અને રોકડ પ્રવાહ',
  },
  utilities: {
    en: 'Utility services (power & water reliability)',
    hi: 'उपयोगिता सेवाएं (बिजली और पानी की निरंतरता)',
    gu: 'યુટિલિટી સેવાઓ (વીજળી અને પાણીની ઉપલબ્ધતા)',
  },
  competition: {
    en: 'Local price & competitor pressure',
    hi: 'स्थानीय प्रतिस्पर्धा और मूल्य दबाव',
    gu: 'સ્થાનિક સ્પર્ધા અને ભાવ દબાણ',
  },
  unreliable_suppliers: {
    en: 'Supplier reliability and delivery lead times',
    hi: 'आपूर्तिकर्ता की विश्वसनीयता और डिलीवरी समय',
    gu: 'સપ્લાયર્સની વિશ્વસનીયતા અને ડિલિવરી સમય',
  },
  power_outage: {
    en: 'Power outage and grid fluctuations',
    hi: 'बिजली कटौती और वोल्टेज समस्या',
    gu: 'વીજ કાપ અને વોલ્ટેજ સમસ્યા',
  },
  transport_cost: {
    en: 'Freight and transport costs',
    hi: 'माल ढुलाई और परिवहन लागत',
    gu: 'પરિવહન અને વાહનવ્યવહાર ખર્ચ',
  },
  credit_customers: {
    en: 'Customer credit recovery delays (Udhar)',
    hi: 'उधार वसूली में देरी',
    gu: 'ઉધાર વસૂલાતમાં વિલંબ',
  },
  demand_fluctuation: {
    en: 'Uncertain demand fluctuations',
    hi: 'मांग में अनिश्चितता',
    gu: 'માંગમાં અનિશ્ચિતતા',
  },
  regulatory_compliance: {
    en: 'Trade licensing and FSSAI compliance',
    hi: 'व्यापार लाइसेंस और नियामक अनुपालन',
    gu: 'વેપાર લાયસન્સ અને નિયમન પાલન',
  },
  high_rental_cost: {
    en: 'Commercial shop rent expenses',
    hi: 'दुकान का किराया खर्च',
    gu: 'દુકાનનું ભાડું ખર્ચ',
  },

  // Infrastructure Facilities & Ratings
  road_transport: {
    en: 'Road & Transport Access',
    hi: 'सड़क एवं परिवहन पहुंच',
    gu: 'રસ્તા અને પરિવહન સુવિધા',
  },
  electricity: {
    en: 'Electricity Availability',
    hi: 'बिजली उपलब्धता',
    gu: 'વીજળીની ઉપલબ્ધતા',
  },
  water: {
    en: 'Water Supply',
    hi: 'जल आपूर्ति',
    gu: 'પાણીનો પુરવઠો',
  },
  connectivity: {
    en: 'Internet & Mobile Connectivity',
    hi: 'इंटरनेट एवं मोबाइल कनेक्टिविटी',
    gu: 'ઈન્ટરનેટ અને મોબાઈલ કનેક્ટિવિટી',
  },
  internet_mobile: {
    en: 'Internet & Mobile Connectivity',
    hi: 'इंटरनेट एवं मोबाइल कनेक्टिविटी',
    gu: 'ઈન્ટરનેટ અને મોબાઈલ કનેક્ટિવિટી',
  },
  GOOD: {
    en: 'Good',
    hi: 'उत्तम (Good)',
    gu: 'સારું (Good)',
  },
  AVERAGE: {
    en: 'Average',
    hi: 'सामान्य (Average)',
    gu: 'સામાન્ય (Average)',
  },
  POOR: {
    en: 'Poor',
    hi: 'कमजोर (Poor)',
    gu: 'નબળું (Poor)',
  },
  NOT_AVAILABLE: {
    en: 'Not Available',
    hi: 'अनुपलब्ध (Not Available)',
    gu: 'અનુપલબ્ધ (Not Available)',
  },

  // Demand Levels
  HIGH: {
    en: 'High Local Demand',
    hi: 'उच्च स्थानीय मांग',
    gu: 'ઉચ્ચ સ્થાનિક માંગ',
  },
  MODERATE: {
    en: 'Moderate Steady Demand',
    hi: 'मध्यम स्थिर मांग',
    gu: 'મધ્યમ સ્થિર માંગ',
  },
  LOW: {
    en: 'Low Demand',
    hi: 'कम मांग',
    gu: 'ઓછી માંગ',
  },
  NOT_SURE: {
    en: 'Requires Market Survey',
    hi: 'बाजार सर्वेक्षण आवश्यक',
    gu: 'બજાર સર્વેક્ષણ જરૂરી',
  },

  // Statuses & Financial
  SUFFICIENT: {
    en: 'Sufficient Coverage',
    hi: 'पर्याप्त कवरेज',
    gu: 'પર્યાપ્ત કવરેજ',
  },
  TIGHT: {
    en: 'Moderate / Tight Margin',
    hi: 'मध्यम / सीमित मार्जिन',
    gu: 'મધ્યમ / સીમિત માર્જિન',
  },
  INSUFFICIENT: {
    en: 'Insufficient Coverage',
    hi: 'अपर्याप्त कवरेज',
    gu: 'અપર્યાપ્ત કવરેજ',
  },
  UNAVAILABLE: {
    en: 'Awaiting Financial Inputs',
    hi: 'वित्तीय इनपुट प्रतीक्षारत',
    gu: 'નાણાકીય ઇનપુટ્સ બાકી',
  },

  // Business Categories
  grocery_retail: {
    en: 'Grocery & Daily Essentials Retail (Kirana Store)',
    hi: 'किराना एवं दैनिक आवश्यक वस्तु स्टोर',
    gu: 'કરીયાણા અને દૈનિક ચીજવસ્તુઓની દુકાન',
  },
  dairy_farming: {
    en: 'Dairy Farming & Animal Husbandry',
    hi: 'डेयरी फार्मिंग एवं पशुपालन',
    gu: 'ડેરી ફાર્મિંગ અને પશુપાલન',
  },
  textile_garments: {
    en: 'Textile Weaving, Embroidery & Apparel Retail',
    hi: 'वस्त्र बुनाई, कढ़ाई और परिधान खुदरा',
    gu: 'ટેક્સટાઇલ વણાટ, ભરતકામ અને કપડાં છૂટક',
  },
  agri_processing: {
    en: 'Agro Processing, Flour Mill & Cold Storage',
    hi: 'कृषि प्रसंस्करण, आटा चक्की और शीत गृह',
    gu: 'કૃષિ પ્રોસેસિંગ, લોટ મિલ અને કોલ્ડ સ્ટોરેજ',
  },
};

/**
 * Formats any raw key, enum, or snake_case string into a polished human label.
 */
export function formatLabel(key: string | null | undefined, lang: 'en' | 'hi' | 'gu' = 'en'): string {
  if (!key) return '';

  const cleanKey = key.trim();
  
  // Check exact match in dictionary
  if (HUMAN_LABELS[cleanKey]) {
    return HUMAN_LABELS[cleanKey][lang] || HUMAN_LABELS[cleanKey].en;
  }

  // Check lowercase version
  const lowerKey = cleanKey.toLowerCase();
  if (HUMAN_LABELS[lowerKey]) {
    return HUMAN_LABELS[lowerKey][lang] || HUMAN_LABELS[lowerKey].en;
  }

  // If text already contains spaces and proper casing, return as is
  if (cleanKey.includes(' ') && !cleanKey.includes('_')) {
    return cleanKey;
  }

  // Fallback: replace underscores with spaces and title-case words
  return cleanKey
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Formats comma-separated lists of raw identifiers or tags
 */
export function formatTagsList(rawList: string | string[] | null | undefined, lang: 'en' | 'hi' | 'gu' = 'en'): string {
  if (!rawList) return '';

  let items: string[] = [];
  if (Array.isArray(rawList)) {
    items = rawList;
  } else if (typeof rawList === 'string') {
    items = rawList.split(',').map((s) => s.trim()).filter(Boolean);
  }

  if (items.length === 0) return '';

  return items.map((item) => formatLabel(item, lang)).join(', ');
}
