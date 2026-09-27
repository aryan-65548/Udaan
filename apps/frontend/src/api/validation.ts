import { apiClient } from './client';

export type ValidationStatus = 'PENDING' | 'COMPLETED' | 'SKIPPED';

export interface ValidationTaskRecord {
  id: string;
  assessmentId: string;
  taskKey: string;
  taskText: string;
  status: ValidationStatus;
  notes: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateValidationTaskPayload {
  status?: ValidationStatus;
  notes?: string | null;
}

export async function getValidationTasks(assessmentId: string): Promise<ValidationTaskRecord[]> {
  return apiClient<ValidationTaskRecord[]>(`/assessments/${assessmentId}/validation`);
}

export async function updateValidationTask(
  assessmentId: string,
  taskId: string,
  payload: UpdateValidationTaskPayload
): Promise<ValidationTaskRecord> {
  return apiClient<ValidationTaskRecord>(`/assessments/${assessmentId}/validation/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
