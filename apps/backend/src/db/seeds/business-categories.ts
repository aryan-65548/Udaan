import { businessCategories } from '../schema/business-categories';

export const initialBusinessCategories = [
  {
    id: 'b1000000-0000-0000-0000-000000000001',
    code: 'DAIRY_FARMING',
    name: 'Dairy Farming',
    description: 'Milk production, cattle rearing, and dairy products distribution',
    parentId: null,
    isActive: true,
    sortOrder: 1,
  },
  {
    id: 'b1000000-0000-0000-0000-000000000002',
    code: 'GROCERY_RETAIL',
    name: 'Grocery Retail (Kirana Store)',
    description: 'Daily provisions, packaged goods, and grocery retail outlet',
    parentId: null,
    isActive: true,
    sortOrder: 2,
  },
  {
    id: 'b1000000-0000-0000-0000-000000000003',
    code: 'TAILORING',
    name: 'Tailoring & Garment Alteration',
    description: 'Custom stitching, tailoring, and garment repair services',
    parentId: null,
    isActive: true,
    sortOrder: 3,
  },
  {
    id: 'b1000000-0000-0000-0000-000000000004',
    code: 'FOOD_PROCESSING',
    name: 'Small-scale Food Processing',
    description: 'Pickle, papad, flour milling, spices packaging, and snack making',
    parentId: null,
    isActive: true,
    sortOrder: 4,
  },
  {
    id: 'b1000000-0000-0000-0000-000000000005',
    code: 'MOBILE_REPAIR',
    name: 'Mobile & Electronics Repair',
    description: 'Smartphone repair, recharge, accessories, and small electronic servicing',
    parentId: null,
    isActive: true,
    sortOrder: 5,
  },
  {
    id: 'b1000000-0000-0000-0000-000000000006',
    code: 'TRANSPORT',
    name: 'Rural Transport & Logistics',
    description: 'Passenger auto, e-rickshaw, cargo three-wheeler transport services',
    parentId: null,
    isActive: true,
    sortOrder: 6,
  },
  {
    id: 'b1000000-0000-0000-0000-000000000007',
    code: 'SMALL_MANUFACTURING',
    name: 'Small Manufacturing & Workshop',
    description: 'Welding, pottery, bamboo crafts, carpentry, and fabrication workshops',
    parentId: null,
    isActive: true,
    sortOrder: 7,
  },
  {
    id: 'b1000000-0000-0000-0000-000000000008',
    code: 'AGRICULTURE_SERVICE',
    name: 'Agriculture Equipment & Input Services',
    description: 'Farm tool rentals, seeds, organic fertilizers, and sprayer services',
    parentId: null,
    isActive: true,
    sortOrder: 8,
  },
];

export async function seedBusinessCategories(db: any) {
  for (const category of initialBusinessCategories) {
    await db.insert(businessCategories).values(category).onConflictDoNothing({
      target: businessCategories.code,
    });
  }
}
