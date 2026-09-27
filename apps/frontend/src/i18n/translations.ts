export type SupportedLanguage = 'en' | 'hi' | 'gu';

export interface Translations {
  appName: string;
  tagline: string;
  heroHeadline: string;
  heroSubheadline: string;
  startAssessment: string;
  login: string;
  register: string;
  logout: string;
  dashboard: string;
  newAssessment: string;
  myAssessments: string;
  noAssessmentsYet: string;
  startFirstAssessment: string;
  continueAssessment: string;
  viewAssessment: string;
  createdOn: string;
  lastUpdated: string;
  status: string;
  language: string;
  location: string;
  businessCategory: string;
  state: string;
  district: string;
  block: string;
  village: string;
  selectState: string;
  selectDistrict: string;
  selectBlock: string;
  selectVillage: string;
  selectCategory: string;
  preferredLanguage: string;
  save: string;
  saving: string;
  saved: string;
  saveChanges: string;
  next: string;
  back: string;
  cancel: string;
  complete: string;
  completeAssessment: string;
  fieldValidation: string;
  validationChecklist: string;
  entrepreneurProfile: string;
  businessInputs: string;
  reviewAndComplete: string;
  stepBasicDetails: string;
  stepProfile: string;
  stepInputs: string;
  stepValidation: string;
  stepReview: string;
  // Auth
  fullName: string;
  emailAddress: string;
  phoneNumber: string;
  password: string;
  dontHaveAccount: string;
  alreadyHaveAccount: string;
  loginPrompt: string;
  registerPrompt: string;
  authError: string;
  // Profile fields
  previousExperienceTitle: string;
  previousExperienceDesc: string;
  hasLandTitle: string;
  hasLandDesc: string;
  hasShopTitle: string;
  hasShopDesc: string;
  hasRoomTitle: string;
  hasRoomDesc: string;
  hasEquipmentTitle: string;
  hasEquipmentDesc: string;
  workingHoursTitle: string;
  workingHoursDesc: string;
  knownCustomersTitle: string;
  knownCustomersDesc: string;
  yes: string;
  no: string;
  hoursPerDay: string;
  // Validation
  validationTitle: string;
  validationSubtitle: string;
  statusPending: string;
  statusCompleted: string;
  statusSkipped: string;
  notesPlaceholder: string;
  validationWarning: string;
  allTasksSatisfied: string;
  tasksPendingNotice: string;
  // Completion
  assessmentReadyTitle: string;
  completionNote: string;
  stateNoticeTitle: string;
  stateNoticeDesc: string;
}

export const translations: Record<SupportedLanguage, Translations> = {
  en: {
    appName: 'UDAAN',
    tagline: 'Evidence Before Borrowing',
    heroHeadline: 'Smart Business Feasibility & Advisory for Rural Entrepreneurs',
    heroSubheadline:
      'Validate your business idea, map local demand, assess ground realities, and structure loans wisely before committing your hard-earned money.',
    startAssessment: 'Start Business Assessment',
    login: 'Log In',
    register: 'Create Account',
    logout: 'Sign Out',
    dashboard: 'Entrepreneur Dashboard',
    newAssessment: 'Start New Assessment',
    myAssessments: 'My Business Assessments',
    noAssessmentsYet: 'You have not started any business assessments yet.',
    startFirstAssessment: 'Start your first business assessment to check local feasibility and loan readiness.',
    continueAssessment: 'Resume Assessment',
    viewAssessment: 'View Details',
    createdOn: 'Created',
    lastUpdated: 'Updated',
    status: 'Status',
    language: 'Language',
    location: 'Location',
    businessCategory: 'Business Type',
    state: 'State',
    district: 'District',
    block: 'Block / Taluka',
    village: 'Village / Town',
    selectState: 'Select State',
    selectDistrict: 'Select District',
    selectBlock: 'Select Block',
    selectVillage: 'Select Village',
    selectCategory: 'Choose Business Category',
    preferredLanguage: 'Advisory Language',
    save: 'Save',
    saving: 'Saving...',
    saved: 'Saved successfully',
    saveChanges: 'Save Changes',
    next: 'Next Step',
    back: 'Go Back',
    cancel: 'Cancel',
    complete: 'Complete',
    completeAssessment: 'Finalize & Complete Assessment',
    fieldValidation: 'Field Validation',
    validationChecklist: 'Ground Verification Tasks',
    entrepreneurProfile: 'About You & Your Assets',
    businessInputs: 'Business Details & Inputs',
    reviewAndComplete: 'Review & Feasibility Summary',
    stepBasicDetails: '1. Basic Info',
    stepProfile: '2. Profile',
    stepInputs: '3. Inputs',
    stepValidation: '4. Ground Verification',
    stepReview: '5. Summary',
    fullName: 'Full Name',
    emailAddress: 'Email Address',
    phoneNumber: 'Phone Number (10 digits)',
    password: 'Password',
    dontHaveAccount: "Don't have an account? Create one now",
    alreadyHaveAccount: 'Already have an account? Sign in here',
    loginPrompt: 'Sign in to access your business assessments',
    registerPrompt: 'Register to start your rural business feasibility evaluation',
    authError: 'Authentication failed. Please verify your credentials.',
    previousExperienceTitle: 'Previous Business Experience',
    previousExperienceDesc: 'Years and details of any experience you have in this or related trades.',
    hasLandTitle: 'Land Ownership / Access',
    hasLandDesc: 'Do you own or have verified access to the land needed for this business?',
    hasShopTitle: 'Shop or Commercial Premises',
    hasShopDesc: 'Do you currently have a physical shop or commercial space?',
    hasRoomTitle: 'Dedicated Storage / Workroom',
    hasRoomDesc: 'Do you have a secure room or shed for inventory and operations?',
    hasEquipmentTitle: 'Tools & Machinery On-Hand',
    hasEquipmentDesc: 'Do you already own the primary tools, machines, or vehicles needed?',
    workingHoursTitle: 'Expected Daily Working Hours',
    workingHoursDesc: 'How many hours each day will you or your family actively work on this enterprise?',
    knownCustomersTitle: 'Identified Local Customers',
    knownCustomersDesc: 'Do you already know or have confirmed demand from local buyers?',
    yes: 'Yes',
    no: 'No',
    hoursPerDay: 'Hours / day',
    validationTitle: 'Field Ground Verification',
    validationSubtitle:
      'Crucial checks to confirm local demand, competitor prices, and supplier terms before taking any financial risk.',
    statusPending: 'Pending',
    statusCompleted: 'Verified',
    statusSkipped: 'Skipped',
    notesPlaceholder: 'Enter field observations, competitor prices, supplier quotes, or local feedback...',
    validationWarning: 'You must verify or skip all 6 checklist items before completing the assessment.',
    allTasksSatisfied: 'All 6 ground verification checks have been addressed.',
    tasksPendingNotice: 'ground verification items are still pending.',
    assessmentReadyTitle: 'Assessment Overview & Finalization',
    completionNote:
      'Once finalized, your assessment will be processed through the UDAAN feasibility and financial engine.',
    stateNoticeTitle: 'Assessment Workflow Status',
    stateNoticeDesc:
      'Backend status is currently IN_PROGRESS. Completion can be submitted once all verification checks are addressed.',
  },
  hi: {
    appName: 'उड़ान (UDAAN)',
    tagline: 'उधार लेने से पहले प्रमाण',
    heroHeadline: 'ग्रामीण उद्यमियों के लिए व्यापार व्यवहार्यता और सलाह मंच',
    heroSubheadline:
      'अपनी मेहनत की कमाई लगाने से पहले अपने विचार की जांच करें, स्थानीय मांग समझें, और ऋण का सही मूल्यांकन करें।',
    startAssessment: 'व्यापार मूल्यांकन शुरू करें',
    login: 'लॉग इन करें',
    register: 'खाता बनाएं',
    logout: 'लॉग आउट',
    dashboard: 'उद्यमी डैशबोर्ड',
    newAssessment: 'नया मूल्यांकन शुरू करें',
    myAssessments: 'मेरे व्यापार मूल्यांकन',
    noAssessmentsYet: 'आपने अभी तक कोई व्यापार मूल्यांकन शुरू नहीं किया है।',
    startFirstAssessment: 'स्थानीय व्यवहार्यता और ऋण तत्परता जांचने के लिए अपना पहला मूल्यांकन शुरू करें।',
    continueAssessment: 'जारी रखें',
    viewAssessment: 'विवरण देखें',
    createdOn: 'बनाया गया',
    lastUpdated: 'अंतिम अपडेट',
    status: 'स्थिति',
    language: 'भाषा',
    location: 'स्थान',
    businessCategory: 'व्यापार का प्रकार',
    state: 'राज्य',
    district: 'जिला',
    block: 'ब्लॉक / तहसील',
    village: 'गांव / कस्बा',
    selectState: 'राज्य चुनें',
    selectDistrict: 'जिला चुनें',
    selectBlock: 'ब्लॉक चुनें',
    selectVillage: 'गांव चुनें',
    selectCategory: 'व्यापार श्रेणी चुनें',
    preferredLanguage: 'सलाह की भाषा',
    save: 'सहेजें',
    saving: 'सहेजा जा रहा है...',
    saved: 'सफलतापूर्वक सहेजा गया',
    saveChanges: 'परिवर्तन सहेजें',
    next: 'अगला चरण',
    back: 'पीछे जाएं',
    cancel: 'रद्द करें',
    complete: 'पूर्ण करें',
    completeAssessment: 'मूल्यांकन पूरा करें',
    fieldValidation: 'जमीनी सत्यापन',
    validationChecklist: 'जमीनी जांच सूची',
    entrepreneurProfile: 'आपके और संसाधनों के बारे में',
    businessInputs: 'व्यापार विवरण और इनपुट',
    reviewAndComplete: 'समीक्षा और व्यवहार्यता सारांश',
    stepBasicDetails: '1. बुनियादी जानकारी',
    stepProfile: '2. प्रोफ़ाइल',
    stepInputs: '3. इनपुट',
    stepValidation: '4. जमीनी सत्यापन',
    stepReview: '5. सारांश',
    fullName: 'पूरा नाम',
    emailAddress: 'ईमेल पता',
    phoneNumber: 'फ़ोन नंबर (10 अंक)',
    password: 'पासवर्ड',
    dontHaveAccount: 'खाता नहीं है? अभी नया खाता बनाएं',
    alreadyHaveAccount: 'पहले से खाता है? यहाँ लॉग इन करें',
    loginPrompt: 'अपने व्यापार मूल्यांकनों को देखने के लिए साइन इन करें',
    registerPrompt: 'अपनी व्यापार व्यवहार्यता मूल्यांकन के लिए पंजीकरण करें',
    authError: 'प्रमाणीकरण विफल रहा। कृपया अपने विवरण की जाँच करें।',
    previousExperienceTitle: 'पिछला व्यापार अनुभव',
    previousExperienceDesc: 'इस या संबंधित व्यापार में आपके पास कितने वर्षों का अनुभव है?',
    hasLandTitle: 'भूमि स्वामित्व / उपलब्धता',
    hasLandDesc: 'क्या आपके पास इस व्यापार के लिए आवश्यक भूमि उपलब्ध है?',
    hasShopTitle: 'दुकान या व्यावसायिक स्थल',
    hasShopDesc: 'क्या आपके पास वर्तमान में दुकान या व्यावसायिक स्थान है?',
    hasRoomTitle: 'भंडारण / कमरा',
    hasRoomDesc: 'क्या आपके पास सुरक्षित कमरा या गोदाम उपलब्ध है?',
    hasEquipmentTitle: 'औजार और मशीनरी',
    hasEquipmentDesc: 'क्या आपके पास व्यापार के लिए आवश्यक मुख्य उपकरण पहले से हैं?',
    workingHoursTitle: 'दैनिक कार्य के घंटे',
    workingHoursDesc: 'आप या आपका परिवार प्रतिदिन इस कार्य में कितने घंटे देंगे?',
    knownCustomersTitle: 'पहचाने गए स्थानीय ग्राहक',
    knownCustomersDesc: 'क्या आपके पास पहले से कुछ ग्राहक या खरीदार तय हैं?',
    yes: 'हाँ',
    no: 'नहीं',
    hoursPerDay: 'घंटे / दिन',
    validationTitle: 'जमीनी सच्चाई का सत्यापन',
    validationSubtitle:
      'ऋण लेने से पहले स्थानीय मांग, प्रतिस्पर्धी मूल्य और आपूर्तिकर्ता शर्तों की पुष्टि करें।',
    statusPending: 'लंबित',
    statusCompleted: 'सत्यापित',
    statusSkipped: 'छोड़ा गया',
    notesPlaceholder: 'जमीनी टिप्पणियां, बाजार भाव, आपूर्तिकर्ता की जानकारी आदि लिखें...',
    validationWarning: 'मूल्यांकन पूरा करने से पहले सभी 6 मदों को सत्यापित या छोड़ना आवश्यक है।',
    allTasksSatisfied: 'सभी 6 जमीनी सत्यापन मद पूरे हो चुके हैं।',
    tasksPendingNotice: 'जमीनी सत्यापन मद अभी लंबित हैं।',
    assessmentReadyTitle: 'मूल्यांकन सारांश और समापन',
    completionNote:
      'पूर्ण होने के बाद, आपका मूल्यांकन उड़ान व्यवहार्यता और वित्तीय प्रणाली द्वारा संसाधित किया जाएगा।',
    stateNoticeTitle: 'मूल्यांकन कार्यप्रवाह स्थिति',
    stateNoticeDesc:
      'वर्तमान स्थिति प्रगति पर (IN_PROGRESS) है। सत्यापन पूरा होने पर आगे की प्रक्रिया की जा सकती है।',
  },
  gu: {
    appName: 'ઉડાન (UDAAN)',
    tagline: 'ધિરાણ લેતા પહેલા પુરાવો',
    heroHeadline: 'ગ્રામીણ ઉદ્યોગસાહસિકો માટે વ્યાપાર વ્યવહાર્યતા અને સલાહકાર મંચ',
    heroSubheadline:
      'પોતાની મહેનતની કમાણી રોકતા પહેલા સ્થાનિક માંગ, વાસ્તવિકતા અને ધિરાણ યોજનાઓની યોગ્ય ચકાસણી કરો.',
    startAssessment: 'વ્યાપાર મૂલ્યાંકન શરૂ કરો',
    login: 'લૉગ ઇન',
    register: 'નવું ખાતું બનાવો',
    logout: 'લૉગ આઉટ',
    dashboard: 'ઉદ્યોગસાહસિક ડેશબોર્ડ',
    newAssessment: 'નવું મૂલ્યાંકન શરૂ કરો',
    myAssessments: 'મારા વ્યાપાર મૂલ્યાંકન',
    noAssessmentsYet: 'તમે હજી સુધી કોઈ વ્યાપાર મૂલ્યાંકન શરૂ કર્યું નથી.',
    startFirstAssessment: 'સ્થાનિક શક્યતાઓ અને લોન તત્પરતા ચકાસવા માટે પ્રથમ મૂલ્યાંકન શરૂ કરો.',
    continueAssessment: 'આગળ વધો',
    viewAssessment: 'વિગતો જુઓ',
    createdOn: 'બનાવેલ તારીખ',
    lastUpdated: 'છેલ્લું અપડેટ',
    status: 'સ્થિતિ',
    language: 'ભાષા',
    location: 'સ્થળ',
    businessCategory: 'વ્યવસાયનો પ્રકાર',
    state: 'રાજ્ય',
    district: 'જિલ્લો',
    block: 'તાલુકો',
    village: 'ગામ / શહેર',
    selectState: 'રાજ્ય પસંદ કરો',
    selectDistrict: 'જિલ્લો પસંદ કરો',
    selectBlock: 'તાલુકો પસંદ કરો',
    selectVillage: 'ગામ પસંદ કરો',
    selectCategory: 'વ્યાપાર કેટેગરી પસંદ કરો',
    preferredLanguage: 'સલાહ ભાષા',
    save: 'સાચવો',
    saving: 'સાચવી રહ્યું છે...',
    saved: 'સફળતાપૂર્વક સાચવ્યું',
    saveChanges: 'ફેરફારો સાચવો',
    next: 'આગળનું પગલું',
    back: 'પાછા જાઓ',
    cancel: 'રદ કરો',
    complete: 'પૂર્ણ કરો',
    completeAssessment: 'મૂલ્યાંકન પૂર્ણ કરો',
    fieldValidation: 'જમીની ચકાસણી',
    validationChecklist: 'જમીની ચકાસણી કાર્યો',
    entrepreneurProfile: 'તમારી અને સંસાધનોની વિગત',
    businessInputs: 'વ્યાપાર વિગતો અને ઇનપુટ્સ',
    reviewAndComplete: 'સમીક્ષા અને વ્યવહાર્યતા સારાંશ',
    stepBasicDetails: '૧. મૂળભૂત વિગતો',
    stepProfile: '૨. પ્રોફાઇલ',
    stepInputs: '૩. ઇનપુટ્સ',
    stepValidation: '૪. જમીની ચકાસણી',
    stepReview: '૫. સારાંશ',
    fullName: 'પૂરું નામ',
    emailAddress: 'ઈમેલ એડ્રેસ',
    phoneNumber: 'ફોન નંબર (૧૦ અંક)',
    password: 'પાસવર્ડ',
    dontHaveAccount: 'ખાતું નથી? નવું ખાતું બનાવો',
    alreadyHaveAccount: 'પહેલેથી ખાતું છે? અહીં લૉગ ઇન કરો',
    loginPrompt: 'તમારા વ્યાપાર મૂલ્યાંકન જોવા માટે લૉગ ઇન કરો',
    registerPrompt: 'તમારા વ્યાપારની ચકાસણી માટે નોંધણી કરો',
    authError: 'પ્રમાણીકરણ નિષ્ફળ રહ્યું. કૃપા કરીને તમારી વિગતો તપાસો.',
    previousExperienceTitle: 'અગાઉનો વ્યાપાર અનુભવ',
    previousExperienceDesc: 'આ કે અન્ય સંબંધિત વેપારમાં તમારો કેટલા વર્ષનો અનુભવ છે?',
    hasLandTitle: 'જમીન માલિકી / પ્રાપ્યતા',
    hasLandDesc: 'શું તમારી પાસે આ વ્યવસાય માટે જરૂરી જમીન ઉપલબ્ધ છે?',
    hasShopTitle: 'દુકાન કે વ્યાપારી સ્થળ',
    hasShopDesc: 'શું તમારી પાસે હાલમાં દુકાન કે ધંધાકીય જગ્યા છે?',
    hasRoomTitle: 'સંગ્રહ માટે ઓરડો / ગોડાઉન',
    hasRoomDesc: 'શું તમારી પાસે માલસામાન રાખવા માટે સલામત ઓરડો છે?',
    hasEquipmentTitle: 'સાધન-સામગ્રી અને મશીનરી',
    hasEquipmentDesc: 'શું તમારી પાસે વ્યવસાય માટેના મુખ્ય સાધનો પહેલેથી છે?',
    workingHoursTitle: 'રોજિંદા કામના કલાકો',
    workingHoursDesc: 'તમે કે તમારો પરિવાર રોજ કેટલા કલાક આ ધંધામાં સમય ફાળવશો?',
    knownCustomersTitle: 'જાણીતા સ્થાનિક ગ્રાહકો',
    knownCustomersDesc: 'શું તમારી પાસે પહેલેથી નક્કી થયેલા ગ્રાહકો કે ખરીદદારો છે?',
    yes: 'હા',
    no: 'ના',
    hoursPerDay: 'કલાક / દિવસ',
    validationTitle: 'જમીની વાસ્તવિકતાની ચકાસણી',
    validationSubtitle:
      'લોન લેતા પહેલા સ્થાનિક માંગ, હરીફોના ભાવ અને સપ્લાયર શરતોની જાતે ખાતરી કરો.',
    statusPending: 'બાકી',
    statusCompleted: 'ચકાસાયેલ',
    statusSkipped: 'છોડી દીધેલ',
    notesPlaceholder: 'જમીની અવલોકનો, હરીફ ભાવો, સપ્લાયરની વિગતો વગેરે નોંધો...',
    validationWarning: 'મૂલ્યાંકન પૂરું કરતા પહેલા તમામ ૬ કાર્યોની ચકાસણી કે સ્કીપ કરવું જરૂરી છે.',
    allTasksSatisfied: 'બધા ૬ ચકાસણી કાર્યો પૂર્ણ થયા છે.',
    tasksPendingNotice: 'ચકાસણી કાર્યો હજુ બાકી છે.',
    assessmentReadyTitle: 'મૂલ્યાંકન સારાંશ અને આખરી આખરીકરણ',
    completionNote:
      'પૂર્ણ થયા પછી, તમારું મૂલ્યાંકન ઉડાન વ્યવહાર્યતા અને નાણાકીય સિસ્ટમ દ્વારા પ્રોસેસ થશે.',
    stateNoticeTitle: 'મૂલ્યાંકન સ્થિતિ',
    stateNoticeDesc:
      'હાલની સ્થિતિ પ્રગતિમાં (IN_PROGRESS) છે. જમીની ચકાસણી પૂર્ણ થતાં આગળ વધી શકાય છે.',
  },
};
