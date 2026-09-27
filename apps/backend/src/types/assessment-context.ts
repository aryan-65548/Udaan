import {
  assessmentStatusEnum,
  aiStatusEnum,
  inputTypeEnum,
  inputSourceEnum,
  paymentFrequencyEnum,
} from '../db/schema';

export type AssessmentStatus = (typeof assessmentStatusEnum.enumValues)[number];
export type AiStatus = (typeof aiStatusEnum.enumValues)[number];
export type InputType = (typeof inputTypeEnum.enumValues)[number];
export type InputSource = (typeof inputSourceEnum.enumValues)[number];
export type PaymentFrequency = (typeof paymentFrequencyEnum.enumValues)[number];

export type SupportedLanguage = 'en' | 'hi' | 'gu';

export interface AssessmentInput {
  key: string;
  questionText?: string;
  inputType: InputType;
  value?: string | number | boolean | object;
  source: InputSource;
}

export interface AssessmentContext {
  assessmentId: string;

  user: {
    language: SupportedLanguage;
  };

  location: {
    id: string;
    state: string;
    district: string;
    block: string;
    village: string;
    stateCode?: string;
    districtCode?: string;
    blockCode?: string;
    villageCode?: string;
    latitude?: number;
    longitude?: number;
  };

  business: {
    categoryId: string;
    categoryName: string;
  };

  profile: {
    previousExperience?: string;
    hasLand?: boolean;
    hasShop?: boolean;
    hasRoom?: boolean;
    hasEquipment?: boolean;
    expectedWorkingHours?: number;
    hasKnownCustomers?: boolean;
  };

  finance: {
    ownContribution?: number;
    projectCost?: number;
    loanAmount?: number;
    interestRate?: number;
    tenureMonths?: number;
    moratoriumMonths?: number;
    paymentFrequency?: PaymentFrequency;
    emi?: number;
    installmentAmount?: number;
    annualDebtService?: number;
    dscr?: number;
    totalInterest?: number;
    totalRepayment?: number;
  };

  inputs: AssessmentInput[];
}
