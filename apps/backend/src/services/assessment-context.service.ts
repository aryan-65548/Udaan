import { db } from '../db';
import {
  assessments,
  locations,
  businessCategories,
  assessmentInputs,
  financialRuns,
} from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import {
  AssessmentContext,
  AssessmentInput,
  PaymentFrequency,
  SupportedLanguage,
} from '../types/assessment-context';

export class AssessmentNotFoundError extends Error {
  constructor(message = 'Assessment not found') {
    super(message);
    this.name = 'AssessmentNotFoundError';
  }
}

export class AssessmentAccessDeniedError extends Error {
  constructor(message = 'Access denied: you do not own this assessment') {
    super(message);
    this.name = 'AssessmentAccessDeniedError';
  }
}

export class LocationNotFoundError extends Error {
  constructor(message = 'Location not found') {
    super(message);
    this.name = 'LocationNotFoundError';
  }
}

export class IncompleteLocationHierarchyError extends Error {
  constructor(message = 'Incomplete location hierarchy: state, district, block, and village are required') {
    super(message);
    this.name = 'IncompleteLocationHierarchyError';
  }
}

export class BusinessCategoryNotFoundError extends Error {
  constructor(message = 'Business category not found') {
    super(message);
    this.name = 'BusinessCategoryNotFoundError';
  }
}

export class UnsupportedLanguageError extends Error {
  constructor(language: string) {
    super(`Unsupported assessment language: ${language}`);
    this.name = 'UnsupportedLanguageError';
  }
}

/**
 * Resolves the location hierarchy (Village -> Block -> District -> State) starting from the assessment location.
 */
async function resolveLocationHierarchy(locationId: string) {
  const [initialLoc] = await db
    .select()
    .from(locations)
    .where(eq(locations.id, locationId))
    .limit(1);

  if (!initialLoc) {
    throw new LocationNotFoundError(`Location with id ${locationId} not found`);
  }

  const chain: Array<typeof initialLoc> = [initialLoc];
  let currentParentId = initialLoc.parentId;

  // Walk up to root (maximum 10 levels)
  while (currentParentId && chain.length < 10) {
    const [parent] = await db
      .select()
      .from(locations)
      .where(eq(locations.id, currentParentId))
      .limit(1);

    if (!parent) break;
    chain.push(parent);
    currentParentId = parent.parentId;
  }

  const byType: Partial<Record<string, typeof initialLoc>> = {};
  for (const loc of chain) {
    byType[loc.type] = loc;
  }

  const stateNode = byType['STATE'];
  const districtNode = byType['DISTRICT'];
  const blockNode = byType['BLOCK'];
  const villageNode = byType['VILLAGE'];

  const state = stateNode?.name ?? (initialLoc.type === 'STATE' ? initialLoc.name : undefined);
  const district = districtNode?.name ?? (initialLoc.type === 'DISTRICT' ? initialLoc.name : undefined);
  const block = blockNode?.name ?? (initialLoc.type === 'BLOCK' ? initialLoc.name : undefined);
  const village = villageNode?.name ?? (initialLoc.type === 'VILLAGE' ? initialLoc.name : undefined);

  if (!state || !district || !block || !village) {
    throw new IncompleteLocationHierarchyError(
      `Incomplete location hierarchy for location ${locationId}: missing required hierarchy fields`
    );
  }

  return {
    id: initialLoc.id,
    state,
    district,
    block,
    village,
    stateCode:
      initialLoc.stateCode ??
      villageNode?.stateCode ??
      blockNode?.stateCode ??
      districtNode?.stateCode ??
      stateNode?.stateCode ??
      undefined,
    districtCode:
      initialLoc.districtCode ??
      villageNode?.districtCode ??
      blockNode?.districtCode ??
      districtNode?.districtCode ??
      undefined,
    blockCode:
      initialLoc.blockCode ??
      villageNode?.blockCode ??
      blockNode?.blockCode ??
      undefined,
    villageCode:
      initialLoc.villageCode ??
      villageNode?.villageCode ??
      undefined,
    latitude: initialLoc.latitude !== null && initialLoc.latitude !== undefined ? Number(initialLoc.latitude) : undefined,
    longitude: initialLoc.longitude !== null && initialLoc.longitude !== undefined ? Number(initialLoc.longitude) : undefined,
  };
}

/**
 * Safely parses optional financial numbers, preserving 0 while converting null/undefined to undefined.
 */
function parseOptionalNumber(val: unknown): number | undefined {
  if (val === null || val === undefined || val === '') {
    return undefined;
  }
  const num = Number(val);
  return Number.isNaN(num) ? undefined : num;
}

/**
 * Translates a normalized database row into the AssessmentInput contract format.
 */
function toAssessmentInput(row: typeof assessmentInputs.$inferSelect): AssessmentInput {
  let value: string | number | boolean | object | undefined = undefined;

  if (row.inputType === 'NUMBER') {
    value = row.valueNumber !== null && row.valueNumber !== undefined ? Number(row.valueNumber) : undefined;
  } else if (row.inputType === 'BOOLEAN') {
    value = row.valueBoolean !== null && row.valueBoolean !== undefined ? row.valueBoolean : undefined;
  } else if (row.inputType === 'JSON') {
    value = (row.valueJson as object) ?? undefined;
  } else if (row.inputType === 'MULTI_SELECT') {
    value = (row.valueJson as object) ?? (row.valueText ?? undefined);
  } else {
    // TEXT, SELECT, DATE
    value = row.valueText ?? undefined;
  }

  // Fallback if the specific type column was empty but another value column was populated
  if (value === undefined) {
    if (row.valueText !== null && row.valueText !== undefined) {
      value = row.valueText;
    } else if (row.valueNumber !== null && row.valueNumber !== undefined) {
      value = Number(row.valueNumber);
    } else if (row.valueBoolean !== null && row.valueBoolean !== undefined) {
      value = row.valueBoolean;
    } else if (row.valueJson !== null && row.valueJson !== undefined) {
      value = row.valueJson as object;
    }
  }

  return {
    key: row.inputKey,
    questionText: row.questionText ?? undefined,
    inputType: row.inputType,
    value,
    source: row.source,
  };
}

/**
 * Derives profile context from raw assessment input rows without fabricating defaults.
 */
function deriveProfile(inputsMap: Map<string, typeof assessmentInputs.$inferSelect>) {
  const getVal = (snake: string, camel: string) => inputsMap.get(snake) ?? inputsMap.get(camel);

  const prevExp = getVal('previous_experience', 'previousExperience');
  const hasLand = getVal('has_land', 'hasLand');
  const hasShop = getVal('has_shop', 'hasShop');
  const hasRoom = getVal('has_room', 'hasRoom');
  const hasEquip = getVal('has_equipment', 'hasEquipment');
  const workHours = getVal('expected_working_hours', 'expectedWorkingHours');
  const knownCust = getVal('has_known_customers', 'hasKnownCustomers');

  const toBool = (item?: typeof assessmentInputs.$inferSelect): boolean | undefined => {
    if (!item) return undefined;
    if (item.valueBoolean !== null && item.valueBoolean !== undefined) return item.valueBoolean;
    if (item.valueText === 'true') return true;
    if (item.valueText === 'false') return false;
    return undefined;
  };

  const toNum = (item?: typeof assessmentInputs.$inferSelect): number | undefined => {
    if (!item) return undefined;
    if (item.valueNumber !== null && item.valueNumber !== undefined) return Number(item.valueNumber);
    if (item.valueText && !isNaN(Number(item.valueText))) return Number(item.valueText);
    return undefined;
  };

  const toStr = (item?: typeof assessmentInputs.$inferSelect): string | undefined => {
    if (!item) return undefined;
    return item.valueText ?? undefined;
  };

  return {
    previousExperience: toStr(prevExp),
    hasLand: toBool(hasLand),
    hasShop: toBool(hasShop),
    hasRoom: toBool(hasRoom),
    hasEquipment: toBool(hasEquip),
    expectedWorkingHours: toNum(workHours),
    hasKnownCustomers: toBool(knownCust),
  };
}

/**
 * Assembles and returns the full AssessmentContext according to docs/04_AI_BACKEND_CONTRACT.md.
 * Framework-independent: strictly throws domain errors on missing / unauthorized assessments.
 */
export async function getAssessmentContext(
  assessmentId: string,
  userId: string
): Promise<AssessmentContext> {
  // 1. Verify assessment existence and user ownership
  const [assessment] = await db
    .select()
    .from(assessments)
    .where(eq(assessments.id, assessmentId))
    .limit(1);

  if (!assessment) {
    throw new AssessmentNotFoundError();
  }

  if (assessment.userId !== userId) {
    throw new AssessmentAccessDeniedError();
  }

  // 2. Resolve location hierarchy
  const locationHierarchy = await resolveLocationHierarchy(assessment.locationId);

  // 3. Resolve business category
  const [category] = await db
    .select()
    .from(businessCategories)
    .where(eq(businessCategories.id, assessment.businessCategoryId))
    .limit(1);

  if (!category) {
    throw new BusinessCategoryNotFoundError(
      `Business category with id ${assessment.businessCategoryId} not found`
    );
  }

  // Validate supported language
  const SUPPORTED_LANGUAGES: readonly SupportedLanguage[] = ['en', 'hi', 'gu'] as const;
  if (!(SUPPORTED_LANGUAGES as readonly string[]).includes(assessment.language)) {
    throw new UnsupportedLanguageError(assessment.language);
  }
  const validLang = assessment.language as SupportedLanguage;

  // 4. Retrieve assessment inputs
  const rawInputs = await db
    .select()
    .from(assessmentInputs)
    .where(eq(assessmentInputs.assessmentId, assessmentId));

  const inputsMap = new Map<string, typeof assessmentInputs.$inferSelect>();
  for (const input of rawInputs) {
    inputsMap.set(input.inputKey, input);
  }

  const contractInputs = rawInputs.map(toAssessmentInput);
  const profile = deriveProfile(inputsMap);

  // 5. Retrieve latest financial run
  const [latestFinance] = await db
    .select()
    .from(financialRuns)
    .where(eq(financialRuns.assessmentId, assessmentId))
    .orderBy(desc(financialRuns.createdAt))
    .limit(1);

  const finance = latestFinance
    ? {
        ownContribution: parseOptionalNumber(latestFinance.ownContribution),
        projectCost: parseOptionalNumber(latestFinance.projectCost),
        loanAmount: parseOptionalNumber(latestFinance.loanAmount),
        interestRate: parseOptionalNumber(latestFinance.interestRate),
        tenureMonths: parseOptionalNumber(latestFinance.tenureMonths),
        moratoriumMonths: parseOptionalNumber(latestFinance.moratoriumMonths),
        paymentFrequency: (latestFinance.paymentFrequency as PaymentFrequency) ?? undefined,
        emi: parseOptionalNumber(latestFinance.emi),
        installmentAmount: parseOptionalNumber(latestFinance.installmentAmount),
        annualDebtService: parseOptionalNumber(latestFinance.annualDebtService),
        dscr: parseOptionalNumber(latestFinance.dscr),
        totalInterest: parseOptionalNumber(latestFinance.totalInterest),
        totalRepayment: parseOptionalNumber(latestFinance.totalRepayment),
      }
    : {};

  return {
    assessmentId: assessment.id,
    user: {
      language: validLang,
    },
    location: locationHierarchy,
    business: {
      categoryId: category.id,
      categoryName: category.name,
    },
    profile,
    finance,
    inputs: contractInputs,
  };
}
