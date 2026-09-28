import { questionnaireQuestions } from '../schema/questionnaire';

export const initialQuestions = [
  {
    id: 'q1_infrastructure',
    code: 'INFRASTRUCTURE',
    version: 1,
    displayOrder: 1,
    questionText: 'How reliable are the basic facilities available at your proposed business location?',
    questionType: 'RATING_MATRIX',
    options: {
      facilities: [
        {
          key: 'road_transport',
          label: 'Road and transport access',
          labelHi: 'सड़क और परिवहन सुविधा',
          labelGu: 'રસ્તા અને વાહનવ્યવહારની સુવિધા',
        },
        {
          key: 'electricity',
          label: 'Electricity availability',
          labelHi: 'बिजली की उपलब्धता',
          labelGu: 'વીજળીની ઉપલબ્ધતા',
        },
        {
          key: 'water',
          label: 'Water availability',
          labelHi: 'पानी की उपलब्धता',
          labelGu: 'પાણીની ઉપલબ્ધતા',
        },
        {
          key: 'connectivity',
          label: 'Internet/mobile connectivity',
          labelHi: 'इंटरनेट / मोबाइल कनेक्टिविटी',
          labelGu: 'ઇન્ટરનેટ / મોબાઇલ કનેક્ટિવિટી',
        },
      ],
      ratings: [
        { key: 'GOOD', label: 'Good', labelHi: 'अच्छा', labelGu: 'સારું' },
        { key: 'AVERAGE', label: 'Average', labelHi: 'औसत', labelGu: 'સામાન્ય' },
        { key: 'POOR', label: 'Poor', labelHi: 'खराब', labelGu: 'નબળું' },
        { key: 'NOT_AVAILABLE', label: 'Not Available', labelHi: 'उपलब्ध नहीं', labelGu: 'ઉપલબ્ધ નથી' },
      ],
    },
    isRequired: true,
    isActive: true,
  },
  {
    id: 'q2_competitors',
    code: 'COMPETITORS',
    version: 1,
    displayOrder: 2,
    questionText:
      'Which similar businesses or competitors operate near your proposed business location, including any that may not appear on Google Maps?',
    questionType: 'COMPETITOR_LIST',
    options: {
      helperText:
        'List existing local competitors or select "I am not aware of any nearby competitors". Google Maps listing is not required.',
      helperTextHi:
        'आस-पास के प्रतिस्पर्धियों की सूची बनाएं या "मुझे किसी नजदीकी प्रतिस्पर्धी की जानकारी नहीं है" चुनें।',
      helperTextGu:
        'નજીકના હરીફોની યાદી બનાવો અથવા "મને કોઈ નજીકના હરીફ વિશે જાણ નથી" પસંદ કરો.',
      noCompetitorsLabel: 'I am not aware of any nearby competitors',
      noCompetitorsLabelHi: 'मुझे किसी नजदीकी प्रतिस्पर्धी की जानकारी नहीं है',
      noCompetitorsLabelGu: 'મને આસપાસ કોઈ હરીફ વ્યવસાય વિશે જાણ નથી',
    },
    isRequired: true,
    isActive: true,
  },
  {
    id: 'q3_seasonal_constraints',
    code: 'SEASONAL_CONSTRAINTS',
    version: 1,
    displayOrder: 3,
    questionText:
      'Are there seasonal or environmental conditions that could affect your business operations or sales during the year?',
    questionType: 'MULTI_CHOICE_EXPLANATION',
    options: {
      choices: [
        {
          key: 'monsoon_flooding',
          label: 'Monsoon or flooding',
          labelHi: 'मानसून या बाढ़',
          labelGu: 'ચોમાસું અથવા પૂર',
        },
        {
          key: 'drought_shortage',
          label: 'Drought or water shortage',
          labelHi: 'सूखा या पानी की कमी',
          labelGu: 'દુષ્કાળ અથવા પાણીની તંગી',
        },
        {
          key: 'extreme_temperature',
          label: 'Extreme heat or cold',
          labelHi: 'अत्यधिक गर्मी या ठंड',
          labelGu: 'અતિશય ગરમી અથવા ઠંડી',
        },
        {
          key: 'seasonal_demand',
          label: 'Seasonal demand fluctuations',
          labelHi: 'मौसमी मांग में उतार-चढ़ाव',
          labelGu: 'મોસમી માંગમાં વધઘટ',
        },
        {
          key: 'agricultural_dependence',
          label: 'Agricultural season dependence',
          labelHi: 'कृषि मौसम पर निर्भरता',
          labelGu: 'ખેતીની મોસમ પર નિર્ભરતા',
        },
        {
          key: 'transport_disruption',
          label: 'Transport or road disruption',
          labelHi: 'परिवहन या सड़क में रुकावट',
          labelGu: 'વાહનવ્યવહાર અથવા રસ્તામાં અવરોધ',
        },
        {
          key: 'no_constraints',
          label: 'No significant seasonal constraints',
          labelHi: 'कोई महत्वपूर्ण मौसमी बाधा नहीं',
          labelGu: 'કોઈ નોંધપાત્ર મોસમી અવરોધ નથી',
        },
        {
          key: 'other',
          label: 'Other',
          labelHi: 'अन्य',
          labelGu: 'અન્ય',
        },
      ],
      months: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ],
    },
    isRequired: true,
    isActive: true,
  },
  {
    id: 'q4_local_demand',
    code: 'LOCAL_DEMAND',
    version: 1,
    displayOrder: 4,
    questionText:
      'How would you describe the demand for the products or services you plan to offer in your area?',
    questionType: 'SINGLE_CHOICE_FOLLOWUP',
    options: {
      choices: [
        { key: 'HIGH', label: 'High', labelHi: 'अधिक (High)', labelGu: 'વધારે (High)' },
        { key: 'MODERATE', label: 'Moderate', labelHi: 'मध्यम (Moderate)', labelGu: 'મધ્યમ (Moderate)' },
        { key: 'LOW', label: 'Low', labelHi: 'कम (Low)', labelGu: 'ઓછું (Low)' },
        { key: 'NOT_SURE', label: 'Not Sure', labelHi: 'निश्चित नहीं (Not Sure)', labelGu: 'ખાતરી નથી (Not Sure)' },
      ],
      followUpQuestion:
        'What makes you think customers in this area will need your product or service?',
      followUpQuestionHi:
        'आपको क्या लगता है कि इस क्षेत्र के ग्राहकों को आपके उत्पाद या सेवा की आवश्यकता क्यों होगी?',
      followUpQuestionGu:
        'તમને કેમ લાગે છે કે આ વિસ્તારના ગ્રાહકોને તમારા ઉત્પાદન કે સેવાની જરૂર પડશે?',
    },
    isRequired: true,
    isActive: true,
  },
  {
    id: 'q5_customers_market',
    code: 'CUSTOMERS_MARKET',
    version: 1,
    displayOrder: 5,
    questionText: 'Who are your expected customers, and how will you reach them?',
    questionType: 'MULTI_CHOICE_TEXT',
    options: {
      customerGroups: [
        {
          key: 'local_households',
          label: 'Local households',
          labelHi: 'स्थानीय परिवार / निवासी',
          labelGu: 'સ્થાનિક પરિવારો / રહેવાસીઓ',
        },
        {
          key: 'farmers',
          label: 'Farmers',
          labelHi: 'किसान',
          labelGu: 'ખેડૂતો',
        },
        {
          key: 'nearby_businesses',
          label: 'Nearby shops or businesses',
          labelHi: 'नजदीकी दुकानें या व्यवसाय',
          labelGu: 'નજીકની દુકાનો કે વ્યવસાયો',
        },
        {
          key: 'wholesale_buyers',
          label: 'Wholesale buyers',
          labelHi: 'थोक खरीदार (Wholesalers)',
          labelGu: 'જથ્થાબંધ ખરીદદારો (Wholesalers)',
        },
        {
          key: 'online_customers',
          label: 'Online customers',
          labelHi: 'ऑनलाइन ग्राहक',
          labelGu: 'ઓનલાઇન ગ્રાહકો',
        },
        {
          key: 'other',
          label: 'Other',
          labelHi: 'अन्य',
          labelGu: 'અન્ય',
        },
      ],
      salesChannelPrompt:
        'Describe your planned sales and distribution channels (e.g. direct retail, weekly haat, delivery):',
      salesChannelPromptHi:
        'अपनी नियोजित बिक्री और वितरण चैनलों का वर्णन करें (उदा. सीधी दुकान, साप्ताहिक हाट, डिलीवरी):',
      salesChannelPromptGu:
        'તમારી આયોજિત વેચાણ અને વિતરણ પદ્ધતિઓ વર્ણવો (દા.ત. સીધી દુકાન, સાપ્તાહિક હાટ, ડિલિવરી):',
    },
    isRequired: true,
    isActive: true,
  },
  {
    id: 'q6_business_risks',
    code: 'BUSINESS_RISKS',
    version: 1,
    displayOrder: 6,
    questionText:
      'What are the main challenges you expect while starting or running this business, and what support would help you overcome them?',
    questionType: 'MULTI_CHOICE_CHALLENGES',
    options: {
      challenges: [
        {
          key: 'raw_materials',
          label: 'Availability of raw materials',
          labelHi: 'कच्चे माल की उपलब्धता',
          labelGu: 'કાચા માલની ઉપલબ્ધતા',
        },
        {
          key: 'skilled_labour',
          label: 'Skilled labour',
          labelHi: 'कुशल श्रमिक / कारीगर',
          labelGu: 'કુશળ કારીગરો / મજૂર',
        },
        {
          key: 'transport_logistics',
          label: 'Transport and logistics',
          labelHi: 'परिवहन और लॉजिस्टिक्स',
          labelGu: 'વાહનવ્યવહાર અને લોજિસ્ટિક્સ',
        },
        {
          key: 'competition',
          label: 'Competition',
          labelHi: 'प्रतिस्पर्धा (Competition)',
          labelGu: 'હરીફાઈ (Competition)',
        },
        {
          key: 'utilities',
          label: 'Electricity or water',
          labelHi: 'बिजली या पानी की आपूर्ति',
          labelGu: 'વીજળી અથવા પાણીનો પુરવઠો',
        },
        {
          key: 'customer_access',
          label: 'Access to customers',
          labelHi: 'ग्राहकों तक पहुंच',
          labelGu: 'ગ્રાહકો સુધી પહોંચ',
        },
        {
          key: 'seasonal_demand',
          label: 'Seasonal demand',
          labelHi: 'मौसमी मांग में मंदी',
          labelGu: 'મોસમી માંગમાં ઘટાડો',
        },
        {
          key: 'other',
          label: 'Other',
          labelHi: 'अन्य चुनौतियाँ',
          labelGu: 'અન્ય પડકારો',
        },
        {
          key: 'not_sure',
          label: 'Not sure',
          labelHi: 'निश्चित नहीं',
          labelGu: 'ખાતરી નથી',
        },
      ],
      supportPrompt: 'What specific support, training, or resources would help you overcome these challenges?',
      supportPromptHi: 'इन चुनौतियों से निपटने के लिए आपको क्या विशेष सहायता, प्रशिक्षण या संसाधन चाहिए?',
      supportPromptGu: 'આ પડકારોનો સામનો કરવા માટે તમને કઈ ચોક્કસ સહાય, તાલીમ કે સંસાધનોની જરૂર છે?',
    },
    isRequired: true,
    isActive: true,
  },
];

export async function seedQuestionnaireQuestions(db: any) {
  for (const q of initialQuestions) {
    await db
      .insert(questionnaireQuestions)
      .values(q)
      .onConflictDoUpdate({
        target: questionnaireQuestions.code,
        set: {
          questionText: q.questionText,
          questionType: q.questionType,
          options: q.options,
          isRequired: q.isRequired,
          isActive: q.isActive,
          displayOrder: q.displayOrder,
          version: q.version,
          updatedAt: new Date(),
        },
      });
  }
}
