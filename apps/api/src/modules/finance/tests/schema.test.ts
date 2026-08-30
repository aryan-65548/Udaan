import { describe, it, expect, vi } from 'vitest';
import { schemeConfigs } from '../../../db/schema/finance';
import { seedSchemes, initialSchemeConfigs } from '../../../db/seeds/schemes';

describe('Finance Schema & Seed Idempotency', () => {
  it('enforces uniqueness on schemeCode in the database schema', () => {
    // Drizzle exposes the unique property on the column definition
    expect(schemeConfigs.schemeCode.isUnique).toBe(true);
  });

  it('targets schemeCode in onConflictDoNothing during seed execution', async () => {
    // Mock Drizzle db interface
    const mockValues = vi.fn().mockReturnThis();
    const mockOnConflictDoNothing = vi.fn().mockResolvedValue(true);
    
    const mockDb = {
      insert: vi.fn().mockReturnValue({
        values: mockValues
      })
    };

    // Override the chained onConflictDoNothing inside the values mock
    mockValues.mockReturnValue({
      onConflictDoNothing: mockOnConflictDoNothing
    });

    await seedSchemes(mockDb);

    // Assert the insert was called for each config
    expect(mockDb.insert).toHaveBeenCalledTimes(initialSchemeConfigs.length);
    
    // Assert onConflictDoNothing was called with the correct target
    expect(mockOnConflictDoNothing).toHaveBeenCalledWith({
      target: schemeConfigs.schemeCode
    });
  });
});
