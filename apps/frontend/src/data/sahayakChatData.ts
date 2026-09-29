import type { SupportedLanguage } from '../i18n/translations';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  content: string;
  isDetailedAnswer?: boolean;
}

export const SUGGESTED_QUESTION: Record<SupportedLanguage, string> = {
  en: 'How is this report going to help me? From where should I start?',
  hi: 'यह रिपोर्ट मेरी किस प्रकार मदद करेगी? मुझे कहाँ से शुरुआत करनी चाहिए?',
  gu: 'આ રિપોર્ટ મને કેવી રીતે મદદ કરશે? મારે ક્યાંથી શરૂઆત કરવી જોઈએ?',
};

export const CHAT_UI_LABELS: Record<SupportedLanguage, {
  title: string;
  subtitle: string;
  inputPlaceholder: string;
  sendBtn: string;
  welcomeMessage: string;
  unsupportedResponse: string;
  suggestedChipLabel: string;
  typingIndicator: string;
}> = {
  en: {
    title: 'Sahayak — Your Business Guide',
    subtitle: 'Have questions about your feasibility report? Start with a personalized action plan.',
    inputPlaceholder: 'Ask Sahayak about your report or next steps...',
    sendBtn: 'Send',
    welcomeMessage: 'Namaste! I am Sahayak, your dedicated business guide. I can help you understand your feasibility report and prioritize your next practical steps.',
    unsupportedResponse: "For this demo, I can currently guide you on how to understand your feasibility report and where to begin. Please try asking: 'How is this report going to help me? From where should I start?'",
    suggestedChipLabel: 'Suggested Question',
    typingIndicator: 'Sahayak is formulating your guidance...',
  },
  hi: {
    title: 'सहायक — आपका व्यावसायिक मार्गदर्शक (Sahayak — Your Business Guide)',
    subtitle: 'क्या आपके पास अपनी व्यवहार्यता रिपोर्ट के बारे में प्रश्न हैं? व्यक्तिगत कार्ययोजना के साथ शुरुआत करें।',
    inputPlaceholder: 'अपनी रिपोर्ट या अगले कदमों के बारे में सहायक से पूछें...',
    sendBtn: 'भेजें',
    welcomeMessage: 'नमस्ते! मैं सहायक हूँ, आपका व्यावसायिक मार्गदर्शक। मैं आपको आपकी व्यवहार्यता रिपोर्ट समझने और अगले व्यावहारिक कदम उठाने में मार्गदर्शन कर सकता हूँ।',
    unsupportedResponse: "इस डेमो के लिए, मैं वर्तमान में आपको अपनी व्यवहार्यता रिपोर्ट समझने और कहाँ से शुरुआत करने के बारे में मार्गदर्शन कर सकता हूँ। कृपया पूछें: 'यह रिपोर्ट मेरी किस प्रकार मदद करेगी? मुझे कहाँ से शुरुआत करनी चाहिए?'",
    suggestedChipLabel: 'अनुशंसित प्रश्न',
    typingIndicator: 'सहायक मार्गदर्शन तैयार कर रहा है...',
  },
  gu: {
    title: 'સહાયક — તમારા વ્યવસાય માર્ગદર્શક (Sahayak — Your Business Guide)',
    subtitle: 'શું તમને તમારા શક્યતા રિપોર્ટ વિશે પ્રશ્નો છે? વ્યક્તિગત કાર્ય યોજનાથી શરૂઆત કરો.',
    inputPlaceholder: 'તમારા રિપોર્ટ અથવા આગળના પગલાં વિશે સહાયકને પૂછો...',
    sendBtn: 'મોકલો',
    welcomeMessage: 'નમસ્તે! હું સહાયક છું, તમારા વ્યવસાય માર્ગદર્શક. હું તમને તમારો શક્યતા રિપોર્ટ સમજવામાં અને આગળના વ્યવહારુ પગલાં લેવામાં મદદ કરી શકું છું.',
    unsupportedResponse: "આ ડેમો માટે, હું હાલમાં તમને તમારી શક્યતા રિપોર્ટ સમજવા અને ક્યાંથી શરૂઆત કરવી તે અંગે માર્ગદર્શન આપી શકું છું. કૃપા કરીને પૂછો: 'આ રિપોર્ટ મને કેવી રીતે મદદ કરશે? મારે ક્યાંથી શરૂઆત કરવી જોઈએ?'",
    suggestedChipLabel: 'ભલામણ કરેલ પ્રશ્ન',
    typingIndicator: 'સહાયક માર્ગદર્શન તૈયાર કરી રહ્યા છે...',
  },
};

/**
 * Normalizes question strings for robust intent matching
 */
export function isSupportedQuestion(input: string): boolean {
  if (!input || typeof input !== 'string') return false;

  const normalized = input
    .toLowerCase()
    .replace(/[?!.,'"\-:;()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const triggers = [
    'how is this report going to help me',
    'how will this report help me',
    'how is this report helpful',
    'where should i start',
    'from where should i start',
    'from where to start',
    'where to start',
    'what should i do first',
    'what to do first',
    'how do i proceed with my business',
    'how do i proceed',
    'how to proceed',
    'how to start',
    'how does this report help',
    'help me',
    'start',
    // Hindi keywords
    'मदद',
    'शुरुआत',
    'कहाँ से शुरुआत',
    'kaha se shuru',
    'kaise madad',
    // Gujarati keywords
    'મદદ',
    'શરૂઆત',
    'ક્યાંથી શરૂઆત',
    'kyathi sharu',
  ];

  return triggers.some((t) => normalized.includes(t));
}

export const DETAILED_ANSWER_CONTENT: Record<SupportedLanguage, string> = {
  en: `Your feasibility report is your business roadmap. It helps you understand whether your proposed business is practical, what investment you may need, which risks to manage, and what actions you should take before approaching a bank or starting operations.

For your proposed grocery or kirana store in Bardoli, Surat, Gujarat, here is how you should use this report:

### STEP 1: Understand the financial picture first
Start with **Section 5: Financial Feasibility & Scheme Structure**.

Look at these four numbers:
• **Total Project Cost**: The estimated amount needed to establish your business.
• **Own Contribution**: The amount you are expected to invest from your own funds.
• **Required Bank Loan**: The estimated funding gap that may need to be financed.
• **Estimated Monthly EMI**: The expected loan repayment, once the applicable loan terms and cash-flow figures are available.

For example, if your report estimates a project cost of ₹35 lakh, own contribution of ₹2 lakh, and required loan of ₹33 lakh, do not assume that the bank will automatically approve the entire amount.

First verify the project cost, available savings, actual quotations, and the amount you can realistically contribute.

*Important:* Under a scheme requiring a minimum 10% beneficiary contribution, ₹2 lakh against ₹35 lakh is approximately 5.7%, which is below that threshold. You would need to check the applicable scheme rules and revise the funding structure before applying. Scheme-specific eligibility and contribution requirements must be verified with the implementing bank or agency.

### STEP 2: Check whether your business can repay the loan
Read the **Business Repayment Capacity and DSCR** section carefully.

DSCR, or Debt Service Coverage Ratio, compares the cash available for loan repayment with the amount of debt repayment due.

A simplified formula is:
**DSCR = Cash available for debt repayment ÷ Total debt repayment due**

Before taking a loan, prepare a realistic estimate of:
• Expected daily sales.
• Monthly revenue.
• Cost of goods purchased from suppliers.
• Shop rent, electricity, staff, transport, and other expenses.
• Expected monthly loan instalments.

For a kirana store, do not assume that all sales revenue is profit. Grocery businesses often have different margins across essential staples, packaged goods, and personal-care products.

If your report shows DSCR as unavailable or pending, it means the necessary cash-flow or repayment inputs are missing. Do not treat the report as proof that the loan is affordable. Complete the financial projections and verify them with a bank or qualified financial advisor.

### STEP 3: Validate the location and local demand
Use **Section 2: Business Idea & Local Market Analysis** and **Section 8: Infrastructure & Ground Reality Assessment**.

Your report describes the business opportunity, customer segments, competition, transport, electricity, water, and internet conditions.

Before committing money:
• Visit the proposed shop location at different times of day.
• Count approximate customer footfall.
• Speak to nearby households about their regular grocery purchases.
• Compare prices and product availability at competing shops.
• Check rent, accessibility, storage space, and delivery access.

For your Bardoli location, verify the actual site conditions rather than assuming that every part of the locality has the same demand or infrastructure.

### STEP 4: Finalize the shop and supplier arrangements
Use **Section 4: Pricing & Products**.

Prepare a list of fast-moving items such as rice, flour, pulses, cooking oil, sugar, biscuits, snacks, soaps, and detergents.

Then:
• Obtain quotations from at least two or three wholesalers.
• Compare wholesale prices, minimum order quantities, delivery charges, and credit terms.
• Identify which products require daily replenishment and which can be stocked for longer periods.
• Keep initial inventory limited to products with demonstrated local demand.
• Avoid investing all your available money in inventory; retain working capital for rent, utilities, and replenishment.

For fresh dairy products, arrange suitable storage and monitor expiry dates.

### STEP 5: Check applicable government schemes and prepare documents
Read the government scheme and financial eligibility sections of your report.

Use them as a starting point for further verification, not as a guarantee of approval.

For each scheme:
• Verify whether the scheme is currently accepting applications.
• Confirm whether your business category, location, project cost, and applicant profile qualify.
• Check the minimum own contribution, maximum eligible loan, subsidy conditions, and required documents.
• Ask the participating bank or implementing agency about the application process.

Prepare documents commonly requested by lenders, such as identity and address proof, PAN, bank statements, quotations, business premises documents, project report, and any applicable registration or category certificates.

The exact list depends on the scheme and lending institution.

### STEP 6: Follow your action plan
Use **Section 11: Step-by-Step Action Plan** as your practical checklist.

A sensible sequence is:
1. Verify the shop location, rent, and business demand.
2. Obtain supplier quotations and estimate the complete project cost.
3. Calculate the actual own contribution and working capital requirement.
4. Complete realistic monthly sales, expense, and repayment projections.
5. Verify scheme eligibility and required documents with the bank.
6. Finalize the premises, financing, registrations, and supplier arrangements only after appropriate verification.

Do not take a large loan, sign an expensive lease, or purchase substantial inventory solely because the report indicates a business opportunity.

### WHAT YOU SHOULD DO TODAY
Start with these three tasks:
1. Write down your actual available savings and the maximum amount you can invest without exhausting your emergency funds.
2. Visit the proposed shop location and speak to at least five nearby households about their grocery needs.
3. Collect quotations for rent, initial inventory, racks, refrigeration if needed, and basic shop equipment.

Once these figures are available, you can update your financial projections and discuss a realistic funding requirement with a bank.

Remember: UDAAN's report is a preliminary business advisory tool. It helps you prepare, identify risks, and ask better questions. It is not a loan sanction, guaranteed profit forecast, or substitute for verification by a bank or relevant government agency.`,

  hi: `आपकी व्यवहार्यता रिपोर्ट आपका व्यावसायिक रोडमैप है। यह आपको यह समझने में मदद करती है कि क्या आपका प्रस्तावित व्यवसाय व्यावहारिक है, आपको कितने निवेश की आवश्यकता हो सकती है, किन जोखिमों का प्रबंधन करना है, और बैंक से संपर्क करने या संचालन शुरू करने से पहले आपको क्या कदम उठाने चाहिए।

बारडोली, सूरत, गुजरात में आपकी प्रस्तावित किराना दुकान के लिए इस रिपोर्ट का उपयोग इस प्रकार करें:

### कदम 1: सबसे पहले वित्तीय स्थिति को समझें
**खंड 5: वित्तीय व्यवहार्यता और योजना संरचना (Section 5: Financial Feasibility)** से शुरुआत करें।

इन चार मुख्य आंकड़ों को देखें:
• **कुल परियोजना लागत (Total Project Cost)**: व्यवसाय स्थापित करने के लिए अनुमानित आवश्यक राशि।
• **स्वयं का अंशदान (Own Contribution)**: वह राशि जो आपको अपने स्वयं के फंड से निवेश करनी होगी।
• **आवश्यक बैंक ऋण (Required Bank Loan)**: अनुमानित फंडिंग अंतर जिसे वित्तपोषित करने की आवश्यकता है।
• **अनुमानित मासिक ईएमआई (Estimated Monthly EMI)**: ऋण की संभावित मासिक किस्त।

महत्वपूर्ण: न्यूनतम 10% लाभार्थी योगदान वाली योजना के तहत, आवश्यक मार्जिन राशि की पहले से जांच करें और फिर बैंक आवेदन करें।

### कदम 2: जांचें कि क्या आपका व्यवसाय ऋण चुका सकता है
**व्यवसाय चुकौती क्षमता और डीएससीआर (DSCR)** अनुभाग को ध्यान से पढ़ें।

ऋण लेने से पहले वास्तविक अनुमान तैयार करें:
• अपेक्षित दैनिक बिक्री और मासिक आय।
• आपूर्तिकर्ताओं से खरीदे गए माल की लागत।
• दुकान का किराया, बिजली, स्टाफ, परिवहन और अन्य खर्चे।
• अपेक्षित मासिक ऋण किस्तें।

### कदम 3: स्थान और स्थानीय मांग को सत्यापित करें
**खंड 2: व्यापार विचार व बाजार विश्लेषण** और **खंड 8: बुनियादी ढांचा आकलन** का उपयोग करें।
• दिन के विभिन्न समयों पर दुकान स्थल का दौरा करें।
• ग्राहकों की आवाजाही का अनुमान लगाएं।
• आसपास के कम से कम 5 परिवारों से उनकी किराना जरूरतों पर चर्चा करें।
• प्रतिस्पर्धी दुकानों की कीमतों और उत्पाद विविधता की तुलना करें।

### कदम 4: दुकान और आपूर्तिकर्ता व्यवस्था को अंतिम रूप दें
**खंड 4: मूल्य निर्धारण और उत्पाद रणनीति** का उपयोग करें।
• कम से कम 2-3 थोक विक्रेताओं से दरें प्राप्त करें।
• आवश्यक फास्ट-मूविंग सामानों की सूची बनाएं।
• सभी पूंजी केवल स्टॉक में न लगाएं; कार्यशील पूंजी बचाकर रखें।

### कदम 5: लागू सरकारी योजनाओं की जांच करें और दस्तावेज तैयार करें
रिपोर्ट के सरकारी योजना और पात्रता अनुभाग को देखें:
• पहचान और पता प्रमाण, पैन कार्ड, बैंक विवरण, आपूर्तिकर्ता कोटेशन, परिसर दस्तावेज व परियोजना रिपोर्ट तैयार रखें।

### कदम 6: अपनी कार्ययोजना का पालन करें
**खंड 11: चरण-दर-चरण कार्ययोजना** का व्यावहारिक चेकलिस्ट के रूप में उपयोग करें।

### आज आपको क्या करना चाहिए:
1. अपनी वास्तविक बचत और निवेश योग्य राशि लिखें।
2. प्रस्तावित स्थल पर जाकर 5 परिवारों से बातचीत करें।
3. किराया, प्रारंभिक स्टॉक और रैक/उपकरणों के कोटेशन एकत्र करें।

याद रखें: उड़ान की रिपोर्ट एक प्रारंभिक व्यावसायिक सलाहकार उपकरण है। यह बैंक सत्यापन या गारंटीकृत लाभ का विकल्प नहीं है।`,

  gu: `તમારો શક્યતા રિપોર્ટ તમારો વ્યવસાયિક રોડમેપ છે. તે તમને સમજવામાં મદદ કરે છે કે તમારો પ્રસ્તાવિત વ્યવસાય કેટલો વ્યવહારુ છે, કેટલા રોકાણની જરૂર છે, કયા જોખમો સંભાળવાના છે અને બેંક પાસે જતા પહેલા કયા પગલાં લેવા જોઈએ.

બારડોલી, સુરત, ગુજરાતમાં તમારી કરિયાણાની દુકાન માટે આ રિપોર્ટનો ઉપયોગ આ રીતે કરો:

### પગલું 1: સૌથી પહેલા નાણાકીય સ્થિતિ સમજો
**વિભાગ 5: નાણાકીય શક્યતા અને યોજના માળખું** થી શરૂઆત કરો.

ચાર મુખ્ય આંકડા જુઓ:
• **કુલ પ્રોજેક્ટ ખર્ચ**: વ્યવસાય શરૂ કરવા માટેનો અંદાજિત ખર્ચ.
• **પોતાનું યોગદાન (Own Contribution)**: તમારા પોતાના ભંડોળમાંથી રોકાણ કરવાની રકમ.
• **જરૂરી બેંક લોન**: જરૂરી ધિરાણ રકમ.
• **અંદાજિત માસિક EMI**: લોનની અંદાજિત માસિક હપ્તાની રકમ.

### પગલું 2: ચકાસો કે શું તમારો વ્યવસાય લોન ચૂકવી શકે છે
**વ્યવસાય ચૂકવણી ક્ષમતા અને DSCR** વિભાગ ધ્યાનથી વાંચો.

લોન લેતા પહેલા વાસ્તવિક અંદાજ તૈયાર કરો:
• દૈનિક વેચાણ અને માસિક આવક.
• માલસામાનની ખરીદી કિંમત.
• દુકાનનું ભાડું, વીજળી, સ્ટાફ અને અન્ય ખર્ચ.

### પગલું 3: સ્થળ અને સ્થાનિક માંગની ચકાસણી કરો
**વિભાગ 2: સ્થાનિક બજાર વિશ્લેષણ** અને **વિભાગ 8: માળખાકીય સુવિધાઓ** નો ઉપયોગ કરો.
• દિવસના અલગ અલગ સમયે સ્થળની મુલાકાત લો.
• નજીકના ઓછામાં ઓછા 5 પરિવારો સાથે તેમની જરૂરિયાતો વિશે વાત કરો.
• હરીફ દુકાનોના ભાવ અને માલસામાનની સરખામણી કરો.

### પગલું 4: દુકાન અને સપ્લાયરની વ્યવસ્થા નક્કી કરો
**વિભાગ 4: કિંમત અને ઉત્પાદન વ્યૂહરચના** નો સંદર્ભ લો.
• 2-3 જથ્થાબંધ વેપારીઓ પાસેથી ભાવપત્રક મેળવો.
• તમામ મૂડી માત્ર સ્ટોકમાં ન રોકો; કાર્યકારી મૂડી બચાવી રાખો.

### પગલું 5: સરકારી યોજનાઓ ચકાસો અને દસ્તાવેજો તૈયાર કરો
યોજના અને પાત્રતા વિભાગ વાંચો. આધાર, પાન, બેંક સ્ટેટમેન્ટ, કોટેશન અને પ્રોજેક્ટ રિપોર્ટ તૈયાર રાખો.

### પગલું 6: તમારી કાર્ય યોજનાનું પાલન કરો
**વિભાગ 11: ક્રમબદ્ધ કાર્ય યોજના** નો ચેકલિસ્ટ તરીકે ઉપયોગ કરો.

### આજે તમારે શું કરવું જોઈએ:
1. તમારી વાસ્તવિક ઉપલબ્ધ બચત નોંધો.
2. પ્રસ્તાવિત સ્થળની મુલાકાત લઈ 5 પરિવારો સાથે ચર્ચા કરો.
3. ભાડું, સ્ટોક અને સાધનોના અંદાજીત ભાવપત્રક મેળવો.

યાદ રાખો: ઉડાનનો રિપોર્ટ એ પ્રારંભિક વ્યાપારિક માર્ગદર્શન છે. તે લોનની મંજૂરી કે ગેરંટી નથી.`,
};
