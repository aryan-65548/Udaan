import {
  getAssessmentContext,
  AssessmentNotFoundError,
  AssessmentAccessDeniedError,
  LocationNotFoundError,
  IncompleteLocationHierarchyError,
  BusinessCategoryNotFoundError,
  UnsupportedLanguageError,
} from '../../src/services/assessment-context.service';
import {
  isValidAssessmentStatusTransition,
  transitionAssessmentStatus,
  updateAIStatus,
  updateAISession,
  InvalidStateTransitionError,
  AssessmentNotFoundError as StateAssessmentNotFoundError,
} from '../../src/services/assessment-state.service';
import {
  upsertAssessmentInput,
  getAssessmentInputs,
} from '../../src/services/assessment-input.service';
import { db } from '../../src/db';

jest.mock('../../src/db', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
  },
}));

function createMockQuery(resolvedValue: unknown) {
  const queryObj: Record<string, unknown> = {
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockImplementation(() => ({
      limit: jest.fn().mockResolvedValue(resolvedValue),
      then: (resolve: (v: unknown) => void) => Promise.resolve(resolvedValue).then(resolve),
    })),
    limit: jest.fn().mockResolvedValue(resolvedValue),
    then: (resolve: (v: unknown) => void) => Promise.resolve(resolvedValue).then(resolve),
  };
  return queryObj;
}

describe('Phase 3 Platform Services Unit Tests', () => {
  const assessmentId = 'c1000000-0000-0000-0000-000000000001';
  const userId = 'u1000000-0000-0000-0000-000000000001';
  const locationId = 'l1000000-0000-0000-0000-000000000001';
  const categoryId = 'b1000000-0000-0000-0000-000000000001';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('1. assessment-context.service', () => {
    const validVillage = {
      id: locationId,
      name: 'Nandasan',
      type: 'VILLAGE',
      parentId: 'loc-block',
      stateCode: 'GJ',
      districtCode: 'MEH',
      blockCode: 'KAD',
      villageCode: 'NAN',
      latitude: '23.123',
      longitude: '72.456',
    };
    const validBlock = { id: 'loc-block', name: 'Kadi', type: 'BLOCK', parentId: 'loc-district' };
    const validDistrict = { id: 'loc-district', name: 'Mehsana', type: 'DISTRICT', parentId: 'loc-state' };
    const validState = { id: 'loc-state', name: 'Gujarat', type: 'STATE', parentId: null };

    const validCategory = { id: categoryId, name: 'Dairy Farming' };

    it('throws AssessmentNotFoundError when assessment does not exist', async () => {
      (db.select as jest.Mock).mockReturnValueOnce(createMockQuery([]));

      await expect(getAssessmentContext(assessmentId, userId)).rejects.toThrow(
        AssessmentNotFoundError
      );
    });

    it('throws AssessmentAccessDeniedError when user is not owner', async () => {
      (db.select as jest.Mock).mockReturnValueOnce(
        createMockQuery([{ id: assessmentId, userId: 'other-user', locationId, businessCategoryId: categoryId }])
      );

      await expect(getAssessmentContext(assessmentId, userId)).rejects.toThrow(
        AssessmentAccessDeniedError
      );
    });

    it('A) throws LocationNotFoundError when referenced location does not exist', async () => {
      const mockAssessment = {
        id: assessmentId,
        userId,
        locationId,
        businessCategoryId: categoryId,
        language: 'en',
      };

      (db.select as jest.Mock)
        .mockReturnValueOnce(createMockQuery([mockAssessment]))
        .mockReturnValueOnce(createMockQuery([]));

      await expect(getAssessmentContext(assessmentId, userId)).rejects.toThrow(
        LocationNotFoundError
      );
    });

    it('A) throws IncompleteLocationHierarchyError when hierarchy fields are missing', async () => {
      const mockAssessment = {
        id: assessmentId,
        userId,
        locationId,
        businessCategoryId: categoryId,
        language: 'en',
      };

      const isolatedVillage = {
        id: locationId,
        name: 'Nandasan',
        type: 'VILLAGE',
        parentId: null,
      };

      (db.select as jest.Mock)
        .mockReturnValueOnce(createMockQuery([mockAssessment]))
        .mockReturnValueOnce(createMockQuery([isolatedVillage]));

      await expect(getAssessmentContext(assessmentId, userId)).rejects.toThrow(
        IncompleteLocationHierarchyError
      );
    });

    it('B) throws UnsupportedLanguageError when assessment language is not en/hi/gu', async () => {
      const mockAssessment = {
        id: assessmentId,
        userId,
        locationId,
        businessCategoryId: categoryId,
        language: 'fr',
      };

      (db.select as jest.Mock)
        .mockReturnValueOnce(createMockQuery([mockAssessment]))
        .mockReturnValueOnce(createMockQuery([validVillage]))
        .mockReturnValueOnce(createMockQuery([validBlock]))
        .mockReturnValueOnce(createMockQuery([validDistrict]))
        .mockReturnValueOnce(createMockQuery([validState]))
        .mockReturnValueOnce(createMockQuery([validCategory]));

      await expect(getAssessmentContext(assessmentId, userId)).rejects.toThrow(
        UnsupportedLanguageError
      );
    });

    it('D) throws BusinessCategoryNotFoundError when category does not exist', async () => {
      const mockAssessment = {
        id: assessmentId,
        userId,
        locationId,
        businessCategoryId: categoryId,
        language: 'en',
      };

      (db.select as jest.Mock)
        .mockReturnValueOnce(createMockQuery([mockAssessment]))
        .mockReturnValueOnce(createMockQuery([validVillage]))
        .mockReturnValueOnce(createMockQuery([validBlock]))
        .mockReturnValueOnce(createMockQuery([validDistrict]))
        .mockReturnValueOnce(createMockQuery([validState]))
        .mockReturnValueOnce(createMockQuery([]));

      await expect(getAssessmentContext(assessmentId, userId)).rejects.toThrow(
        BusinessCategoryNotFoundError
      );
    });

    it('C & D) Location context verifies hierarchy, codes, and coordinates', async () => {
      const mockAssessment = {
        id: assessmentId,
        userId,
        locationId,
        businessCategoryId: categoryId,
        language: 'en',
      };

      (db.select as jest.Mock)
        .mockReturnValueOnce(createMockQuery([mockAssessment]))
        .mockReturnValueOnce(createMockQuery([validVillage]))
        .mockReturnValueOnce(createMockQuery([validBlock]))
        .mockReturnValueOnce(createMockQuery([validDistrict]))
        .mockReturnValueOnce(createMockQuery([validState]))
        .mockReturnValueOnce(createMockQuery([validCategory]))
        .mockReturnValueOnce(createMockQuery([]))
        .mockReturnValueOnce(createMockQuery([]));

      const context = await getAssessmentContext(assessmentId, userId);
      expect(context.location.id).toBe(locationId);
      expect(context.location.state).toBe('Gujarat');
      expect(context.location.district).toBe('Mehsana');
      expect(context.location.block).toBe('Kadi');
      expect(context.location.village).toBe('Nandasan');
      expect(context.location.stateCode).toBe('GJ');
      expect(context.location.districtCode).toBe('MEH');
      expect(context.location.blockCode).toBe('KAD');
      expect(context.location.villageCode).toBe('NAN');
      expect(context.location.latitude).toBe(23.123);
      expect(context.location.longitude).toBe(72.456);
    });

    it('B) converts input types TEXT, NUMBER, BOOLEAN, JSON, and MULTI_SELECT', async () => {
      const mockAssessment = {
        id: assessmentId,
        userId,
        locationId,
        businessCategoryId: categoryId,
        language: 'en',
      };

      const rawInputs = [
        {
          id: 'i1',
          assessmentId,
          inputKey: 'desc',
          inputType: 'TEXT',
          questionText: 'Describe business',
          valueText: 'Bakery shop',
          valueNumber: null,
          valueBoolean: null,
          valueJson: null,
          source: 'USER',
        },
        {
          id: 'i2',
          assessmentId,
          inputKey: 'staff_count',
          inputType: 'NUMBER',
          questionText: 'Number of staff',
          valueText: null,
          valueNumber: '0',
          valueBoolean: null,
          valueJson: null,
          source: 'USER',
        },
        {
          id: 'i3',
          assessmentId,
          inputKey: 'has_license',
          inputType: 'BOOLEAN',
          questionText: 'Has trade license',
          valueText: null,
          valueNumber: null,
          valueBoolean: false,
          valueJson: null,
          source: 'SYSTEM',
        },
        {
          id: 'i4',
          assessmentId,
          inputKey: 'equipment_list',
          inputType: 'JSON',
          questionText: 'Equipment details',
          valueText: null,
          valueNumber: null,
          valueBoolean: null,
          valueJson: { oven: 2, trays: 10 },
          source: 'AI',
        },
        {
          id: 'i5',
          assessmentId,
          inputKey: 'target_markets',
          inputType: 'MULTI_SELECT',
          questionText: 'Target markets',
          valueText: null,
          valueNumber: null,
          valueBoolean: null,
          valueJson: ['local', 'wholesale'],
          source: 'USER',
        },
      ];

      (db.select as jest.Mock)
        .mockReturnValueOnce(createMockQuery([mockAssessment]))
        .mockReturnValueOnce(createMockQuery([validVillage]))
        .mockReturnValueOnce(createMockQuery([validBlock]))
        .mockReturnValueOnce(createMockQuery([validDistrict]))
        .mockReturnValueOnce(createMockQuery([validState]))
        .mockReturnValueOnce(createMockQuery([validCategory]))
        .mockReturnValueOnce(createMockQuery(rawInputs))
        .mockReturnValueOnce(createMockQuery([]));

      const context = await getAssessmentContext(assessmentId, userId);
      expect(context.inputs).toHaveLength(5);

      const textInp = context.inputs.find((i) => i.key === 'desc');
      expect(textInp?.inputType).toBe('TEXT');
      expect(textInp?.value).toBe('Bakery shop');
      expect(textInp?.source).toBe('USER');

      const numInp = context.inputs.find((i) => i.key === 'staff_count');
      expect(numInp?.inputType).toBe('NUMBER');
      expect(numInp?.value).toBe(0);

      const boolInp = context.inputs.find((i) => i.key === 'has_license');
      expect(boolInp?.inputType).toBe('BOOLEAN');
      expect(boolInp?.value).toBe(false);
      expect(boolInp?.source).toBe('SYSTEM');

      const jsonInp = context.inputs.find((i) => i.key === 'equipment_list');
      expect(jsonInp?.inputType).toBe('JSON');
      expect(jsonInp?.value).toEqual({ oven: 2, trays: 10 });
      expect(jsonInp?.source).toBe('AI');

      const multiInp = context.inputs.find((i) => i.key === 'target_markets');
      expect(multiInp?.inputType).toBe('MULTI_SELECT');
      expect(multiInp?.value).toEqual(['local', 'wholesale']);
    });

    it('C) derives complete profile without fabricating missing values', async () => {
      const mockAssessment = {
        id: assessmentId,
        userId,
        locationId,
        businessCategoryId: categoryId,
        language: 'hi',
      };

      const rawInputs = [
        {
          id: 'p1',
          assessmentId,
          inputKey: 'previous_experience',
          inputType: 'TEXT',
          valueText: '3 years in retail',
          source: 'USER',
        },
        {
          id: 'p2',
          assessmentId,
          inputKey: 'has_land',
          inputType: 'BOOLEAN',
          valueBoolean: true,
          source: 'USER',
        },
        {
          id: 'p3',
          assessmentId,
          inputKey: 'has_shop',
          inputType: 'BOOLEAN',
          valueBoolean: false,
          source: 'USER',
        },
        {
          id: 'p4',
          assessmentId,
          inputKey: 'has_equipment',
          inputType: 'BOOLEAN',
          valueBoolean: true,
          source: 'USER',
        },
        {
          id: 'p5',
          assessmentId,
          inputKey: 'expected_working_hours',
          inputType: 'NUMBER',
          valueNumber: '8',
          source: 'USER',
        },
        {
          id: 'p6',
          assessmentId,
          inputKey: 'has_known_customers',
          inputType: 'BOOLEAN',
          valueBoolean: true,
          source: 'USER',
        },
      ];

      (db.select as jest.Mock)
        .mockReturnValueOnce(createMockQuery([mockAssessment]))
        .mockReturnValueOnce(createMockQuery([validVillage]))
        .mockReturnValueOnce(createMockQuery([validBlock]))
        .mockReturnValueOnce(createMockQuery([validDistrict]))
        .mockReturnValueOnce(createMockQuery([validState]))
        .mockReturnValueOnce(createMockQuery([validCategory]))
        .mockReturnValueOnce(createMockQuery(rawInputs))
        .mockReturnValueOnce(createMockQuery([]));

      const context = await getAssessmentContext(assessmentId, userId);
      expect(context.profile.previousExperience).toBe('3 years in retail');
      expect(context.profile.hasLand).toBe(true);
      expect(context.profile.hasShop).toBe(false);
      expect(context.profile.hasRoom).toBeUndefined();
      expect(context.profile.hasEquipment).toBe(true);
      expect(context.profile.expectedWorkingHours).toBe(8);
      expect(context.profile.hasKnownCustomers).toBe(true);
    });

    it('E) preserves finance numeric value 0 without treating it as falsy', async () => {
      const mockAssessment = {
        id: assessmentId,
        userId,
        locationId,
        businessCategoryId: categoryId,
        language: 'gu',
      };

      const mockFinanceWithZeros = {
        id: 'fin-1',
        assessmentId,
        ownContribution: '0',
        projectCost: '100000',
        loanAmount: '100000',
        interestRate: '0',
        tenureMonths: 0,
        moratoriumMonths: 0,
        paymentFrequency: 'MONTHLY',
        emi: '0',
        installmentAmount: '0',
        annualDebtService: '0',
        dscr: '0',
        totalInterest: '0',
        totalRepayment: '100000',
        createdAt: new Date(),
      };

      (db.select as jest.Mock)
        .mockReturnValueOnce(createMockQuery([mockAssessment]))
        .mockReturnValueOnce(createMockQuery([validVillage]))
        .mockReturnValueOnce(createMockQuery([validBlock]))
        .mockReturnValueOnce(createMockQuery([validDistrict]))
        .mockReturnValueOnce(createMockQuery([validState]))
        .mockReturnValueOnce(createMockQuery([validCategory]))
        .mockReturnValueOnce(createMockQuery([]))
        .mockReturnValueOnce(createMockQuery([mockFinanceWithZeros]));

      const context = await getAssessmentContext(assessmentId, userId);

      expect(context.finance.ownContribution).toBe(0);
      expect(context.finance.interestRate).toBe(0);
      expect(context.finance.tenureMonths).toBe(0);
      expect(context.finance.moratoriumMonths).toBe(0);
      expect(context.finance.emi).toBe(0);
      expect(context.finance.dscr).toBe(0);
    });

    it('E) correctly handles missing finance record by returning empty finance object', async () => {
      const mockAssessment = {
        id: assessmentId,
        userId,
        locationId,
        businessCategoryId: categoryId,
        language: 'hi',
      };

      (db.select as jest.Mock)
        .mockReturnValueOnce(createMockQuery([mockAssessment]))
        .mockReturnValueOnce(createMockQuery([validVillage]))
        .mockReturnValueOnce(createMockQuery([validBlock]))
        .mockReturnValueOnce(createMockQuery([validDistrict]))
        .mockReturnValueOnce(createMockQuery([validState]))
        .mockReturnValueOnce(createMockQuery([validCategory]))
        .mockReturnValueOnce(createMockQuery([]))
        .mockReturnValueOnce(createMockQuery([]));

      const context = await getAssessmentContext(assessmentId, userId);
      expect(context.user.language).toBe('hi');
      expect(context.finance).toEqual({});
      expect(context.inputs).toEqual([]);
    });
  });

  describe('2. assessment-state.service', () => {
    it('isValidAssessmentStatusTransition rejects IN_PROGRESS -> REPORT_READY and IN_PROGRESS -> COMPLETED', () => {
      expect(isValidAssessmentStatusTransition('IN_PROGRESS', 'REPORT_READY')).toBe(false);
      expect(isValidAssessmentStatusTransition('IN_PROGRESS', 'COMPLETED')).toBe(false);
    });

    it('isValidAssessmentStatusTransition allows valid Phase 3 transitions', () => {
      expect(isValidAssessmentStatusTransition('DRAFT', 'IN_PROGRESS')).toBe(true);
      expect(isValidAssessmentStatusTransition('IN_PROGRESS', 'AI_QUESTIONING')).toBe(true);
      expect(isValidAssessmentStatusTransition('AI_QUESTIONING', 'AI_ANALYZING')).toBe(true);
      expect(isValidAssessmentStatusTransition('AI_ANALYZING', 'REPORT_READY')).toBe(true);
      expect(isValidAssessmentStatusTransition('REPORT_READY', 'COMPLETED')).toBe(true);
      expect(isValidAssessmentStatusTransition('IN_PROGRESS', 'FAILED')).toBe(true);
      expect(isValidAssessmentStatusTransition('FAILED', 'IN_PROGRESS')).toBe(true);
      expect(isValidAssessmentStatusTransition('FAILED', 'AI_QUESTIONING')).toBe(true);
    });

    it('isValidAssessmentStatusTransition rejects FAILED -> AI_ANALYZING', () => {
      expect(isValidAssessmentStatusTransition('FAILED', 'AI_ANALYZING')).toBe(false);
    });

    it('isValidAssessmentStatusTransition treats COMPLETED as terminal', () => {
      expect(isValidAssessmentStatusTransition('COMPLETED', 'IN_PROGRESS')).toBe(false);
      expect(isValidAssessmentStatusTransition('COMPLETED', 'AI_QUESTIONING')).toBe(false);
      expect(isValidAssessmentStatusTransition('COMPLETED', 'REPORT_READY')).toBe(false);
      expect(isValidAssessmentStatusTransition('COMPLETED', 'FAILED')).toBe(false);
    });

    it('transitionAssessmentStatus throws InvalidStateTransitionError when IN_PROGRESS -> REPORT_READY is attempted', async () => {
      (db.select as jest.Mock).mockReturnValueOnce(
        createMockQuery([{ id: assessmentId, status: 'IN_PROGRESS' }])
      );

      await expect(
        transitionAssessmentStatus(assessmentId, 'REPORT_READY')
      ).rejects.toThrow(InvalidStateTransitionError);
    });

    it('transitionAssessmentStatus throws InvalidStateTransitionError when IN_PROGRESS -> COMPLETED is attempted', async () => {
      (db.select as jest.Mock).mockReturnValueOnce(
        createMockQuery([{ id: assessmentId, status: 'IN_PROGRESS' }])
      );

      await expect(
        transitionAssessmentStatus(assessmentId, 'COMPLETED')
      ).rejects.toThrow(InvalidStateTransitionError);
    });

    it('transitionAssessmentStatus updates assessment when transition is valid', async () => {
      (db.select as jest.Mock).mockReturnValueOnce(
        createMockQuery([{ id: assessmentId, status: 'IN_PROGRESS' }])
      );

      const mockUpdated = { id: assessmentId, status: 'AI_QUESTIONING', aiStatus: 'QUESTIONING' };
      (db.update as jest.Mock).mockReturnValueOnce({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([mockUpdated]),
          }),
        }),
      });

      const result = await transitionAssessmentStatus(assessmentId, 'AI_QUESTIONING', {
        aiStatus: 'QUESTIONING',
      });

      expect(result).toEqual(mockUpdated);
    });

    it('transitionAssessmentStatus throws AssessmentNotFoundError when assessment does not exist', async () => {
      (db.select as jest.Mock).mockReturnValueOnce(createMockQuery([]));

      await expect(
        transitionAssessmentStatus(assessmentId, 'AI_QUESTIONING')
      ).rejects.toThrow(StateAssessmentNotFoundError);
    });

    it('updateAIStatus updates only aiStatus on the assessment', async () => {
      const mockUpdated = { id: assessmentId, aiStatus: 'ANALYZING' };
      (db.update as jest.Mock).mockReturnValueOnce({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([mockUpdated]),
          }),
        }),
      });

      const result = await updateAIStatus(assessmentId, 'ANALYZING');
      expect(result).toEqual(mockUpdated);
    });

    it('updateAIStatus throws AssessmentNotFoundError when assessment does not exist', async () => {
      (db.update as jest.Mock).mockReturnValueOnce({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      await expect(updateAIStatus(assessmentId, 'ANALYZING')).rejects.toThrow(
        StateAssessmentNotFoundError
      );
    });

    it('updateAISession persists aiSessionId and optional aiStatus', async () => {
      const mockUpdated = { id: assessmentId, aiSessionId: 'sess-123', aiStatus: 'QUESTIONING' };
      (db.update as jest.Mock).mockReturnValueOnce({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([mockUpdated]),
          }),
        }),
      });

      const result = await updateAISession(assessmentId, 'sess-123', 'QUESTIONING');
      expect(result).toEqual(mockUpdated);
    });
  });

  describe('3. assessment-input.service', () => {
    it('upsertAssessmentInput normalizes inputs and defaults source to USER', async () => {
      let capturedValues: Record<string, unknown> = {};

      (db.insert as jest.Mock).mockReturnValueOnce({
        values: jest.fn().mockImplementation((vals) => {
          capturedValues = vals;
          return {
            onConflictDoUpdate: jest.fn().mockReturnValue({
              returning: jest.fn().mockResolvedValue([{ id: 'inp-1', ...vals }]),
            }),
          };
        }),
      });

      const result = await upsertAssessmentInput(assessmentId, 'expected_revenue', {
        inputType: 'NUMBER',
        valueNumber: 50000,
      });

      expect(result.id).toBe('inp-1');
      expect(capturedValues.assessmentId).toBe(assessmentId);
      expect(capturedValues.inputKey).toBe('expected_revenue');
      expect(capturedValues.valueNumber).toBe('50000');
      expect(capturedValues.source).toBe('USER');
    });

    it('getAssessmentInputs retrieves inputs by assessmentId', async () => {
      const mockInputs = [{ id: 'inp-1', assessmentId, inputKey: 'k1' }];
      (db.select as jest.Mock).mockReturnValueOnce(createMockQuery(mockInputs));

      const result = await getAssessmentInputs(assessmentId);
      expect(result).toEqual(mockInputs);
    });
  });
});
