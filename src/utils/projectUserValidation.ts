import { z } from 'zod';
import { isToday } from './dateUtils';

export const projectUserSubmissionSchema = z.object({
  dataEntryDate: z.string().refine(isToday, 'Data entry date must be today.'),
  parameterId: z.string().min(1, 'Select an assigned parameter.'),
  activityValue: z.number({ error: 'Enter an activity value.' }).finite().positive('Activity value must be greater than zero.'),
  activityUnit: z.string().min(1, 'The parameter unit is missing.'),
  remarks: z.string().max(500, 'Remarks must be 500 characters or fewer.'),
  evidenceIds: z.array(z.string()),
  requiresEvidence: z.boolean(),
  calculationRequired: z.boolean(),
  calculationAvailable: z.boolean(),
}).superRefine((value, context) => {
  if (value.requiresEvidence && value.evidenceIds.length === 0) {
    context.addIssue({
      code: 'custom',
      path: ['evidenceIds'],
      message: 'Upload at least one supporting evidence file.',
    });
  }
  if (value.calculationRequired && !value.calculationAvailable) {
    context.addIssue({
      code: 'custom',
      path: ['calculationAvailable'],
      message: 'CO₂e cannot be calculated because the required emission factor is unavailable.',
    });
  }
});

export type ProjectUserSubmissionInput = z.infer<typeof projectUserSubmissionSchema>;
