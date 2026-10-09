import { ProjectUserCalculation } from '../types/projectUser';

export interface CalculationInput {
  activityValue: number;
  activityUnit: string;
  emissionFactorId: string;
  emissionFactorValue: number;
  emissionFactorUnit: string;
}

export function calculateCO2e(input: CalculationInput): ProjectUserCalculation {
  if (!Number.isFinite(input.activityValue) || input.activityValue < 0) {
    throw new Error('Activity data must be a valid non-negative number.');
  }
  if (!Number.isFinite(input.emissionFactorValue) || input.emissionFactorValue < 0) {
    throw new Error('A valid emission factor is required to calculate CO₂e.');
  }

  const rawKgCO2e = input.activityValue * input.emissionFactorValue;
  return {
    calculationId: `CAL-${crypto.randomUUID()}`,
    activityValue: input.activityValue,
    activityUnit: input.activityUnit,
    emissionFactorId: input.emissionFactorId,
    emissionFactorValue: input.emissionFactorValue,
    emissionFactorUnit: input.emissionFactorUnit,
    rawKgCO2e,
    convertedTonnesCO2e: rawKgCO2e / 1000,
    formula: 'Activity Data × Emission Factor ÷ 1,000',
    calculatedAt: new Date().toISOString(),
  };
}
