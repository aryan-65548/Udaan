export type SupportedLanguage = 'en' | 'hi' | 'gu';

export interface Translations {
  // Brand & General
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
  viewPreviousAssessments: string;
  profile: string;
  help: string;
  faqs: string;
  save: string;
  saving: string;
  saved: string;
  saveChanges: string;
  cancel: string;
  next: string;
  back: string;
  submit: string;
  submitting: string;
  complete: string;
  delete: string;
  deleting: string;
  confirm: string;
  yes: string;
  no: string;
  close: string;
  refresh: string;
  loading: string;
  error: string;
  success: string;
  required: string;
  optional: string;
  edit: string;

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
  enterValidEmail: string;
  enterValidPhone: string;
  enterPassword: string;
  enterFullName: string;
  passwordMinLength: string;
  signingIn: string;
  creatingAccount: string;
  accountAlreadyExistsError: string;
  signInInstead: string;
  forgotPassword: string;
  orDivider: string;
  continueWithGoogle: string;
  signUpWithGoogle: string;
  googleAuthNotConfigured: string;
  googleAuthFailed: string;

  // Dashboard
  welcomeUser: string;
  dashboardSubtitle: string;
  quickActions: string;
  startNewAssessmentCardTitle: string;
  startNewAssessmentCardDesc: string;
  previousAssessmentsCardTitle: string;
  previousAssessmentsCardDesc: string;
  profileCardTitle: string;
  profileCardDesc: string;
  helpCardTitle: string;
  helpCardDesc: string;
  advisoryGuideCardTitle: string;
  advisoryGuideCardDesc: string;
  learnMore: string;
  googleAccountLinked: string;
  setPassword: string;
  setPasswordSubtitle: string;
  noVillagesAvailable: string;
  savedAtBlockLevel: string;
  contributionExceedsFundsError: string;
  networkError: string;
  goToLogin: string;
  recentAssessments: string;
  viewAllAssessments: string;
  noAssessmentsYet: string;
  startFirstAssessment: string;
  continueAssessment: string;
  viewAssessment: string;
  viewResults: string;
  assessmentId: string;
  createdOn: string;
  lastUpdated: string;
  status: string;
  language: string;
  operatingLocation: string;

  // Previous Assessments Page
  previousAssessmentsTitle: string;
  previousAssessmentsSubtitle: string;
  filterAll: string;
  noPreviousAssessments: string;
  category: string;
  locationLabel: string;
  dateCreated: string;
  statusLabel: string;
  actions: string;

  // Profile Page
  profileTitle: string;
  profileSubtitle: string;
  profileOverview: string;
  accountDetails: string;
  userRole: string;
  preferredLanguage: string;
  editProfile: string;
  saveProfileChanges: string;
  profileUpdatedSuccess: string;
  profileUpdateFailed: string;
  businessProfile: string;
  businessProfileSubtitle: string;
  businessName: string;
  businessNamePlaceholder: string;
  primarySector: string;
  operatingState: string;
  operatingDistrict: string;
  experienceLevel: string;
  expBeginner: string;
  expSome: string;
  expExperienced: string;
  businessBackground: string;
  businessBackgroundPlaceholder: string;
  accountActivity: string;
  totalAssessments: string;
  inProgressAssessments: string;
  completedAssessments: string;
  memberSince: string;
  changePassword: string;
  changePasswordSubtitle: string;
  currentPassword: string;
  newPassword: string;
  newPasswordPlaceholder: string;
  passwordMismatch: string;
  passwordChangedSuccess: string;
  dangerZone: string;
  deleteAccountTitle: string;
  deleteAccountWarning: string;
  deleteAccountBtn: string;
  confirmDeleteTitle: string;
  confirmDeletePrompt: string;
  confirmDeleteConfirmBtn: string;
  accountDeletedSuccess: string;
  accountDeleteFailed: string;

  // Help Page
  helpTitle: string;
  helpSubtitle: string;
  aboutUdaanTitle: string;
  aboutUdaanDesc: string;
  whyUdaanTitle: string;
  whyUdaanDesc: string;
  howItWorksTitle: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  step4Title: string;
  step4Desc: string;
  financialGuidanceTitle: string;
  ownContributionVsLoanTitle: string;
  ownContributionVsLoanDesc: string;
  loanWarningTitle: string;
  loanWarningDesc: string;
  whatToPrepareTitle: string;
  prepItem1: string;
  prepItem2: string;
  prepItem3: string;
  prepItem4: string;
  faqsTitle: string;
  faq1Q: string;
  faq1A: string;
  faq2Q: string;
  faq2A: string;
  faq3Q: string;
  faq3A: string;
  faq4Q: string;
  faq4A: string;
  faq5Q: string;
  faq5A: string;

  // Location & Category Setup
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
  otherCategory: string;
  customCategoryLabel: string;
  customCategoryPlaceholder: string;
  customCategoryRequired: string;
  cantFindLocation: string;
  enterLocationManually: string;
  useLocationDropdowns: string;
  manualStatePlaceholder: string;
  manualDistrictPlaceholder: string;
  manualBlockPlaceholder: string;
  manualVillagePlaceholder: string;
  selectedLocationText: string;

  // Assessment Steps & Inputs
  assessmentWorkflowTitle: string;
  stepBasic: string;
  stepIdeaResources: string;
  stepFinance: string;
  stepReview: string;
  basicDetailsTitle: string;
  basicDetailsSubtitle: string;
  businessIdeaTitle: string;
  businessIdeaSubtitle: string;
  businessIdeaPlaceholder: string;
  businessIdeaExamples: string;
  businessIdeaRequired: string;
  availableResourcesTitle: string;
  availableResourcesSubtitle: string;
  resourceLand: string;
  resourceShop: string;
  resourceMachinery: string;
  resourceTools: string;
  resourceInfrastructure: string;
  resourceSavings: string;
  resourceOther: string;
  resourceNone: string;
  otherResourcePlaceholder: string;
  availableFundsTitle: string;
  availableFundsSubtitle: string;
  availableFundsPlaceholder: string;
  ownContributionTitle: string;
  ownContributionSubtitle: string;
  ownContributionPlaceholder: string;
  ownContributionNote: string;
  ownContributionRequired: string;
  negativeContributionError: string;
  invalidAmountError: string;
  projectCostTitle: string;
  projectCostSubtitle: string;
  projectCostPlaceholder: string;
  projectCostRequired: string;
  negativeProjectCostError: string;
  applicableScheme: string;
  requiredContributionLabel: string;
  statedContributionLabel: string;
  contributionShortfallLabel: string;
  noShortfallNotice: string;
  shortfallWarningNotice: string;
  quarterlyInstallmentLabel: string;
  tenureAndMoratoriumLabel: string;
  totalInterestLabel: string;
  totalRepaymentLabel: string;
  notEligibleProjectCostError: string;
  recalculatingFinance: string;
  preliminaryFinanceTitle: string;
  minAssumedContributionPercent: string;
  maxTheoreticalProjectCost: string;
  maxTheoreticalLoanAmount: string;
  preliminaryFinanceDisclaimer: string;
  zeroContributionNotice: string;
  reviewTitle: string;
  reviewSubtitle: string;
  summaryIdentity: string;
  summaryIdea: string;
  summaryResources: string;
  summaryFinance: string;
  submitAssessmentBtn: string;
  submittingAssessment: string;
  assessmentSubmittedSuccess: string;
  assessmentDraftSaved: string;
  returnToDashboard: string;
  backToAssessments: string;

  statusDraft: string;
  statusInProgress: string;
  statusCompleted: string;
  statusSkipped: string;
  statusPending: string;
  statusAiAnalyzing: string;
  statusReportReady: string;
  notesPlaceholder: string;

  // Report & Feasibility Keys
  reportHeaderTitle: string;
  reportHeaderSubtitle: string;
  downloadPdfBtn: string;
  downloadingPdfBtn: string;
  pdfSuccessNotice: string;
  section1Nav: string;
  section2Nav: string;
  section3Nav: string;
  section4Nav: string;
  section5Nav: string;
  section6Nav: string;
  section7Nav: string;
  section8Nav: string;
  section9Nav: string;
  section10Nav: string;
  section11Nav: string;
  section12Nav: string;
  targetCustomerSegmentsLabel: string;
  financialViabilitySnapshotLabel: string;
  keyStrengthsLabel: string;
  criticalWatchpointsLabel: string;
  demandDriversLabel: string;
  competitorProfilesTable: string;
  differentiationStrategyLabel: string;
  inventoryMixTable: string;
  turnoverVelocityLabel: string;
  grossMarginRangeLabel: string;
  workingCapitalDisciplineLabel: string;
  financialFeasibilityTitle: string;
  totalOutlayLabel: string;
  ownEquityLabel: string;
  bankLoanLabel: string;
  monthlyEmiLabel: string;
  minOwnContributionBadge: string;
  marginShortfallAlert: string;
  marginCompliantBadge: string;
  schemeDetailsTitle: string;
  interestRateLabel: string;
  tenureMoratoriumLabel: string;
  dscrStatusLabel: string;
  amortizationScheduleTitle: string;
  showScheduleBtn: string;
  hideScheduleBtn: string;
  periodLabel: string;
  openingPrincipalLabel: string;
  principalPaymentLabel: string;
  interestPaymentLabel: string;
  installmentAmountLabel: string;
  closingPrincipalLabel: string;
  disclaimerLabel: string;
  swotStrengthsLabel: string;
  swotWeaknessesLabel: string;
  swotOpportunitiesLabel: string;
  swotThreatsLabel: string;
  riskFactorLabel: string;
  likelihoodImpactLabel: string;
  mitigationStrategyLabel: string;
  monitoringIndicatorLabel: string;
  infrastructureAssessmentTitle: string;
  infrastructureFindingsTitle: string;
  businessImpactLabel: string;
  recommendedActionsLabel: string;
  operationalPriorityLabel: string;
  supportOrganizationsTitle: string;
  learningVideosTitle: string;
  actionPlanTitle: string;
  conclusionTitle: string;
  limitationsTitle: string;
}

export const translations: Record<SupportedLanguage, Translations> = {
  en: {
    // Brand & General
    appName: 'UDAAN',
    tagline: 'Evidence Before Borrowing',
    heroHeadline: 'Smart Business Feasibility & Advisory for Rural & Semi-Urban Entrepreneurs',
    heroSubheadline:
      'Validate your business idea, map local demand, evaluate available assets, and structure your financial contribution before taking any loan.',
    startAssessment: 'Start Business Assessment',
    login: 'Log In',
    register: 'Create Account',
    logout: 'Sign Out',
    dashboard: 'Dashboard',
    newAssessment: 'Start New Assessment',
    myAssessments: 'My Assessments',
    viewPreviousAssessments: 'View Previous Assessments',
    profile: 'Profile',
    help: 'Help & Guide',
    faqs: 'Frequently Asked Questions',
    save: 'Save',
    saving: 'Saving...',
    saved: 'Saved successfully',
    saveChanges: 'Save Changes',
    cancel: 'Cancel',
    next: 'Next',
    back: 'Back',
    submit: 'Submit Assessment',
    submitting: 'Submitting...',
    complete: 'Complete',
    delete: 'Delete',
    deleting: 'Deleting...',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    close: 'Close',
    refresh: 'Refresh',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    required: 'Required',
    optional: 'Optional',
    edit: 'Edit',

    // Auth
    fullName: 'Full Name',
    emailAddress: 'Email Address',
    phoneNumber: 'Phone Number',
    password: 'Password',
    dontHaveAccount: "Don't have an account? Register here",
    alreadyHaveAccount: 'Already have an account? Log in',
    loginPrompt: 'Sign in to access your feasibility assessments and advisory reports.',
    registerPrompt: 'Create your free account to evaluate business feasibility in your area.',
    authError: 'Authentication failed. Please check your credentials.',
    enterValidEmail: 'Please enter a valid email address.',
    enterValidPhone: 'Please enter a valid phone number (10 digits).',
    enterPassword: 'Please enter your password.',
    enterFullName: 'Please enter your full name.',
    passwordMinLength: 'Password must be at least 6 characters.',
    signingIn: 'Signing in...',
    creatingAccount: 'Creating account...',
    accountAlreadyExistsError: 'An account with this email address already exists. Please sign in instead.',
    signInInstead: 'Sign In Instead',
    forgotPassword: 'Forgot Password?',
    orDivider: 'OR',
    continueWithGoogle: 'Continue with Google',
    signUpWithGoogle: 'Sign up with Google',
    googleAuthNotConfigured: 'Google OAuth is not configured on this server.',
    googleAuthFailed: 'Google authentication failed. Please try again or sign in with your password.',

    // Dashboard
    welcomeUser: 'Welcome',
    dashboardSubtitle: 'Check business viability, evaluate local ground demand, and structure finance wisely.',
    quickActions: 'Main Options',
    startNewAssessmentCardTitle: 'Start New Assessment',
    startNewAssessmentCardDesc: 'Begin a new feasibility assessment for your proposed business idea.',
    previousAssessmentsCardTitle: 'View Previous Assessments',
    previousAssessmentsCardDesc: 'Review and continue previously created business feasibility dossiers.',
    profileCardTitle: 'Profile & Settings',
    profileCardDesc: 'View and update your personal details, language preference, and account.',
    helpCardTitle: 'Help & Guidance',
    helpCardDesc: 'Learn how UDAAN works, how to prepare, and read important advisory guidelines.',
    advisoryGuideCardTitle: 'Business Advisory Guide',
    advisoryGuideCardDesc: 'Understand how UDAAN evaluates market demand, viability, and risk factors before borrowing.',
    learnMore: 'Learn More',
    googleAccountLinked: 'Linked with Google',
    setPassword: 'Set Password',
    setPasswordSubtitle: 'Create a secure password if you wish to sign in with email/phone and password.',
    noVillagesAvailable: 'Village/Town data not available for this block',
    savedAtBlockLevel: 'Location is saved at the Block/Taluka level.',
    contributionExceedsFundsError: 'Own contribution cannot exceed your declared available funds',
    networkError: 'Unable to reach the server. Please check your internet connection and try again.',
    goToLogin: 'Go to Log In',
    recentAssessments: 'Recent Assessments',
    viewAllAssessments: 'View All Assessments',
    noAssessmentsYet: 'You have not started any business assessments yet.',
    startFirstAssessment: 'Start your first business assessment to check feasibility before taking a loan.',
    continueAssessment: 'Continue Assessment',
    viewAssessment: 'View Assessment',
    viewResults: 'View Results',
    assessmentId: 'Assessment ID',
    createdOn: 'Created',
    lastUpdated: 'Last Updated',
    status: 'Status',
    language: 'Language',
    operatingLocation: 'Operating Location',

    // Previous Assessments Page
    previousAssessmentsTitle: 'Previous Assessments',
    previousAssessmentsSubtitle: 'All feasibility assessments and business evaluations created under your account.',
    filterAll: 'All Assessments',
    noPreviousAssessments: 'No previous assessments found.',
    category: 'Business Category',
    locationLabel: 'Location',
    dateCreated: 'Date Created',
    statusLabel: 'Current Status',
    actions: 'Actions',

    // Profile Page
    profileTitle: 'My Profile',
    profileSubtitle: 'Manage your personal account details, business profile, and application preferences.',
    profileOverview: 'Profile Overview',
    accountDetails: 'Account Information',
    userRole: 'Role',
    preferredLanguage: 'Preferred Advisory Language',
    editProfile: 'Edit Profile',
    saveProfileChanges: 'Save Profile Changes',
    profileUpdatedSuccess: 'Profile updated successfully.',
    profileUpdateFailed: 'Failed to update profile. Please try again.',
    businessProfile: 'Business Profile (Optional)',
    businessProfileSubtitle: 'Optional details about your enterprise and business experience.',
    businessName: 'Preferred Business Name',
    businessNamePlaceholder: 'e.g. Patel Dairy & Agro Products',
    primarySector: 'Primary Business Sector / Category',
    operatingState: 'Operating State',
    operatingDistrict: 'Operating District',
    experienceLevel: 'Entrepreneur Experience Level',
    expBeginner: 'Beginner (New to business)',
    expSome: 'Some Experience (1-3 years)',
    expExperienced: 'Experienced (3+ years in enterprise)',
    businessBackground: 'Short Business / Entrepreneurial Background',
    businessBackgroundPlaceholder: 'Briefly describe your business background, aspirations, or previous activities...',
    accountActivity: 'Account Activity',
    totalAssessments: 'Total Assessments',
    inProgressAssessments: 'In Progress',
    completedAssessments: 'Completed',
    memberSince: 'Member Since',
    changePassword: 'Change Password',
    changePasswordSubtitle: 'Leave blank if you do not wish to change your password.',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    newPasswordPlaceholder: 'Min. 6 characters',
    passwordMismatch: 'Current password does not match.',
    passwordChangedSuccess: 'Password updated successfully.',
    dangerZone: 'Danger Zone',
    deleteAccountTitle: 'Delete Account',
    deleteAccountWarning:
      'Deleting your account will permanently remove all your profile data and saved assessments. This action cannot be undone.',
    deleteAccountBtn: 'Delete My Account',
    confirmDeleteTitle: 'Confirm Account Deletion',
    confirmDeletePrompt: 'Are you sure you want to permanently delete your account and all associated assessment records?',
    confirmDeleteConfirmBtn: 'Yes, Delete My Account',
    accountDeletedSuccess: 'Your account has been deleted successfully.',
    accountDeleteFailed: 'Failed to delete account. Please try again.',

    // Help Page
    helpTitle: 'Help & Advisory Guide',
    helpSubtitle: 'Comprehensive guidance for rural and semi-urban entrepreneurs on using UDAAN.',
    aboutUdaanTitle: 'What is UDAAN?',
    aboutUdaanDesc:
      'UDAAN (“Evidence Before Borrowing”) is an AI-assisted business advisory and feasibility assessment platform built for rural and semi-urban entrepreneurs. It helps individuals evaluate whether a business idea has sufficient local demand and viability before taking commercial or microfinance loans.',
    whyUdaanTitle: 'Why Does UDAAN Exist and Whom Does It Help?',
    whyUdaanDesc:
      'Many rural entrepreneurs take high-interest loans without verifying local demand, competitor saturation, or required operating capital, leading to severe debt distress. UDAAN is designed for farmers, rural youth, women self-help groups (SHGs), and micro-retailers to test feasibility before borrowing.',
    howItWorksTitle: 'How UDAAN Works — Step-by-Step Flow',
    step1Title: '1. Basic Location & Category Setup',
    step1Desc: 'Select your state, district, taluka, and village, then select or enter your business sector.',
    step2Title: '2. Business Idea & Resource Audit',
    step2Desc: 'Describe your proposed enterprise and select existing assets (land, shop, machinery, savings).',
    step3Title: '3. Financial Contribution',
    step3Desc: 'Specify how much own capital you can invest towards the venture to understand loan readiness.',
    step4Title: '4. Review & Ground Verification',
    step4Desc: 'Verify all parameters, examine local conditions, and generate your feasibility evaluation.',
    financialGuidanceTitle: 'Understanding Project Cost vs. Own Contribution vs. Loan',
    ownContributionVsLoanTitle: 'Important Principle: Own Funds vs. Borrowed Funds',
    ownContributionVsLoanDesc:
      'Your Own Contribution is the money or savings you can safely invest without borrowing. Total Project Cost is the complete setup expense. The Potential Loan Requirement is the gap between the two. UDAAN helps you evaluate if your business cashflow can safely repay that loan.',
    loanWarningTitle: 'Platform Advisory Notice',
    loanWarningDesc:
      'UDAAN is an advisory and feasibility assessment platform. UDAAN does not guarantee loan approval, bank sanctions, government subsidies, or guaranteed business profits. All figures are advisory estimates to help you make informed decisions.',
    whatToPrepareTitle: 'What to Prepare Before Starting an Assessment',
    prepItem1: 'Clear description of your proposed business product or service.',
    prepItem2: 'Exact village/town and taluka/block where the business will operate.',
    prepItem3: 'List of physical assets you already own (land, shop space, machinery, tools).',
    prepItem4: 'Amount of personal savings available for initial investment.',
    faqsTitle: 'Frequently Asked Questions (FAQs)',
    faq1Q: 'Is UDAAN a loan provider or bank?',
    faq1A: 'No. UDAAN is a feasibility advisory tool to help you evaluate if taking a loan makes economic sense before applying to banks or microfinance institutions.',
    faq2Q: 'What if my village or taluka is not in the dropdown list?',
    faq2A: 'You can easily click “Can’t find your location? Enter it manually” and type your village, block, district, or state directly.',
    faq3Q: 'What if my business idea does not match any listed category?',
    faq3A: 'Select the “Other” option at the end of the category list and type your custom business description in the text box.',
    faq4Q: 'Can I change my preferred language later?',
    faq4A: 'Yes! You can toggle between English, Hindi, and Gujarati at any time using the language buttons in the top navigation bar.',
    faq5Q: 'Does submitting an assessment lock my account or obligate me to take a loan?',
    faq5A: 'Not at all. You can create multiple assessments for different business ideas and review them anytime from your dashboard.',

    // Location & Category Setup
    location: 'Operating Location',
    businessCategory: 'Business Category',
    state: 'State',
    district: 'District',
    block: 'Block / Taluka',
    village: 'Village / Town',
    selectState: 'Select State',
    selectDistrict: 'Select District',
    selectBlock: 'Select Block / Taluka',
    selectVillage: 'Select Village / Town',
    selectCategory: 'Select Business Category',
    otherCategory: 'Other / Custom Business',
    customCategoryLabel: 'Please specify your business category',
    customCategoryPlaceholder: 'e.g. Handmade Bamboo Furniture, Poultry Broiler Unit...',
    customCategoryRequired: 'Please enter your custom business category.',
    cantFindLocation: "Can't find your location? Enter it manually.",
    enterLocationManually: 'Enter location manually',
    useLocationDropdowns: 'Switch back to location dropdowns',
    manualStatePlaceholder: 'Enter State / UT name',
    manualDistrictPlaceholder: 'Enter District name',
    manualBlockPlaceholder: 'Enter Block / Taluka name',
    manualVillagePlaceholder: 'Enter Village / Town name',
    selectedLocationText: 'Selected Location:',

    // Assessment Steps & Inputs
    assessmentWorkflowTitle: 'Business Feasibility Assessment',
    stepBasic: '1. Setup',
    stepIdeaResources: '2. Idea & Resources',
    stepFinance: '3. Financial Contribution',
    stepReview: '4. Review & Submit',
    basicDetailsTitle: '1. Basic Assessment Setup',
    basicDetailsSubtitle: 'Specify where your enterprise will operate and what type of business you want to start.',
    businessIdeaTitle: 'What is your business idea?',
    businessIdeaSubtitle: 'Describe the specific business activity, products, or services you plan to offer in your area.',
    businessIdeaPlaceholder: 'e.g. Starting a small dairy business with 3 indigenous cows to supply fresh milk to local dairy cooperative and nearby village households...',
    businessIdeaExamples: 'Examples: Opening a tailoring shop, starting a flour mill, setting up a food processing unit, running a mobile repair shop.',
    businessIdeaRequired: 'Please describe your business idea.',
    availableResourcesTitle: 'What resources or capital do you already have available for this business?',
    availableResourcesSubtitle: 'Select all assets, premises, or equipment you currently own or have access to.',
    resourceLand: 'Land',
    resourceShop: 'Existing building or shop space',
    resourceMachinery: 'Machinery or processing equipment',
    resourceTools: 'Tools or furniture',
    resourceInfrastructure: 'Existing business infrastructure (power, water, sheds)',
    resourceSavings: 'Cash savings / Monetary funds',
    resourceOther: 'Other resources (describe below)',
    resourceNone: 'None of these (starting without existing assets)',
    otherResourcePlaceholder: 'Please describe any other available assets or resources...',
    availableFundsTitle: 'Monetary Funds / Cash Savings Available (₹)',
    availableFundsSubtitle: 'Estimated cash or bank balance currently available to invest into the business.',
    availableFundsPlaceholder: 'e.g. 25000',
    ownContributionTitle: 'How much money can you contribute from your own funds toward this business?',
    ownContributionSubtitle: 'This is the amount of your own funds you are willing and able to invest in the proposed business. It may be less than your available savings and is separate from borrowed funds.',
    ownContributionPlaceholder: 'e.g. 100000',
    ownContributionNote: 'This is your own financial contribution toward setting up the business, NOT the total project cost and NOT the requested loan amount. Enter 0 if you currently have no funds to contribute.',
    ownContributionRequired: 'Please enter your own contribution amount (enter 0 if none).',
    negativeContributionError: 'Own contribution amount cannot be negative.',
    invalidAmountError: 'Please enter a valid, non-negative monetary amount.',
    projectCostTitle: 'Total Proposed Business Project Cost (₹)',
    projectCostSubtitle: 'Estimated total setup expenditure including machinery, tools, inventory, premises, and working capital.',
    projectCostPlaceholder: 'e.g. 140000',
    projectCostRequired: 'Please enter the total proposed project cost.',
    negativeProjectCostError: 'Total project cost cannot be negative.',
    applicableScheme: 'Applicable Financing Scheme',
    requiredContributionLabel: 'Required Own Contribution (Margin)',
    statedContributionLabel: 'Your Stated Contribution',
    contributionShortfallLabel: 'Contribution Shortfall',
    noShortfallNotice: 'Full margin requirement is met with your available contribution.',
    shortfallWarningNotice: 'Additional margin required to meet scheme loan requirements.',
    quarterlyInstallmentLabel: 'Estimated Quarterly Installment',
    tenureAndMoratoriumLabel: 'Tenure & Moratorium',
    totalInterestLabel: 'Total Estimated Interest',
    totalRepaymentLabel: 'Total Estimated Repayment',
    notEligibleProjectCostError: 'Project cost exceeds the ₹50,00,000 ceiling for government loan schemes.',
    recalculatingFinance: 'Calculating authoritative scheme and financial schedule...',
    preliminaryFinanceTitle: 'Preliminary Financial Estimates (10% Minimum Own-Contribution Assumption)',
    minAssumedContributionPercent: 'Minimum Assumed Own Contribution',
    maxTheoreticalProjectCost: 'Maximum Theoretical Project Cost',
    maxTheoreticalLoanAmount: 'Maximum Theoretical Loan Amount (90% Financing)',
    preliminaryFinanceDisclaimer: 'Preliminary theoretical estimates based on a standard 10% minimum own-contribution (margin money) assumption. Actual loan eligibility, interest rates, margin requirements, and disbursement depend on the specific lending scheme, eligible project expenses, bank appraisal, and statutory credit limits. This does not constitute a loan approval, offer, or guarantee.',
    zeroContributionNotice: 'When own contribution is ₹0, a positive theoretical project cost or loan amount cannot be calculated under the 10% minimum contribution assumption. A positive own contribution is required.',
    reviewTitle: 'Review & Submit Assessment',
    reviewSubtitle: 'Check your entered details before submitting your business assessment.',
    summaryIdentity: 'Enterprise & Location Setup',
    summaryIdea: 'Business Idea',
    summaryResources: 'Available Resources & Assets',
    summaryFinance: 'Financial Contribution',
    submitAssessmentBtn: 'Submit Feasibility Assessment',
    submittingAssessment: 'Submitting Assessment...',
    assessmentSubmittedSuccess: 'Assessment submitted successfully! You can review details anytime.',
    assessmentDraftSaved: 'Assessment updated and saved successfully.',
    returnToDashboard: 'Return to Dashboard',
    backToAssessments: 'Back to Assessments',

    // Status Labels
    statusDraft: 'Draft',
    statusInProgress: 'In Progress',
    statusCompleted: 'Completed',
    statusSkipped: 'Skipped',
    statusPending: 'Pending',
    statusAiAnalyzing: 'Analyzing',
    statusReportReady: 'Report Ready',
    notesPlaceholder: 'Enter verification notes or observations...',

    // Report & Feasibility Keys
    reportHeaderTitle: 'Business Feasibility & Advisory Intelligence Report',
    reportHeaderSubtitle: 'Comprehensive Viability Assessment, Financial Projections & Ground Reality Evaluation',
    downloadPdfBtn: 'Download PDF Report',
    downloadingPdfBtn: 'Generating PDF...',
    pdfSuccessNotice: 'PDF Report downloaded successfully! Assessment status recorded as COMPLETED.',
    section1Nav: '1. Executive Summary',
    section2Nav: '2. Market Analysis',
    section3Nav: '3. Competition',
    section4Nav: '4. Pricing & Products',
    section5Nav: '5. Financial Feasibility',
    section6Nav: '6. SWOT Analysis',
    section7Nav: '7. Risks & Mitigation',
    section8Nav: '8. Infrastructure',
    section9Nav: '9. Support Organizations',
    section10Nav: '10. Learning Resources',
    section11Nav: '11. Action Plan',
    section12Nav: '12. Conclusion',
    targetCustomerSegmentsLabel: 'Target Customers',
    financialViabilitySnapshotLabel: 'Financial Viability Snapshot',
    keyStrengthsLabel: 'Key Commercial Strengths',
    criticalWatchpointsLabel: 'Critical Watchpoints',
    demandDriversLabel: 'Local Demand Drivers',
    competitorProfilesTable: 'Local Competitor Profiles',
    differentiationStrategyLabel: 'Differentiation Strategy',
    inventoryMixTable: 'Product Category & Target Margin Mix',
    turnoverVelocityLabel: 'Turnover Velocity',
    grossMarginRangeLabel: 'Target Gross Margin Range',
    workingCapitalDisciplineLabel: 'Working Capital & Credit Discipline',
    financialFeasibilityTitle: 'Financial Feasibility & Scheme Structure',
    totalOutlayLabel: 'Total Project Outlay',
    ownEquityLabel: 'Own Equity Contribution',
    bankLoanLabel: 'Required Bank Loan',
    monthlyEmiLabel: 'Estimated Monthly Installment (EMI)',
    minOwnContributionBadge: '10% Minimum Own Contribution Rule',
    marginShortfallAlert: 'Own Equity Shortfall: A minimum applicant equity margin of 10% is required under government guidelines.',
    marginCompliantBadge: 'Meets 10% Minimum Equity Requirement',
    schemeDetailsTitle: 'Government Credit Scheme Parameters',
    interestRateLabel: 'Annual Interest Rate',
    tenureMoratoriumLabel: 'Tenure & Moratorium',
    dscrStatusLabel: 'DSCR Debt Service Status',
    amortizationScheduleTitle: 'Detailed Loan Amortization Schedule',
    showScheduleBtn: 'View Full Amortization Schedule',
    hideScheduleBtn: 'Hide Full Amortization Schedule',
    periodLabel: 'Period',
    openingPrincipalLabel: 'Opening Principal',
    principalPaymentLabel: 'Principal',
    interestPaymentLabel: 'Interest',
    installmentAmountLabel: 'Installment',
    closingPrincipalLabel: 'Closing Balance',
    disclaimerLabel: 'Financial Advisory Disclaimer',
    swotStrengthsLabel: 'Strengths (Internal)',
    swotWeaknessesLabel: 'Weaknesses (Internal)',
    swotOpportunitiesLabel: 'Opportunities (External)',
    swotThreatsLabel: 'Threats (External)',
    riskFactorLabel: 'Risk Factor',
    likelihoodImpactLabel: 'Likelihood / Impact',
    mitigationStrategyLabel: 'Mitigation Strategy',
    monitoringIndicatorLabel: 'Monitoring Indicator',
    infrastructureAssessmentTitle: 'Infrastructure & Ground Reality Assessment',
    infrastructureFindingsTitle: 'Infrastructure Findings & Recommended Actions',
    businessImpactLabel: 'Operational Business Impact',
    recommendedActionsLabel: 'Recommended Actionable Steps',
    operationalPriorityLabel: 'Operational Priority',
    supportOrganizationsTitle: 'Empanelled Support Organizations & Local NGOs',
    learningVideosTitle: 'Curated Video & Training Resources',
    actionPlanTitle: 'Step-by-Step Business Implementation Action Plan',
    conclusionTitle: 'Conclusion & Strategic Advisory Summary',
    limitationsTitle: 'Methodology & Advisory Limitations',
  },

  hi: {
    // Brand & General
    appName: 'उड़ान',
    tagline: 'ऋण लेने से पहले प्रमाण',
    heroHeadline: 'ग्रामीण और अर्ध-शहरी उद्यमियों के लिए स्मार्ट व्यावसायिक व्यवहार्यता और मार्गदर्शन',
    heroSubheadline:
      'कोई भी ऋण लेने से पहले अपने व्यापारिक विचार की पुष्टि करें, स्थानीय मांग को समझें, उपलब्ध संसाधनों का मूल्यांकन करें और अपनी वित्तीय स्थिति को संतुलित करें।',
    startAssessment: 'व्यापार मूल्यांकन शुरू करें',
    login: 'लॉग इन करें',
    register: 'नया खाता बनाएं',
    logout: 'लॉग आउट',
    dashboard: 'डैशबोर्ड',
    newAssessment: 'नया मूल्यांकन शुरू करें',
    myAssessments: 'मेरे मूल्यांकन',
    viewPreviousAssessments: 'पिछले मूल्यांकन देखें',
    profile: 'प्रोफ़ाइल',
    help: 'सहायता एवं मार्गदर्शिका',
    faqs: 'अक्सर पूछे जाने वाले प्रश्न',
    save: 'सहेजें',
    saving: 'सहेजा जा रहा है...',
    saved: 'सफलतापूर्वक सहेज लिया गया',
    saveChanges: 'बदलाव सहेजें',
    cancel: 'रद्द करें',
    next: 'आगे बढ़ें',
    back: 'पीछे जाएं',
    submit: 'मूल्यांकन जमा करें',
    submitting: 'जमा किया जा रहा है...',
    complete: 'पूर्ण',
    delete: 'हटाएं',
    deleting: 'हटाया जा रहा है...',
    confirm: 'पुष्टि करें',
    yes: 'हाँ',
    no: 'नहीं',
    close: 'बंद करें',
    refresh: 'ताज़ा करें',
    loading: 'लोड हो रहा है...',
    error: 'त्रुटि',
    success: 'सफलता',
    required: 'आवश्यक',
    optional: 'वैकल्पिक',
    edit: 'संपादित करें',

    // Auth
    fullName: 'पूरा नाम',
    emailAddress: 'ईमेल पता',
    phoneNumber: 'फ़ोन नंबर',
    password: 'पासवर्ड',
    dontHaveAccount: 'खाता नहीं है? यहाँ पंजीकरण करें',
    alreadyHaveAccount: 'पहले से खाता है? लॉग इन करें',
    loginPrompt: 'अपने व्यावसायिक मूल्यांकन और रिपोर्ट देखने के लिए साइन इन करें।',
    registerPrompt: 'अपने क्षेत्र में व्यावसायिक व्यवहार्यता का आकलन करने के लिए मुफ़्त खाता बनाएं।',
    authError: 'प्रमाणीकरण विफल रहा। कृपया अपनी जानकारी जांचें।',
    enterValidEmail: 'कृपया एक मान्य ईमेल पता दर्ज करें।',
    enterValidPhone: 'कृपया 10 अंकों का मान्य फ़ोन नंबर दर्ज करें।',
    enterPassword: 'कृपया अपना पासवर्ड दर्ज करें।',
    enterFullName: 'कृपया अपना पूरा नाम दर्ज करें।',
    passwordMinLength: 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।',
    signingIn: 'लॉग इन हो रहा है...',
    creatingAccount: 'खाता बनाया जा रहा है...',
    accountAlreadyExistsError: 'इस ईमेल पते के साथ पहले से एक खाता मौजूद है। कृपया साइन इन करें।',
    signInInstead: 'साइन इन करें',
    forgotPassword: 'पासवर्ड भूल गए?',
    orDivider: 'या',
    continueWithGoogle: 'गूगल के साथ जारी रखें',
    signUpWithGoogle: 'गूगल के साथ साइन अप करें',
    googleAuthNotConfigured: 'इस सर्वर पर गूगल ऑथेंटिकेशन कॉन्फ़िगर नहीं है।',
    googleAuthFailed: 'गूगल प्रमाणीकरण विफल रहा। कृपया पुनः प्रयास करें या पासवर्ड से लॉगिन करें।',

    // Dashboard
    welcomeUser: 'स्वागत है',
    dashboardSubtitle: 'व्यवसाय की व्यवहार्यता जांचें, स्थानीय जमीनी मांग का आकलन करें और सोच-समझकर वित्त की योजना बनाएं।',
    quickActions: 'मुख्य विकल्प',
    startNewAssessmentCardTitle: 'नया मूल्यांकन शुरू करें',
    startNewAssessmentCardDesc: 'अपने प्रस्तावित व्यावसायिक विचार के लिए एक नया व्यवहार्यता मूल्यांकन प्रारंभ करें।',
    previousAssessmentsCardTitle: 'पिछले मूल्यांकन देखें',
    previousAssessmentsCardDesc: 'पहले बनाए गए व्यावसायिक व्यवहार्यता डोजियर की समीक्षा करें और जारी रखें।',
    profileCardTitle: 'प्रोफ़ाइल एवं सेटिंग्स',
    profileCardDesc: 'अपनी व्यक्तिगत जानकारी, भाषा प्राथमिकता और खाता सेटिंग्स देखें एवं अपडेट करें।',
    helpCardTitle: 'सहायता एवं मार्गदर्शन',
    helpCardDesc: 'जानें कि उड़ान कैसे काम करता है, क्या तैयारी करनी है, और महत्वपूर्ण सलाह पढ़ें।',
    advisoryGuideCardTitle: 'व्यवसाय सलाहकार मार्गदर्शिका',
    advisoryGuideCardDesc: 'समझें कि उड़ान ऋण लेने से पहले बाजार मांग, व्यवहार्यता और जोखिम कारकों का मूल्यांकन कैसे करता है।',
    learnMore: 'और जानें',
    googleAccountLinked: 'गूगल से जुड़ा हुआ है',
    setPassword: 'पासवर्ड सेट करें',
    setPasswordSubtitle: 'यदि आप ईमेल/फोन और पासवर्ड से लॉगिन करना चाहते हैं तो एक सुरक्षित पासवर्ड बनाएं।',
    noVillagesAvailable: 'इस ब्लॉक के लिए गांव/कस्बे का डेटा उपलब्ध नहीं है',
    savedAtBlockLevel: 'स्थान ब्लॉक/तालुका स्तर पर सहेजा गया है।',
    contributionExceedsFundsError: 'स्वयं का योगदान आपके घोषित उपलब्ध फंड से अधिक नहीं हो सकता',
    networkError: 'सर्वर से संपर्क नहीं हो सका। कृपया अपना इंटरनेट कनेक्शन जांचें और पुनः प्रयास करें।',
    goToLogin: 'लॉग इन पर जाएं',
    recentAssessments: 'हाल के मूल्यांकन',
    viewAllAssessments: 'सभी मूल्यांकन देखें',
    noAssessmentsYet: 'आपने अभी तक कोई व्यावसायिक मूल्यांकन शुरू नहीं किया है।',
    startFirstAssessment: 'ऋण लेने से पहले व्यवहार्यता जांचने के लिए अपना पहला मूल्यांकन शुरू करें।',
    continueAssessment: 'मूल्यांकन जारी रखें',
    viewAssessment: 'मूल्यांकन देखें',
    viewResults: 'परिणाम देखें',
    assessmentId: 'मूल्यांकन आईडी',
    createdOn: 'बनाया गया',
    lastUpdated: 'अंतिम अपडेट',
    status: 'स्थिति',
    language: 'भाषा',
    operatingLocation: 'संचालन स्थान',

    // Previous Assessments Page
    previousAssessmentsTitle: 'पिछले मूल्यांकन',
    previousAssessmentsSubtitle: 'आपके खाते के तहत बनाए गए सभी व्यावसायिक व्यवहार्यता मूल्यांकन।',
    filterAll: 'सभी मूल्यांकन',
    noPreviousAssessments: 'कोई पिछला मूल्यांकन नहीं मिला।',
    category: 'व्यवसाय श्रेणी',
    locationLabel: 'स्थान',
    dateCreated: 'बनाने की तारीख',
    statusLabel: 'वर्तमान स्थिति',
    actions: 'कार्रवाई',

    // Profile Page
    profileTitle: 'मेरी प्रोफ़ाइल',
    profileSubtitle: 'अपने व्यक्तिगत खाते का विवरण, व्यावसायिक प्रोफ़ाइल और एप्लिकेशन प्राथमिकताएं प्रबंधित करें।',
    profileOverview: 'प्रोफ़ाइल अवलोकन',
    accountDetails: 'खाता जानकारी',
    userRole: 'भूमिका',
    preferredLanguage: 'पसंदीदा सलाह भाषा',
    editProfile: 'प्रोफ़ाइल संपादित करें',
    saveProfileChanges: 'प्रोफ़ाइल परिवर्तन सहेजें',
    profileUpdatedSuccess: 'प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई।',
    profileUpdateFailed: 'प्रोफ़ाइल अपडेट करने में विफल। कृपया पुनः प्रयास करें।',
    businessProfile: 'व्यावसायिक प्रोफ़ाइल (वैकल्पिक)',
    businessProfileSubtitle: 'आपके उद्यम और व्यावसायिक अनुभव के बारे में वैकल्पिक विवरण।',
    businessName: 'पसंदीदा व्यवसाय का नाम',
    businessNamePlaceholder: 'उदा. पटेल डेयरी एंड एग्रो प्रोडक्ट्स',
    primarySector: 'प्राथमिक व्यावसायिक क्षेत्र / श्रेणी',
    operatingState: 'संचालन राज्य',
    operatingDistrict: 'संचालन जिला',
    experienceLevel: 'उद्यमी अनुभव स्तर',
    expBeginner: 'शुरुआती (व्यवसाय में नए)',
    expSome: 'कुछ अनुभव (1-3 वर्ष)',
    expExperienced: 'अनुभवी (व्यवसाय में 3+ वर्ष)',
    businessBackground: 'संक्षिप्त व्यावसायिक / उद्यम पृष्ठभूमि',
    businessBackgroundPlaceholder: 'अपनी व्यावसायिक पृष्ठभूमि, आकांक्षाओं या पिछले अनुभव का संक्षेप में वर्णन करें...',
    accountActivity: 'खाता गतिविधि',
    totalAssessments: 'कुल मूल्यांकन',
    inProgressAssessments: 'प्रगति पर',
    completedAssessments: 'पूर्ण मूल्यांकन',
    memberSince: 'सदस्य बने',
    changePassword: 'पासवर्ड बदलें',
    changePasswordSubtitle: 'यदि आप पासवर्ड नहीं बदलना चाहते तो इसे खाली छोड़ दें।',
    currentPassword: 'वर्तमान पासवर्ड',
    newPassword: 'नया पासवर्ड',
    newPasswordPlaceholder: 'कम से कम 6 अक्षर',
    passwordMismatch: 'वर्तमान पासवर्ड मेल नहीं खाता।',
    passwordChangedSuccess: 'पासवर्ड सफलतापूर्वक बदल दिया गया है।',
    dangerZone: 'संवेदनशील क्षेत्र',
    deleteAccountTitle: 'खाता हटाएं',
    deleteAccountWarning:
      'अपना खाता हटाने से आपकी सभी प्रोफ़ाइल जानकारी और सहेजे गए मूल्यांकन स्थायी रूप से हटा दिए जाएंगे। इस क्रिया को पूर्ववत नहीं किया जा सकता है।',
    deleteAccountBtn: 'मेरा खाता हटाएं',
    confirmDeleteTitle: 'खाता हटाने की पुष्टि करें',
    confirmDeletePrompt: 'क्या आप वाकई अपना खाता और सभी मूल्यांकन रिकॉर्ड स्थायी रूप से हटाना चाहते हैं?',
    confirmDeleteConfirmBtn: 'हाँ, मेरा खाता हटाएं',
    accountDeletedSuccess: 'आपका खाता सफलतापूर्वक हटा दिया गया है।',
    accountDeleteFailed: 'खाता हटाने में विफल। कृपया पुनः प्रयास करें।',

    // Help Page
    helpTitle: 'सहायता एवं सलाहकार मार्गदर्शिका',
    helpSubtitle: 'ग्रामीण और अर्ध-शहरी उद्यमियों के लिए उड़ान का उपयोग करने के लिए संपूर्ण मार्गदर्शन।',
    aboutUdaanTitle: 'उड़ान क्या है?',
    aboutUdaanDesc:
      'उड़ान (“ऋण लेने से पहले प्रमाण”) ग्रामीण और अर्ध-शहरी उद्यमियों के लिए बनाया गया एक एआई-सहायता प्राप्त व्यावसायिक व्यवहार्यता और परामर्श मंच है। यह लोगों को व्यावसायिक या माइक्रोफाइनेंस ऋण लेने से पहले यह जांचने में मदद करता है कि उनके व्यापार विचार में पर्याप्त स्थानीय मांग और लाभप्रदता है या नहीं।',
    whyUdaanTitle: 'उड़ान क्यों बनाया गया और यह किसकी मदद करता है?',
    whyUdaanDesc:
      'कई ग्रामीण उद्यमी स्थानीय मांग, प्रतिस्पर्धियों या आवश्यक कार्यशील पूंजी का आकलन किए बिना उच्च ब्याज पर ऋण ले लेते हैं, जिससे वे कर्ज के जाल में फंस जाते हैं। उड़ान किसानों, ग्रामीण युवाओं, महिला स्वयं सहायता समूहों (SHGs) और छोटे दुकानदारों को ऋण लेने से पहले व्यवहार्यता परखने में सक्षम बनाता है।',
    howItWorksTitle: 'उड़ान कैसे काम करता है — चरण-दर-चरण प्रक्रिया',
    step1Title: '1. बुनियादी स्थान और श्रेणी चयन',
    step1Desc: 'अपना राज्य, जिला, तालुका/ब्लॉक और गांव चुनें, फिर अपने व्यवसाय की श्रेणी चुनें या दर्ज करें।',
    step2Title: '2. व्यावसायिक विचार और संसाधन',
    step2Desc: 'अपने प्रस्तावित व्यवसाय का विवरण दें और अपने पास पहले से मौजूद संसाधनों (जमीन, दुकान, मशीनरी, बचत) का चयन करें।',
    step3Title: '3. स्वयं का वित्तीय योगदान',
    step3Desc: 'यह बताएं कि आप अपनी बचत से कितना पैसा लगा सकते हैं ताकि ऋण आवश्यकता को समझा जा सके।',
    step4Title: '4. समीक्षा और व्यवहार्यता रिपोर्ट',
    step4Desc: 'सभी दर्ज जानकारी की समीक्षा करें, स्थानीय जमीनी स्थिति का विश्लेषण करें और मूल्यांकन रिपोर्ट प्राप्त करें।',
    financialGuidanceTitle: 'परियोजना लागत, स्वयं का योगदान और ऋण को समझना',
    ownContributionVsLoanTitle: 'महत्वपूर्ण नियम: अपनी बचत बनाम उधार की रकम',
    ownContributionVsLoanDesc:
      'आपका स्वयं का योगदान वह राशि है जिसे आप बिना किसी से उधार लिए अपने व्यवसाय में लगा सकते हैं। कुल परियोजना लागत व्यवसाय शुरू करने का पूरा खर्च है। संभावित ऋण राशि इन दोनों के बीच का अंतर है। उड़ान आपको यह समझने में मदद करता है कि क्या आपका व्यवसाय उस ऋण को सुरक्षित रूप से चुका सकता है।',
    loanWarningTitle: 'मंच की आधिकारिक सलाह सूचना',
    loanWarningDesc:
      'उड़ान केवल एक परामर्शीय और व्यवहार्यता मूल्यांकन मंच है। उड़ान ऋण स्वीकृति, बैंक मंजूरी, सरकारी सब्सिडी या निश्चित लाभ की गारंटी नहीं देता है। सभी आंकड़े सूचित निर्णय लेने में मदद करने के लिए अनुमानित हैं।',
    whatToPrepareTitle: 'मूल्यांकन शुरू करने से पहले क्या तैयार रखें',
    prepItem1: 'अपने प्रस्तावित उत्पाद या सेवा का स्पष्ट विवरण।',
    prepItem2: 'सटीक गांव/कस्बा और ब्लॉक जहां व्यवसाय संचालित होगा।',
    prepItem3: 'आपके पास पहले से मौजूद भौतिक संपत्तियों की सूची (जमीन, दुकान, मशीनरी, उपकरण)।',
    prepItem4: 'शुरुआती निवेश के लिए उपलब्ध अपनी निजी बचत की राशि।',
    faqsTitle: 'अक्सर पूछे जाने वाले प्रश्न (FAQs)',
    faq1Q: 'क्या उड़ान एक बैंक या ऋण देने वाली संस्था है?',
    faq1A: 'नहीं। उड़ान एक सलाहकार और व्यवहार्यता उपकरण है जो आपको बैंकों में आवेदन करने से पहले यह जांचने में मदद करता है कि ऋण लेना आर्थिक रूप से सही है या नहीं।',
    faq2Q: 'अगर मेरा गांव या तालुका सूची में नहीं मिलता तो क्या करें?',
    faq2A: 'आप आसानी से “अपना स्थान नहीं मिल रहा? मैन्युअल रूप से दर्ज करें” पर क्लिक करके सीधे अपने गांव, ब्लॉक, जिले या राज्य का नाम लिख सकते हैं।',
    faq3Q: 'यदि मेरा व्यावसायिक विचार किसी सूचीबद्ध श्रेणी से मेल नहीं खाता?',
    faq3A: 'श्रेणी सूची के अंत में “अन्य” विकल्प चुनें और दिए गए बॉक्स में अपने व्यवसाय का विवरण लिखें।',
    faq4Q: 'क्या मैं बाद में अपनी पसंदीदा भाषा बदल सकता हूँ?',
    faq4A: 'हाँ! आप शीर्ष नेविगेशन बार में दिए गए भाषा बटनों का उपयोग करके कभी भी अंग्रेजी, हिंदी और गुजराती के बीच स्विच कर सकते हैं।',
    faq5Q: 'क्या मूल्यांकन जमा करने से मुझ पर ऋण लेने की कोई बाध्यता होगी?',
    faq5A: 'बिल्कुल नहीं। आप विभिन्न विचारों के लिए जितने चाहें उतने मूल्यांकन बना सकते हैं और अपने डैशबोर्ड से कभी भी उनकी समीक्षा कर सकते हैं।',

    // Location & Category Setup
    location: 'कार्यक्षेत्र का स्थान',
    businessCategory: 'व्यवसाय की श्रेणी',
    state: 'राज्य',
    district: 'जिला',
    block: 'ब्लॉक / तालुका',
    village: 'गाँव / कस्बा',
    selectState: 'राज्य चुनें',
    selectDistrict: 'जिला चुनें',
    selectBlock: 'ब्लॉक / तालुका चुनें',
    selectVillage: 'गाँव / कस्बा चुनें',
    selectCategory: 'व्यवसाय श्रेणी चुनें',
    otherCategory: 'अन्य / कस्टम व्यवसाय',
    customCategoryLabel: 'कृपया अपनी व्यवसाय श्रेणी निर्दिष्ट करें',
    customCategoryPlaceholder: 'उदा. बांस के हस्तशिल्प, पोल्ट्री ब्रायलर फार्म...',
    customCategoryRequired: 'कृपया अपनी कस्टम व्यवसाय श्रेणी दर्ज करें।',
    cantFindLocation: 'अपना स्थान नहीं मिल रहा? मैन्युअल रूप से दर्ज करें।',
    enterLocationManually: 'स्थान मैन्युअल रूप से दर्ज करें',
    useLocationDropdowns: 'स्थान सूची पर वापस जाएं',
    manualStatePlaceholder: 'राज्य का नाम दर्ज करें',
    manualDistrictPlaceholder: 'जिले का नाम दर्ज करें',
    manualBlockPlaceholder: 'ब्लॉक / तालुका का नाम दर्ज करें',
    manualVillagePlaceholder: 'गाँव / कस्बे का नाम दर्ज करें',
    selectedLocationText: 'चयनित स्थान:',

    // Assessment Steps & Inputs
    assessmentWorkflowTitle: 'व्यावसायिक व्यवहार्यता मूल्यांकन',
    stepBasic: '1. सेटअप',
    stepIdeaResources: '2. विचार एवं संसाधन',
    stepFinance: '3. वित्तीय योगदान',
    stepReview: '4. समीक्षा एवं सबमिट',
    basicDetailsTitle: '1. बुनियादी मूल्यांकन सेटअप',
    basicDetailsSubtitle: 'निर्दिष्ट करें कि आपका व्यवसाय कहाँ चलेगा और आप किस प्रकार का व्यवसाय शुरू करना चाहते हैं।',
    businessIdeaTitle: 'आपका व्यावसायिक विचार क्या है?',
    businessIdeaSubtitle: 'उस विशिष्ट व्यावसायिक गतिविधि, उत्पाद या सेवा का वर्णन करें जो आप अपने क्षेत्र में शुरू करना चाहते हैं।',
    businessIdeaPlaceholder: 'उदा. 3 देसी गायों के साथ एक छोटा डेयरी व्यवसाय शुरू करना ताकि स्थानीय सहकारी समिति और आसपास के परिवारों को ताजा दूध दिया जा सके...',
    businessIdeaExamples: 'उदाहरण: सिलाई की दुकान खोलना, आटा चक्की लगाना, खाद्य प्रसंस्करण इकाई लगाना, मोबाइल मरम्मत की दुकान।',
    businessIdeaRequired: 'कृपया अपने व्यावसायिक विचार का विवरण दर्ज करें।',
    availableResourcesTitle: 'इस व्यवसाय के लिए आपके पास पहले से कौन-से संसाधन या पूंजी उपलब्ध हैं?',
    availableResourcesSubtitle: 'उन सभी संपत्तियों, परिसरों या उपकरणों का चयन करें जो आपके पास वर्तमान में उपलब्ध हैं।',
    resourceLand: 'जमीन / भूमि',
    resourceShop: 'मौजूदा दुकान या भवन',
    resourceMachinery: 'मशीनरी या प्रसंस्करण उपकरण',
    resourceTools: 'औजार या फर्नीचर',
    resourceInfrastructure: 'मौजूदा बुनियादी ढांचा (बिजली, पानी, शेड)',
    resourceSavings: 'नकद बचत / उपलब्ध वित्तीय राशि',
    resourceOther: 'अन्य संसाधन (नीचे लिखें)',
    resourceNone: 'इनमें से कोई नहीं (बिना किसी मौजूदा संपत्ति के शुरुआत)',
    otherResourcePlaceholder: 'कृपया अन्य उपलब्ध संपत्तियों या संसाधनों का वर्णन करें...',
    availableFundsTitle: 'उपलब्ध नकद बचत / वित्तीय राशि (₹)',
    availableFundsSubtitle: 'व्यवसाय में निवेश करने के लिए वर्तमान में उपलब्ध अनुमानित नकद या बैंक शेष।',
    availableFundsPlaceholder: 'उदा. 25000',
    ownContributionTitle: 'इस व्यवसाय के लिए आप अपने निजी कोष से कितना पैसा लगा सकते हैं?',
    ownContributionSubtitle: 'यह आपके अपने निजी फंड की वह राशि है जिसे आप प्रस्तावित व्यवसाय में निवेश करने के इच्छुक और सक्षम हैं। यह आपकी उपलब्ध कुल बचत से कम हो सकती है और ऋण राशि से अलग है।',
    ownContributionPlaceholder: 'उदा. 100000',
    ownContributionNote: 'यह व्यवसाय स्थापित करने के लिए आपका अपना वित्तीय योगदान है, कुल परियोजना लागत या ऋण राशि नहीं। यदि आपके पास कोई राशि नहीं है तो 0 दर्ज करें।',
    ownContributionRequired: 'कृपया अपने स्वयं के योगदान की राशि दर्ज करें (यदि कुछ नहीं है तो 0 लिखें)।',
    negativeContributionError: 'स्व-योगदान राशि ऋणात्मक (नकारात्मक) नहीं हो सकती।',
    invalidAmountError: 'कृपया एक मान्य, गैर-ऋणात्मक धनराशि दर्ज करें।',
    projectCostTitle: 'कुल प्रस्तावित व्यावसायिक परियोजना लागत (₹)',
    projectCostSubtitle: 'मशीनरी, उपकरण, स्टॉक, परिसर और कार्यशील पूंजी सहित अनुमानित कुल स्थापना व्यय।',
    projectCostPlaceholder: 'उदा. 140000',
    projectCostRequired: 'कृपया कुल प्रस्तावित परियोजना लागत दर्ज करें।',
    negativeProjectCostError: 'कुल परियोजना लागत ऋणात्मक नहीं हो सकती।',
    applicableScheme: 'लागू वित्तपोषण योजना',
    requiredContributionLabel: 'आवश्यक स्व-योगदान (मार्जिन)',
    statedContributionLabel: 'आपका घोषित योगदान',
    contributionShortfallLabel: 'योगदान में कमी (शॉर्टफॉल)',
    noShortfallNotice: 'आपके उपलब्ध योगदान से पूरी मार्जिन आवश्यकता पूरी होती है।',
    shortfallWarningNotice: 'योजना ऋण आवश्यकताओं को पूरा करने के लिए अतिरिक्त मार्जिन की आवश्यकता है।',
    quarterlyInstallmentLabel: 'अनुमानित त्रैमासिक किस्त',
    tenureAndMoratoriumLabel: 'अवधि और ऋण स्थगन (मोराटोरियम)',
    totalInterestLabel: 'कुल अनुमानित ब्याज',
    totalRepaymentLabel: 'कुल अनुमानित पुनर्भुगतान',
    notEligibleProjectCostError: 'परियोजना लागत सरकारी ऋण योजनाओं की ₹50,00,000 की अधिकतम सीमा से अधिक है।',
    recalculatingFinance: 'योजना और वित्तीय अनुसूची की गणना हो रही है...',
    preliminaryFinanceTitle: 'प्रारंभिक वित्तीय अनुमान (10% न्यूनतम स्व-योगदान धारणा)',
    minAssumedContributionPercent: 'न्यूनतम अनुमानित स्व-योगदान',
    maxTheoreticalProjectCost: 'अधिकतम सैद्धांतिक परियोजना लागत',
    maxTheoreticalLoanAmount: 'अधिकतम सैद्धांतिक ऋण राशि (90% वित्तपोषण)',
    preliminaryFinanceDisclaimer: 'ये मानक 10% न्यूनतम स्व-योगदान (मार्जिन मनी) धारणा पर आधारित प्रारंभिक सैद्धांतिक अनुमान हैं। वास्तविक ऋण पात्रता, ब्याज दरें, मार्जिन आवश्यकताएं और ऋण वितरण संबंधित ऋण योजना, पात्र परियोजना खर्चों, बैंक मूल्यांकन और सांविधिक क्रेडिट सीमाओं पर निर्भर करते हैं। यह ऋण स्वीकृति या गारंटी नहीं है।',
    zeroContributionNotice: 'जब स्व-योगदान ₹0 होता है, तो 10% न्यूनतम योगदान धारणा के तहत सैद्धांतिक परियोजना लागत या ऋण राशि की गणना नहीं की जा सकती। सकारात्मक स्व-योगदान आवश्यक है।',
    reviewTitle: 'समीक्षा करें और मूल्यांकन जमा करें',
    reviewSubtitle: 'अपना व्यावसायिक मूल्यांकन जमा करने से पहले अपने द्वारा दर्ज किए गए विवरणों की जांच करें।',
    summaryIdentity: 'उद्यम और स्थान विवरण',
    summaryIdea: 'व्यावसायिक विचार',
    summaryResources: 'उपलब्ध संसाधन और संपत्तियां',
    summaryFinance: 'वित्तीय योगदान',
    submitAssessmentBtn: 'व्यवहार्यता मूल्यांकन जमा करें',
    submittingAssessment: 'मूल्यांकन जमा हो रहा है...',
    assessmentSubmittedSuccess: 'मूल्यांकन सफलतापूर्वक जमा कर दिया गया है!',
    assessmentDraftSaved: 'मूल्यांकन अद्यतन और सुरक्षित कर लिया गया है।',
    returnToDashboard: 'डैशबोर्ड पर वापस जाएं',
    backToAssessments: 'मूल्यांकन सूची पर वापस जाएं',

    // Status Labels
    statusDraft: 'प्रारूप (ड्राफ्ट)',
    statusInProgress: 'प्रगति पर है',
    statusCompleted: 'पूर्ण हुआ',
    statusSkipped: 'छोड़ा गया',
    statusPending: 'लंबित',
    statusAiAnalyzing: 'विश्लेषण जारी है',
    statusReportReady: 'रिपोर्ट तैयार है',
    notesPlaceholder: 'सत्यापन संबंधी टिप्पणियां या विवरण दर्ज करें...',

    // Report & Feasibility Keys (Hindi)
    reportHeaderTitle: 'व्यापार व्यवहार्यता एवं सलाहकार आसूचना रिपोर्ट',
    reportHeaderSubtitle: 'व्यापक व्यवहार्यता मूल्यांकन, वित्तीय अनुमान एवं धरातलीय वास्तविकता रिपोर्ट',
    downloadPdfBtn: 'पीडीएफ रिपोर्ट डाउनलोड करें',
    downloadingPdfBtn: 'पीडीएफ तैयार हो रही है...',
    pdfSuccessNotice: 'पीडीएफ रिपोर्ट सफलतापूर्वक डाउनलोड हो गई! मूल्यांकन स्थिति पूर्ण (COMPLETED) दर्ज कर ली गई है।',
    section1Nav: '1. कार्यकारी सारांश',
    section2Nav: '2. बाजार विश्लेषण',
    section3Nav: '3. प्रतिस्पर्धा',
    section4Nav: '4. मूल्य निर्धारण',
    section5Nav: '5. वित्तीय व्यवहार्यता',
    section6Nav: '6. स्वाट (SWOT)',
    section7Nav: '7. जोखिम एवं निवारण',
    section8Nav: '8. बुनियादी ढांचा',
    section9Nav: '9. सहायक संस्थाएं',
    section10Nav: '10. प्रशिक्षण संसाधन',
    section11Nav: '11. कार्ययोजना',
    section12Nav: '12. निष्कर्ष',
    targetCustomerSegmentsLabel: 'लक्षित ग्राहक वर्ग',
    financialViabilitySnapshotLabel: 'वित्तीय व्यवहार्यता अवलोकन',
    keyStrengthsLabel: 'प्रमुख व्यावसायिक मजबूती',
    criticalWatchpointsLabel: 'महत्वपूर्ण चेतावनी बिंदु',
    demandDriversLabel: 'स्थानीय मांग के मुख्य कारक',
    competitorProfilesTable: 'स्थानीय प्रतिस्पर्धी प्रोफाइल',
    differentiationStrategyLabel: 'प्रतिस्पर्धी विभेदीकरण रणनीति',
    inventoryMixTable: 'उत्पाद श्रेणी एवं लक्षित मार्जिन मिश्रण',
    turnoverVelocityLabel: 'बिक्री गति (टर्नओवर)',
    grossMarginRangeLabel: 'लक्षित सकल मार्जिन दायरा',
    workingCapitalDisciplineLabel: 'कार्यशील पूंजी एवं उधार अनुशासन',
    financialFeasibilityTitle: 'वित्तीय व्यवहार्यता एवं ऋण योजना संरचना',
    totalOutlayLabel: 'कुल परियोजना लागत',
    ownEquityLabel: 'स्वयं का पूंजी योगदान',
    bankLoanLabel: 'आवश्यक बैंक ऋण',
    monthlyEmiLabel: 'अनुमानित मासिक किस्त (EMI)',
    minOwnContributionBadge: 'न्यूनतम 10% स्वयं का योगदान नियम',
    marginShortfallAlert: 'स्वयं की पूंजी में कमी: सरकारी दिशानिर्देशों के तहत न्यूनतम 10% आवेदक मार्जिन अनिवार्य है।',
    marginCompliantBadge: 'न्यूनतम 10% स्वयं योगदान की शर्त पूरी होती है',
    schemeDetailsTitle: 'सरकारी क्रेडिट योजना मानदंड',
    interestRateLabel: 'वार्षिक ब्याज दर',
    tenureMoratoriumLabel: 'ऋण अवधि एवं मोरेटोरियम',
    dscrStatusLabel: 'डीएससीआर (DSCR) ऋण सेवा स्थिति',
    amortizationScheduleTitle: 'विस्तृत ऋण अदायगी एवं परिशोधन अनुसूची',
    showScheduleBtn: 'संपूर्ण परिशोधन अनुसूची देखें',
    hideScheduleBtn: 'परिशोधन अनुसूची छुपाएं',
    periodLabel: 'किस्त सं.',
    openingPrincipalLabel: 'प्रारंभिक शेष',
    principalPaymentLabel: 'मूलधन',
    interestPaymentLabel: 'ब्याज',
    installmentAmountLabel: 'कुल किस्त',
    closingPrincipalLabel: 'अंतिम शेष',
    disclaimerLabel: 'वित्तीय सलाहकार अस्वीकरण',
    swotStrengthsLabel: 'ताकत (आंतरिक मजबूती)',
    swotWeaknessesLabel: 'कमजोरियां (आंतरिक सुधार क्षेत्र)',
    swotOpportunitiesLabel: 'अवसर (बाहरी संभावनाएं)',
    swotThreatsLabel: 'चुनौतियां (बाहरी जोखिम)',
    riskFactorLabel: 'जोखिम कारक',
    likelihoodImpactLabel: 'संभावना / प्रभाव',
    mitigationStrategyLabel: 'निवारण रणनीति',
    monitoringIndicatorLabel: 'निगरानी संकेतक',
    infrastructureAssessmentTitle: 'बुनियादी ढांचा एवं जमीनी हकीकत मूल्यांकन',
    infrastructureFindingsTitle: 'बुनियादी ढांचा निष्कर्ष एवं अनुशंसित कार्ययोजना',
    businessImpactLabel: 'व्यावसायिक संचालन प्रभाव',
    recommendedActionsLabel: 'अनुशंसित व्यावहारिक कदम',
    operationalPriorityLabel: 'प्राथमिकता',
    supportOrganizationsTitle: 'सूचीबद्ध सहायता संगठन एवं स्थानीय एनजीओ',
    learningVideosTitle: 'चयनित वीडियो एवं व्यावहारिक प्रशिक्षण संसाधन',
    actionPlanTitle: 'चरणबद्ध व्यापार क्रियान्वयन कार्ययोजना (Action Plan)',
    conclusionTitle: 'निष्कर्ष एवं रणनीतिक सलाहकार सारांश',
    limitationsTitle: 'पद्धति एवं सलाहकार सीमाएं',
  },

  gu: {
    // Brand & General
    appName: 'ઉડાન',
    tagline: 'લોન લેતા પહેલા પુરાવો',
    heroHeadline: 'ગ્રામીણ અને અર્ધ-શહેરી ઉદ્યોગસાહસિકો માટે સ્માર્ટ વ્યાપાર શક્યતા અને માર્ગદર્શન',
    heroSubheadline:
      'કોઈપણ લોન લેતા પહેલા તમારા બિઝનેસ આઈડિયાની ચકાસણી કરો, સ્થાનિક માંગને સમજો, ઉપલબ્ધ સાધનોનું મૂલ્યાંકન કરો અને તમારા નાણાકીય આયોજનને મજબૂત બનાવો.',
    startAssessment: 'બિઝનેસ મૂલ્યાંકન શરૂ કરો',
    login: 'લૉગ ઇન કરો',
    register: 'નવું એકાઉન્ટ બનાવો',
    logout: 'લૉગ આઉટ',
    dashboard: 'ડેશબોર્ડ',
    newAssessment: 'નવું મૂલ્યાંકન શરૂ કરો',
    myAssessments: 'મારા મૂલ્યાંકનો',
    viewPreviousAssessments: 'અગાઉના મૂલ્યાંકનો જુઓ',
    profile: 'પ્રોફાઇલ',
    help: 'મદદ અને માર્ગદર્શિકા',
    faqs: 'વારંવાર પૂછાતા પ્રશ્નો',
    save: 'સાચવો',
    saving: 'સાચવી રહ્યું છે...',
    saved: 'સફળતાપૂર્વક સાચવવામાં આવ્યું',
    saveChanges: 'ફેરફારો સાચવો',
    cancel: 'રદ કરો',
    next: 'આગળ વધો',
    back: 'પાછા જાઓ',
    submit: 'મૂલ્યાંકન સબમિટ કરો',
    submitting: 'સબમિટ થઈ રહ્યું છે...',
    complete: 'પૂર્ણ',
    delete: 'કાઢી નાખો',
    deleting: 'કાઢી રહ્યું છે...',
    confirm: 'ખાતરી કરો',
    yes: 'હા',
    no: 'ના',
    close: 'બંધ કરો',
    refresh: 'તાજું કરો',
    loading: 'લોડ થઈ રહ્યું છે...',
    error: 'ભૂલ',
    success: 'સફળતા',
    required: 'જરૂરી',
    optional: 'વૈકલ્પિક',
    edit: 'સંપાદિત કરો',

    // Auth
    fullName: 'પૂરું નામ',
    emailAddress: 'ઈમેલ સરનામું',
    phoneNumber: 'ફોન નંબર',
    password: 'પાસવર્ડ',
    dontHaveAccount: 'એકાઉન્ટ નથી? અહીં નોંધણી કરો',
    alreadyHaveAccount: 'પહેલેથી એકાઉન્ટ છે? લૉગ ઇન કરો',
    loginPrompt: 'તમારા બિઝનેસ મૂલ્યાંકનો અને રિપોર્ટ્સ જોવા માટે સાઇન ઇન કરો.',
    registerPrompt: 'તમારા વિસ્તારમાં બિઝનેસ શક્યતા તપાસવા માટે મફત એકાઉન્ટ બનાવો.',
    authError: 'પ્રમાણીકરણ નિષ્ફળ થયું. કૃપા કરીને તમારી માહિતી તપાસો.',
    enterValidEmail: 'કૃપા કરીને માન્ય ઈમેલ સરનામું દાખલ કરો.',
    enterValidPhone: 'કૃપા કરીને 10 અંકનો માન્ય ફોન નંબર દાખલ કરો.',
    enterPassword: 'કૃપા કરીને તમારો પાસવર્ડ દાખલ કરો.',
    enterFullName: 'કૃપા કરીને તમારું પૂરું નામ દાખલ કરો.',
    passwordMinLength: 'પાસવર્ડ ઓછામાં ઓછા 6 અક્ષરોનો હોવો જોઈએ.',
    signingIn: 'સાઇન ઇન થઈ રહ્યું છે...',
    creatingAccount: 'એકાઉન્ટ બની રહ્યું છે...',
    accountAlreadyExistsError: 'આ ઈમેલ એડ્રેસ સાથે પહેલેથી જ એક એકાઉન્ટ છે. કૃપા કરીને સાઇન ઇન કરો.',
    signInInstead: 'સાઇન ઇન કરો',
    forgotPassword: 'પાસવર્ડ ભૂલી ગયા છો?',
    orDivider: 'અથવા',
    continueWithGoogle: 'Google સાથે આગળ વધો',
    signUpWithGoogle: 'Google સાથે સાઇન અપ કરો',
    googleAuthNotConfigured: 'આ સર્વર પર Google OAuth ગોઠવેલું નથી.',
    googleAuthFailed: 'Google પ્રમાણીકરણ નિષ્ફળ ગયું. કૃપા કરીને ફરી પ્રયાસ કરો અથવા પાસવર્ડથી લૉગિન કરો.',

    // Dashboard
    welcomeUser: 'સ્વાગત છે',
    dashboardSubtitle: 'બિઝનેસની વ્યવહારિકતા તપાસો, સ્થાનિક માંગનું મૂલ્યાંકન કરો અને નાણાકીય આયોજન સમજી-વિચારીને કરો.',
    quickActions: 'મુખ્ય વિકલ્પો',
    startNewAssessmentCardTitle: 'નવું મૂલ્યાંકન શરૂ કરો',
    startNewAssessmentCardDesc: 'તમારા પ્રસ્તાવિત બિઝનેસ આઈડિયા માટે નવું શક્યતા મૂલ્યાંકન શરૂ કરો.',
    previousAssessmentsCardTitle: 'અગાઉના મૂલ્યાંકનો જુઓ',
    previousAssessmentsCardDesc: 'પહેલા બનાવેલા બિઝનેસ મૂલ્યાંકન ડોઝિયરની સમીક્ષા કરો અને ચાલુ રાખો.',
    profileCardTitle: 'પ્રોફાઇલ અને સેટિંગ્સ',
    profileCardDesc: 'તમારી વ્યક્તિગત વિગતો, ભાષા પસંદગી અને એકાઉન્ટ સેટિંગ્સ જુઓ અને અપડેટ કરો.',
    helpCardTitle: 'મદદ અને માર્ગદર્શન',
    helpCardDesc: 'ઉડાન કેવી રીતે કામ કરે છે, શું તૈયારી રાખવી, અને મહત્વપૂર્ણ સલાહ વાંચો.',
    advisoryGuideCardTitle: 'બિઝનેસ સલાહકાર માર્ગદર્શિકા',
    advisoryGuideCardDesc: 'સમજો કે ઉડાન લોન લેતા પહેલા બજાર માંગ, વ્યવહારિકતા અને જોખમી પરિબળોનું મૂલ્યાંકન કેવી રીતે કરે છે.',
    learnMore: 'વધુ જાણો',
    googleAccountLinked: 'Google સાથે લિંક કરેલ છે',
    setPassword: 'પાસવર્ડ સેટ કરો',
    setPasswordSubtitle: 'જો તમે ઈમેલ/ફોન અને પાસવર્ડથી લૉગિન કરવા માંગતા હોવ તો એક સુરક્ષિત પાસવર્ડ બનાવો.',
    noVillagesAvailable: 'આ બ્લોક માટે ગામ/શહેરનો ડેટા ઉપલબ્ધ નથી',
    savedAtBlockLevel: 'સ્થાન બ્લોક/તાલુકા સ્તરે સાચવવામાં આવ્યું છે.',
    contributionExceedsFundsError: 'તમારું પોતાનું યોગદાન તમારા જાહેર કરેલા ઉપલબ્ધ ભંડોળ કરતાં વધુ ન હોઈ શકે',
    networkError: 'સર્વર સાથે સંપર્ક થઈ શક્યો નથી. કૃપા કરીને તમારું ઇન્ટરનેટ કનેક્શન તપાસો અને ફરી પ્રયાસ કરો.',
    goToLogin: 'લૉગ ઇન પર જાઓ',
    recentAssessments: 'તાજેતરના મૂલ્યાંકનો',
    viewAllAssessments: 'બધા મૂલ્યાંકનો જુઓ',
    noAssessmentsYet: 'તમે હજી સુધી કોઈ બિઝનેસ મૂલ્યાંકન શરૂ કર્યું નથી.',
    startFirstAssessment: 'લોન લેતા પહેલા વ્યવહારિકતા તપાસવા માટે તમારું પ્રથમ મૂલ્યાંકન શરૂ કરો.',
    continueAssessment: 'મૂલ્યાંકન ચાલુ રાખો',
    viewAssessment: 'મૂલ્યાંકન જુઓ',
    viewResults: 'પરિણામો જુઓ',
    assessmentId: 'મૂલ્યાંકન આઈડી',
    createdOn: 'બનાવ્યા તારીખ',
    lastUpdated: 'છેલ્લે અપડેટ',
    status: 'સ્થિતિ',
    language: 'ભાષા',
    operatingLocation: 'કાર્યરત સ્થળ',

    // Previous Assessments Page
    previousAssessmentsTitle: 'અગાઉના મૂલ્યાંકનો',
    previousAssessmentsSubtitle: 'તમારા એકાઉન્ટ હેઠળ બનાવેલા તમામ બિઝનેસ શક્યતા મૂલ્યાંકનો.',
    filterAll: 'બધા મૂલ્યાંકનો',
    noPreviousAssessments: 'કોઈ અગાઉના મૂલ્યાંકન મળ્યા નથી.',
    category: 'વ્યવસાય શ્રેણી',
    locationLabel: 'સ્થળ',
    dateCreated: 'બનાવ્યા તારીખ',
    statusLabel: 'વર્તમાન સ્થિતિ',
    actions: 'ક્રિયાઓ',

    // Profile Page
    profileTitle: 'મારી પ્રોફાઇલ',
    profileSubtitle: 'તમારા વ્યક્તિગત એકાઉન્ટની વિગતો, બિઝનેસ પ્રોફાઇલ અને પસંદગીઓનું સંચાલન કરો.',
    profileOverview: 'પ્રોફાઇલ વિહંગાવલોકન',
    accountDetails: 'એકાઉન્ટ માહિતી',
    userRole: 'ભૂમિકા',
    preferredLanguage: 'પસંદગીની સલાહ ભાષા',
    editProfile: 'પ્રોફાઇલ સંપાદિત કરો',
    saveProfileChanges: 'ફેરફારો સાચવો',
    profileUpdatedSuccess: 'પ્રોફાઇલ સફળતાપૂર્વક અપડેટ થઈ.',
    profileUpdateFailed: 'પ્રોફાઇલ અપડેટ કરવામાં નિષ્ફળ. કૃપા કરીને ફરી પ્રયાસ કરો.',
    businessProfile: 'બિઝનેસ પ્રોફાઇલ (વૈકલ્પિક)',
    businessProfileSubtitle: 'તમારા સાહસ અને વ્યવસાયિક અનુભવ વિશે વૈકલ્પિક વિગતો.',
    businessName: 'પસંદગીનું વ્યવસાય નામ',
    businessNamePlaceholder: 'દા.ત. પટેલ ડેરી એન્ડ એગ્રો પ્રોડક્ટ્સ',
    primarySector: 'પ્રાથમિક વ્યવસાય ક્ષેત્ર / કેટેગરી',
    operatingState: 'કાર્યરત રાજ્ય',
    operatingDistrict: 'કાર્યરત જિલ્લો',
    experienceLevel: 'ઉદ્યોગસાહસિક અનુભવ સ્તર',
    expBeginner: 'શરૂઆત કરનાર (વ્યવસાયમાં નવા)',
    expSome: 'થોડો અનુભવ (1-3 વર્ષ)',
    expExperienced: 'અનુભવી (વ્યવસાયમાં 3+ વર્ષ)',
    businessBackground: 'સંક્ષિપ્ત વ્યવસાયિક / સાહસ પૃષ્ઠભૂમિ',
    businessBackgroundPlaceholder: 'તમારી વ્યવસાયિક પૃષ્ઠભૂમિ, આકાંક્ષાઓ અથવા અગાઉના અનુભવનું સંક્ષિપ્તમાં વર્ણન કરો...',
    accountActivity: 'એકાઉન્ટ પ્રવૃત્તિ',
    totalAssessments: 'કુલ મૂલ્યાંકન',
    inProgressAssessments: 'પ્રગતિમાં',
    completedAssessments: 'પૂર્ણ થયેલ',
    memberSince: 'સભ્ય બન્યા તારીખ',
    changePassword: 'પાસવર્ડ બદલો',
    changePasswordSubtitle: 'જો તમે પાસવર્ડ બદલવા ન માંગતા હોવ તો ખાલી રાખો.',
    currentPassword: 'હાલનો પાસવર્ડ',
    newPassword: 'નવો પાસવર્ડ',
    newPasswordPlaceholder: 'ઓછામાં ઓછા 6 અક્ષરો',
    passwordMismatch: 'હાલનો પાસવર્ડ ખોટો છે.',
    passwordChangedSuccess: 'પાસવર્ડ સફળતાપૂર્વક અપડેટ થયો છે.',
    dangerZone: 'જોખમી ક્ષેત્ર',
    deleteAccountTitle: 'એકાઉન્ટ કાઢી નાખો',
    deleteAccountWarning:
      'તમારું એકાઉન્ટ કાઢી નાખવાથી તમારી તમામ પ્રોફાઇલ માહિતી અને સાચવેલા મૂલ્યાંકનો કાયમ માટે દૂર થઈ જશે. આ ક્રિયા પાછી ખેંચી શકાતી નથી.',
    deleteAccountBtn: 'મારું એકાઉન્ટ કાઢી નાખો',
    confirmDeleteTitle: 'એકાઉન્ટ કાઢી નાખવાની ખાતરી કરો',
    confirmDeletePrompt: 'શું તમે ખરેખર તમારું એકાઉન્ટ અને બધા મૂલ્યાંકન રેકોર્ડ્સ કાયમ માટે કાઢી નાખવા માંગો છો?',
    confirmDeleteConfirmBtn: 'હા, મારું એકાઉન્ટ કાઢી નાખો',
    accountDeletedSuccess: 'તમારું એકાઉન્ટ સફળતાપૂર્વક કાઢી નાખવામાં આવ્યું છે.',
    accountDeleteFailed: 'એકાઉન્ટ કાઢી નાખવામાં નિષ્ફળ. કૃપા કરીને ફરી પ્રયાસ કરો.',

    // Help Page
    helpTitle: 'મદદ અને સલાહકાર માર્ગદર્શિકા',
    helpSubtitle: 'ગ્રામીણ અને અર્ધ-શહેરી ઉદ્યોગસાહસિકો માટે ઉડાન વાપરવા માટેનું સંપૂર્ણ માર્ગદર્શન.',
    aboutUdaanTitle: 'ઉડાન શું છે?',
    aboutUdaanDesc:
      'ઉડાન (“લોન લેતા પહેલા પુરાવો”) એ ગ્રામીણ અને અર્ધ-શહેરી ઉદ્યોગસાહસિકો માટે બનાવેલ એઆઈ-સહાયિત બિઝનેસ શક્યતા અને સલાહકાર પ્લેટફોર્મ છે. તે ઉદ્યોગસાહસિકોને વ્યાપારી કે માઇક્રોફાઇનાન્સ લોન લેતા પહેલા એ ચકાસવામાં મદદ કરે છે કે તેમના વ્યવસાય વિચારમાં પૂરતી સ્થાનિક માંગ અને નફાકારકતા છે કે નહીં.',
    whyUdaanTitle: 'ઉડાન શા માટે બનાવવામાં આવ્યું અને તે કોને મદદ કરે છે?',
    whyUdaanDesc:
      'ઘણા ગ્રામીણ ઉદ્યોગસાહસિકો સ્થાનિક માંગ, સ્પર્ધકો અથવા જરૂરી કાર્યકારી મૂડીનું મૂલ્યાંકન કર્યા વિના ઊંચા વ્યાજે લોન લે છે, જેના કારણે તેઓ દેવાની મુશ્કેલીમાં ફસાઈ જાય છે. ઉડાન ખેડૂતો, ગ્રામીણ યુવાનો, મહિલા સ્વ-સહાય જૂથો (SHGs) અને નાના દુકાનદારોને લોન લેતા પહેલા શક્યતા ચકાસવા સક્ષમ બનાવે છે.',
    howItWorksTitle: 'ઉડાન કેવી રીતે કામ કરે છે — સ્ટેપ-બાય-સ્ટેપ પ્રક્રિયા',
    step1Title: '1. મૂળભૂત સ્થળ અને શ્રેણી સેટઅપ',
    step1Desc: 'તમારું રાજ્ય, જિલ્લો, તાલુકો અને ગામ પસંદ કરો, પછી તમારો બિઝનેસ પ્રકાર પસંદ કરો અથવા લખો.',
    step2Title: '2. બિઝનેસ આઈડિયા અને સંસાધનો',
    step2Desc: 'તમારા પ્રસ્તાવિત વ્યવસાયનું વર્ણન કરો અને તમારી પાસે પહેલેથી ઉપલબ્ધ સાધનો (જમીન, દુકાન, મશીનરી, બચત) પસંદ કરો.',
    step3Title: '3. તમારું પોતાનું નાણાકીય યોગદાન',
    step3Desc: 'તમે તમારી પોતાની બચતમાંથી કેટલા પૈસા રોકી શકો છો તે જણાવો જેથી લોનની જરૂરિયાત સમજી શકાય.',
    step4Title: '4. સમીક્ષા અને શક્યતા મૂલ્યાંકન',
    step4Desc: 'બધી દાખલ કરેલી વિગતોની સમીક્ષા કરો, સ્થાનિક પરિસ્થિતિ તપાસો અને મૂલ્યાંકન રિપોર્ટ મેળવો.',
    financialGuidanceTitle: 'પ્રોજેક્ટ ખર્ચ, પોતાનું યોગદાન અને લોનને સમજવું',
    ownContributionVsLoanTitle: 'મહત્વપૂર્ણ સિદ્ધાંત: પોતાની બચત વિરુદ્ધ ઉધાર લીધેલી રકમ',
    ownContributionVsLoanDesc:
      'તમારું પોતાનું યોગદાન એ રકમ છે જે તમે લોન લીધા વિના તમારા વ્યવસાયમાં રોકી શકો છો. કુલ પ્રોજેક્ટ ખર્ચ એ વ્યવસાય શરૂ કરવાનો પૂરો ખર્ચ છે. સંભવિત લોન રકમ એ આ બંને વચ્ચેનો તફાવત છે. ઉડાન તમને એ સમજવામાં મદદ કરે છે કે શું તમારો વ્યવસાય તે લોન સુરક્ષિત રીતે ચૂકવી શકે છે.',
    loanWarningTitle: 'પ્લેટફોર્મ સલાહકાર સૂચના',
    loanWarningDesc:
      'ઉડાન માત્ર એક સલાહકાર અને શક્યતા મૂલ્યાંકન પ્લેટફોર્મ છે. ઉડાન લોન મંજૂરી, બેંક લોન, સરકારી સબસિડી કે ચોક્કસ નફાની ખાતરી આપતું નથી. તમામ આંકડા માહિતગાર નિર્ણય લેવામાં મદદ કરવા માટે અંદાજિત છે.',
    whatToPrepareTitle: 'મૂલ્યાંકન શરૂ કરતા પહેલા શું તૈયાર રાખવું',
    prepItem1: 'તમારા પ્રસ્તાવિત ઉત્પાદન અથવા સેવાનું સ્પષ્ટ વર્ણન.',
    prepItem2: 'ચોક્કસ ગામ/નગર અને તાલુકો જ્યાં વ્યવસાય ચાલશે.',
    prepItem3: 'તમારી પાસે પહેલેથી હોય તેવી સંપત્તિઓની યાદી (જમીન, દુકાન, મશીનરી, સાધનો).',
    prepItem4: 'શરૂઆતના રોકાણ માટે ઉપલબ્ધ અંગત બચતની રકમ.',
    faqsTitle: 'વારંવાર પૂછાતા પ્રશ્નો (FAQs)',
    faq1Q: 'શું ઉડાન કોઈ બેંક કે લોન આપનારી સંસ્થા છે?',
    faq1A: 'ના. ઉડાન એક સલાહકાર સાધન છે જે તમને બેંકમાં અરજી કરતા પહેલા લોન લેવી આર્થિક રીતે યોગ્ય છે કે નહીં તે ચકાસવામાં મદદ કરે છે.',
    faq2Q: 'જો મારું ગામ કે તાલુકો યાદીમાં ન મળે તો શું કરવું?',
    faq2A: 'તમે સરળતાથી “તમારું સ્થાન શોધી શકતા નથી? જાતે દાખલ કરો” પર ક્લિક કરી તમારા ગામ, તાલુકા, જિલ્લા કે રાજ્યનું નામ સીધું લખી શકો છો.',
    faq3Q: 'જો મારો બિઝનેસ આઈડિયા આપેલી શ્રેણીઓમાં ન હોય તો?',
    faq3A: 'શ્રેણીની યાદીના અંતે “અન્ય” વિકલ્પ પસંદ કરો અને આપેલા બોક્સમાં તમારા વ્યવસાયનું નામ લખો.',
    faq4Q: 'શું હું પછીથી મારી પસંદગીની ભાષા બદલી શકું?',
    faq4A: 'હા! તમે ટોચના નેવિગેશન બારમાં ભાષા બટનોનો ઉપયોગ કરીને ગમે ત્યારે અંગ્રેજી, હિન્દી અને ગુજરાતી વચ્ચે બદલી શકો છો.',
    faq5Q: 'શું મૂલ્યાંકન સબમિટ કરવાથી મારા પર લોન લેવાની કોઈ ફરજ પડશે?',
    faq5A: 'બિલકુલ નહીં. તમે જુદા જુદા આઈડિયા માટે ગમે તેટલા મૂલ્યાંકન બનાવી શકો છો અને તમારા ડેશબોર્ડ પરથી ગમે ત્યારે જોઈ શકો છો.',

    // Location & Category Setup
    location: 'કાર્યક્ષેત્રનું સ્થળ',
    businessCategory: 'વ્યવસાયની શ્રેણી',
    state: 'રાજ્ય',
    district: 'જિલ્લો',
    block: 'તાલુકો / બ્લોક',
    village: 'ગામ / નગર',
    selectState: 'રાજ્ય પસંદ કરો',
    selectDistrict: 'જિલ્લો પસંદ કરો',
    selectBlock: 'તાલુકો પસંદ કરો',
    selectVillage: 'ગામ / નગર પસંદ કરો',
    selectCategory: 'વ્યવસાય શ્રેણી પસંદ કરો',
    otherCategory: 'અન્ય / કસ્ટમ વ્યવસાય',
    customCategoryLabel: 'કૃપા કરીને તમારી વ્યવસાય શ્રેણી સ્પષ્ટ કરો',
    customCategoryPlaceholder: 'દા.ત. વાંસનું ફર્નિચર, બ્રોઇલર પોલ્ટ્રી ફાર્મ...',
    customCategoryRequired: 'કૃપા કરીને તમારી કસ્ટમ વ્યવસાય શ્રેણી દાખલ કરો.',
    cantFindLocation: 'તમારું સ્થાન શોધી શકતા નથી? જાતે દાખલ કરો.',
    enterLocationManually: 'સ્થાન જાતે દાખલ કરો',
    useLocationDropdowns: 'ડ્રોપડાઉન યાદી પર પાછા જાઓ',
    manualStatePlaceholder: 'રાજ્યનું નામ દાખલ કરો',
    manualDistrictPlaceholder: 'જિલ્લાનું નામ દાખલ કરો',
    manualBlockPlaceholder: 'તાલુકાનું નામ દાખલ કરો',
    manualVillagePlaceholder: 'ગામ / નગરનું નામ દાખલ કરો',
    selectedLocationText: 'પસંદ કરેલ સ્થળ:',

    // Assessment Steps & Inputs
    assessmentWorkflowTitle: 'બિઝનેસ શક્યતા મૂલ્યાંકન',
    stepBasic: '1. સેટઅપ',
    stepIdeaResources: '2. વિચાર અને સાધનો',
    stepFinance: '3. નાણાકીય યોગદાન',
    stepReview: '4. સમીક્ષા અને સબમિટ',
    basicDetailsTitle: '1. મૂળભૂત મૂલ્યાંકન સેટઅપ',
    basicDetailsSubtitle: 'જણાવો કે તમારો વ્યવસાય ક્યાં ચાલશે અને તમે કયો વ્યવસાય શરૂ કરવા માંગો છો.',
    businessIdeaTitle: 'તમારો બિઝનેસ આઈડિયા શું છે?',
    businessIdeaSubtitle: 'તમે તમારા વિસ્તારમાં જે ચોક્કસ વ્યવસાય, ઉત્પાદન કે સેવા શરૂ કરવા માંગો છો તેનું વર્ણન કરો.',
    businessIdeaPlaceholder: 'દા.ત. 3 દેશી ગાયો સાથે નાનો ડેરી વ્યવસાય શરૂ કરવો જેથી સ્થાનિક મંડળી અને નજીકના પરિવારોને તાજું દૂધ પહોંચાડી શકાય...',
    businessIdeaExamples: 'ઉદાહરણો: દરજીકામની દુકાન, લોટની ઘંટી, ફૂડ પ્રોસેસિંગ યુનિટ, મોબાઈલ રિપેરિંગ શોપ.',
    businessIdeaRequired: 'કૃપા કરીને તમારા બિઝનેસ આઈડિયાનું વર્ણન દાખલ કરો.',
    availableResourcesTitle: 'આ વ્યવસાય માટે તમારી પાસે કયા સાધનો અથવા મૂડી પહેલેથી ઉપલબ્ધ છે?',
    availableResourcesSubtitle: 'તમારી પાસે હાલમાં હોય તે તમામ મિલકતો, જગ્યા કે સાધનો પસંદ કરો.',
    resourceLand: 'જમીન',
    resourceShop: 'હાલની દુકાન કે મકાન',
    resourceMachinery: 'મશીનરી અથવા પ્રોસેસિંગ સાધનો',
    resourceTools: 'ઓજારો અથવા ફર્નિચર',
    resourceInfrastructure: 'હાલનું ઈન્ફ્રાસ્ટ્રક્ચર (વીજળી, પાણી, શેડ)',
    resourceSavings: 'રોકડ બચત / ઉપલબ્ધ નાણાકીય ભંડોળ',
    resourceOther: 'અન્ય સંસાધનો (નીચે વર્ણવો)',
    resourceNone: 'આમાંથી કંઈ નહીં (નવી શરૂઆત)',
    otherResourcePlaceholder: 'કૃપા કરીને અન્ય ઉપલબ્ધ મિલકતો અથવા સાધનોનું વર્ણન કરો...',
    availableFundsTitle: 'ઉપલબ્ધ રોકડ બચત / નાણાકીય રકમ (₹)',
    availableFundsSubtitle: 'વ્યવસાયમાં રોકવા માટે હાલમાં ઉપલબ્ધ અંદાજિત રોકડ અથવા બેંક બેલેન્સ.',
    availableFundsPlaceholder: 'દા.ત. 25000',
    ownContributionTitle: 'આ વ્યવસાય માટે તમે તમારા પોતાના પૈસામાંથી કેટલી રકમ ફાળવી શકો છો?',
    ownContributionSubtitle: 'આ તમારા પોતાના ભંડોળની તે રકમ છે જે તમે સૂચિત વ્યવસાયમાં રોકવા માટે તૈયાર અને સક્ષમ છો. આ તમારી ઉપલબ્ધ કુલ બચત કરતાં ઓછી હોઈ શકે છે અને લોનથી અલગ છે.',
    ownContributionPlaceholder: 'દા.ત. 100000',
    ownContributionNote: 'આ વ્યવસાય શરૂ કરવા માટે તમારું પોતાનું નાણાકીય યોગદાન છે, કુલ પ્રોજેક્ટ ખર્ચ કે લોનની રકમ નથી. જો તમારી પાસે કોઈ રકમ ન હોય તો 0 દાખલ કરો.',
    ownContributionRequired: 'કૃપા કરીને તમારા પોતાના યોગદાનની રકમ દાખલ કરો (જો કંઈ ન હોય તો 0 લખો).',
    negativeContributionError: 'પોતાનું યોગદાન ઋણ (નેગેટિવ) હોઈ શકતું નથી.',
    invalidAmountError: 'કૃપા કરીને માન્ય અને બિન-ઋણાત્મક નાણાકીય રકમ દાખલ કરો.',
    projectCostTitle: 'કુલ સૂચિત બિઝનેસ પ્રોજેક્ટ ખર્ચ (₹)',
    projectCostSubtitle: 'મશીનરી, ઓજારો, કાચો માલ, પરિસર અને કાર્યકારી મૂડી સહિતનો અંદાજિત કુલ ખર્ચ.',
    projectCostPlaceholder: 'દા.ત. 140000',
    projectCostRequired: 'કૃપા કરીને કુલ સૂચિત પ્રોજેક્ટ ખર્ચ દાખલ કરો.',
    negativeProjectCostError: 'કુલ પ્રોજેક્ટ ખર્ચ ઋણ હોઈ શકતો નથી.',
    applicableScheme: 'લાગુ ધિરાણ યોજના',
    requiredContributionLabel: 'જરૂરી સ્વ-યોગદાન (માર્જિન)',
    statedContributionLabel: 'તમારું જાહેર કરેલ યોગદાન',
    contributionShortfallLabel: 'યોગદાનની ઘટ (શોર્ટફોલ)',
    noShortfallNotice: 'તમારા ઉપલબ્ધ યોગદાન સાથે માર્જિન આવશ્યકતા સંપૂર્ણ પૂર્ણ થાય છે.',
    shortfallWarningNotice: 'યોજના લોન શરતો પૂરી કરવા વધારાના માર્જિનની જરૂર છે.',
    quarterlyInstallmentLabel: 'અંદાજિત ત્રિમાસિક હપ્તો',
    tenureAndMoratoriumLabel: 'મુદ્દત અને મોરેટોરિયમ',
    totalInterestLabel: 'કુલ અંદાજિત વ્યાજ',
    totalRepaymentLabel: 'કુલ અંદાજિત ચૂકવણી',
    notEligibleProjectCostError: 'પ્રોજેક્ટ ખર્ચ સરકારી લોન યોજનાઓની ₹50,00,000 મહત્તમ મર્યાદાથી વધુ છે.',
    recalculatingFinance: 'યોજના અને નાણાકીય શેડ્યૂલની ગણતરી ચાલુ છે...',
    preliminaryFinanceTitle: 'પ્રારંભિક નાણાકીય અંદાજ (10% લઘુત્તમ સ્વ-યોગદાન ધારણા)',
    minAssumedContributionPercent: 'લઘુત્તમ ધારવામાં આવેલ સ્વ-યોગદાન',
    maxTheoreticalProjectCost: 'મહત્તમ સૈદ્ધાંતિક પ્રોજેક્ટ ખર્ચ',
    maxTheoreticalLoanAmount: 'મહત્તમ સૈદ્ધાંતિક લોન રકમ (90% ધિરાણ)',
    preliminaryFinanceDisclaimer: 'પ્રમાણભૂત 10% લઘુત્તમ સ્વ-યોગદાન (માર્જિન મની) ધારણા પર આધારિત પ્રારંભિક સૈદ્ધાંતિક અંદાજો. વાસ્તવિક લોન પાત્રતા, વ્યાજ દરો, માર્જિન આવશ્યકતાઓ અને મંજૂરીઓ લાગુ ધિરાણ યોજના, પાત્ર પ્રોજેક્ટ ખર્ચ, બેંક મૂલ્યાંકન અને વૈધાનિક ક્રેડિટ મર્યાદાઓ પર આધાર રાખે છે. આ લોન મંજૂરી અથવા બાંયધરી નથી.',
    zeroContributionNotice: 'જ્યારે સ્વ-યોગદાન ₹0 હોય, ત્યારે 10% લઘુત્તમ યોગદાન ધારણા હેઠળ સૈદ્ધાંતિક પ્રોજેક્ટ ખર્ચ અથવા લોન રકમની ગણતરી કરી શકાતી નથી. હકારાત્મક સ્વ-યોગદાન જરૂરી છે.',
    reviewTitle: 'સમીક્ષા કરો અને મૂલ્યાંકન સબમિટ કરો',
    reviewSubtitle: 'તમારું બિઝનેસ મૂલ્યાંકન સબમિટ કરતા પહેલા દાખલ કરેલી વિગતો ચકાસો.',
    summaryIdentity: 'બિઝનેસ અને સ્થળ સેટઅપ',
    summaryIdea: 'બિઝનેસ આઈડિયા',
    summaryResources: 'ઉપલબ્ધ સંસાધનો અને સાધનો',
    summaryFinance: 'નાણાકીય યોગદાન',
    submitAssessmentBtn: 'શક્યતા મૂલ્યાંકન સબમિટ કરો',
    submittingAssessment: 'મૂલ્યાંકન સબમિટ થઈ રહ્યું છે...',
    assessmentSubmittedSuccess: 'મૂલ્યાંકન સફળતાપૂર્વક સબમિટ કરવામાં આવ્યું છે!',
    assessmentDraftSaved: 'મૂલ્યાંકન સફળતાપૂર્વક સાચવવામાં આવ્યું છે.',
    returnToDashboard: 'ડેશબોર્ડ પર પાછા જાઓ',
    backToAssessments: 'મૂલ્યાંકન યાદી પર પાછા જાઓ',

    // Status Labels
    statusDraft: 'ડ્રાફ્ટ',
    statusInProgress: 'પ્રગતિમાં છે',
    statusCompleted: 'પૂર્ણ થયું',
    statusSkipped: 'છોડી દીધેલ',
    statusPending: 'બાકી',
    statusAiAnalyzing: 'વિશ્લેષણ ચાલુ છે',
    statusReportReady: 'રિપોર્ટ તૈયાર છે',
    notesPlaceholder: 'ચકાસણી નોંધો અથવા અવલોકનો દાખલ કરો...',

    // Report & Feasibility Keys (Gujarati)
    reportHeaderTitle: 'વ્યવસાય શક્યતા અને સલાહકાર રિપોર્ટ',
    reportHeaderSubtitle: 'સંપૂર્ણ શક્યતા મૂલ્યાંકન, નાણાકીય અંદાજ અને જમીની વાસ્તવિકતા રિપોર્ટ',
    downloadPdfBtn: 'પીડીએફ રિપોર્ટ ડાઉનલોડ કરો',
    downloadingPdfBtn: 'પીડીએફ તૈયાર થઈ રહી છે...',
    pdfSuccessNotice: 'પીડીએફ રિપોર્ટ સફળતાપૂર્વક ડાઉનલોડ થયો! મૂલ્યાંકન સ્થિતિ પૂર્ણ (COMPLETED) તરીકે નોંધવામાં આવી છે.',
    section1Nav: '1. કાર્યકારી સારાંશ',
    section2Nav: '2. બજાર વિશ્લેષણ',
    section3Nav: '3. સ્પર્ધા',
    section4Nav: '4. ભાવ નિર્ધારણ',
    section5Nav: '5. નાણાકીય શક્યતા',
    section6Nav: '6. સ્વોટ (SWOT)',
    section7Nav: '7. જોખમ અને નિવારણ',
    section8Nav: '8. ઈન્ફ્રાસ્ટ્રક્ચર',
    section9Nav: '9. સહાયક સંસ્થાઓ',
    section10Nav: '10. શિક્ષણ સંસાધનો',
    section11Nav: '11. કાર્ય યોજના',
    section12Nav: '12. નિષ્કર્ષ',
    targetCustomerSegmentsLabel: 'લક્ષિત ગ્રાહકો',
    financialViabilitySnapshotLabel: 'નાણાકીય વ્યવહારિકતા સારાંશ',
    keyStrengthsLabel: 'મુખ્ય વ્યાપારી શક્તિઓ',
    criticalWatchpointsLabel: 'મહત્વપૂર્ણ ચેતવણી મુદ્દાઓ',
    demandDriversLabel: 'સ્થાનિક માંગના પરિબળો',
    competitorProfilesTable: 'સ્થાનિક સ્પર્ધકોની રૂપરેખા',
    differentiationStrategyLabel: 'સ્પર્ધાત્મક વ્યૂહરચના',
    inventoryMixTable: 'ઉત્પાદન શ્રેણી અને લક્ષિત માર્જિન મિશ્રણ',
    turnoverVelocityLabel: 'વેચાણ ગતિ (ટર્નઓવર)',
    grossMarginRangeLabel: 'લક્ષિત ગ્રોસ માર્જિન શ્રેણી',
    workingCapitalDisciplineLabel: 'કાર્યકારી મૂડી અને ઉધાર શિસ્ત',
    financialFeasibilityTitle: 'નાણાકીય વ્યવહારિકતા અને ધિરાણ યોજના માળખું',
    totalOutlayLabel: 'કુલ પ્રોજેક્ટ ખર્ચ',
    ownEquityLabel: 'પોતાનું મૂડી યોગદાન',
    bankLoanLabel: 'જરૂરી બેંક લોન',
    monthlyEmiLabel: 'અંદાજિત માસિક હપ્તો (EMI)',
    minOwnContributionBadge: 'લઘુત્તમ 10% પોતાનું યોગદાન નિયમ',
    marginShortfallAlert: 'સ્વ-મૂડીની ઘટ: સરકારી માર્ગદર્શિકા હેઠળ લઘુત્તમ 10% અરજદાર માર્જિન ફરજિયાત છે.',
    marginCompliantBadge: 'લઘુત્તમ 10% પોતાના યોગદાનની શરત પૂરી થાય છે',
    schemeDetailsTitle: 'સરકારી ક્રેડિટ યોજના પરિમાણો',
    interestRateLabel: 'વાર્ષિક વ્યાજ દર',
    tenureMoratoriumLabel: 'મુદ્દત અને મોરેટોરિયમ',
    dscrStatusLabel: 'ડીએસસીઆર (DSCR) દેવા સેવા સ્થિતિ',
    amortizationScheduleTitle: 'વિગતવાર લોન પુનઃચુકવણી સમયપત્રક',
    showScheduleBtn: 'સંપૂર્ણ લોન ચુકવણી સમયપત્રક જુઓ',
    hideScheduleBtn: 'સમયપત્રક છુપાવો',
    periodLabel: 'હપ્તો નં.',
    openingPrincipalLabel: 'શરૂઆતની બાકી રકમ',
    principalPaymentLabel: 'મુદ્દલ',
    interestPaymentLabel: 'વ્યાજ',
    installmentAmountLabel: 'કુલ હપ્તો',
    closingPrincipalLabel: 'અંતિમ બાકી રકમ',
    disclaimerLabel: 'નાણાકીય સલાહકાર ડિસ્ક્લેમર',
    swotStrengthsLabel: 'શક્તિઓ (આંતરિક ફાયદા)',
    swotWeaknessesLabel: 'નબળાઈઓ (સુધારાના ક્ષેત્રો)',
    swotOpportunitiesLabel: 'તકો (બહારની શક્યતાઓ)',
    swotThreatsLabel: 'પડકારો (બહારના જોખમો)',
    riskFactorLabel: 'જોખમ પરિબળ',
    likelihoodImpactLabel: 'સંભાવના / અસર',
    mitigationStrategyLabel: 'નિવારણ વ્યૂહરચના',
    monitoringIndicatorLabel: 'દેખરેખ સૂચક',
    infrastructureAssessmentTitle: 'ઈન્ફ્રાસ્ટ્રક્ચર અને જમીની વાસ્તવિકતા મૂલ્યાંકન',
    infrastructureFindingsTitle: 'ઈન્ફ્રાસ્ટ્રક્ચર તારણો અને ભલામણ કરેલ પગલાં',
    businessImpactLabel: 'વ્યવસાય સંચાલન પર અસર',
    recommendedActionsLabel: 'ભલામણ કરેલ વ્યવહારુ પગલાં',
    operationalPriorityLabel: 'પ્રાથમિકતા',
    supportOrganizationsTitle: 'સૂચિબદ્ધ સહાયક સંસ્થાઓ અને સ્થાનિક એનજીઓ',
    learningVideosTitle: 'પસંદ કરેલ વિડિયો અને તાલીમ સંસાધનો',
    actionPlanTitle: 'તબક્કાવાર વ્યાપાર અમલીકરણ કાર્ય યોજના (Action Plan)',
    conclusionTitle: 'નિષ્કર્ષ અને વ્યૂહાત્મક સલાહકાર સારાંશ',
    limitationsTitle: 'પદ્ધતિ અને સલાહકાર મર્યાદાઓ',
  },
};
