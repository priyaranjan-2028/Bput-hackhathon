// ============================================================
// MEIL ESG & BRSR Reporting Platform — Mock Data
// ============================================================

import {
  User, UserRole, Subsidiary, BusinessUnit, Project, ESGParameter,
  EmissionFactor, ParameterSubmission, Evidence, ConsolidationRecord,
  AuditEvent, Notification, VerificationRecord, SubmissionStatus,
  Scope, VerificationAction, BRSRReport
} from '../types';

// ---------- Organization ----------
export const MEIL_ORG = {
  id: 'MEIL',
  name: 'Megha Engineering & Infrastructures Limited',
  code: 'MEIL',
};

// ---------- Subsidiaries ----------
export const subsidiaries: Subsidiary[] = [
  {
    id: 'SUB001',
    name: 'MEIL Infrastructure',
    code: 'SUB001',
    meilId: 'MEIL',
    supervisorId: 'USR-SUB-001',
    businessUnitIds: ['BU001', 'BU002'],
  },
  {
    id: 'SUB002',
    name: 'MEIL Energy Solutions',
    code: 'SUB002',
    meilId: 'MEIL',
    supervisorId: 'USR-SUB-002',
    businessUnitIds: ['BU003', 'BU004'],
  },
  {
    id: 'SUB003',
    name: 'MEIL Water Resources',
    code: 'SUB003',
    meilId: 'MEIL',
    supervisorId: 'USR-SUB-003',
    businessUnitIds: ['BU005'],
  },
];

// ---------- Business Units ----------
export const businessUnits: BusinessUnit[] = [
  {
    id: 'BU001',
    name: 'Transportation',
    code: 'BU001',
    subsidiaryId: 'SUB001',
    supervisorId: 'USR-BU-001',
    projectIds: ['PRJ001', 'PRJ002', 'PRJ003'],
  },
  {
    id: 'BU002',
    name: 'Metro Rail Division',
    code: 'BU002',
    subsidiaryId: 'SUB001',
    supervisorId: 'USR-BU-002',
    projectIds: ['PRJ004', 'PRJ005'],
  },
  {
    id: 'BU003',
    name: 'Solar Energy Division',
    code: 'BU003',
    subsidiaryId: 'SUB002',
    supervisorId: 'USR-BU-003',
    projectIds: ['PRJ006', 'PRJ007'],
  },
  {
    id: 'BU004',
    name: 'Thermal Power Division',
    code: 'BU004',
    subsidiaryId: 'SUB002',
    supervisorId: 'USR-BU-004',
    projectIds: ['PRJ008'],
  },
  {
    id: 'BU005',
    name: 'Irrigation Division',
    code: 'BU005',
    subsidiaryId: 'SUB003',
    supervisorId: 'USR-BU-005',
    projectIds: ['PRJ009', 'PRJ010'],
  },
];

// ---------- Projects ----------
export const projects: Project[] = [
  { id: 'PRJ001', name: 'Zojila Tunnel Project', code: 'PRJ001', businessUnitId: 'BU001', subsidiaryId: 'SUB001', supervisorId: 'USR-PS-001', userIds: ['USR001', 'USR002', 'USR003'], status: SubmissionStatus.APPROVED, reportingPeriod: 'FY 2025-26', location: 'Sonamarg - Kargil Road, J&K / Ladakh' },
  { id: 'PRJ002', name: 'Bangalore-Chennai Expressway', code: 'PRJ002', businessUnitId: 'BU001', subsidiaryId: 'SUB001', supervisorId: 'USR-PS-002', userIds: ['USR006', 'USR007', 'USR008', 'USR009', 'USR010'], status: SubmissionStatus.SUBMITTED, reportingPeriod: 'FY 2025-26' },
  { id: 'PRJ003', name: 'Mumbai Ring Road', code: 'PRJ003', businessUnitId: 'BU001', subsidiaryId: 'SUB001', supervisorId: 'USR-PS-003', userIds: ['USR011', 'USR012', 'USR013', 'USR014', 'USR015'], status: SubmissionStatus.UNDER_REVIEW, reportingPeriod: 'FY 2025-26' },
  { id: 'PRJ004', name: 'Hyderabad Metro Phase-II', code: 'PRJ004', businessUnitId: 'BU002', subsidiaryId: 'SUB001', supervisorId: 'USR-PS-004', userIds: ['USR016', 'USR017', 'USR018', 'USR019', 'USR020'], status: SubmissionStatus.APPROVED, reportingPeriod: 'FY 2025-26' },
  { id: 'PRJ005', name: 'Delhi Metro Extension', code: 'PRJ005', businessUnitId: 'BU002', subsidiaryId: 'SUB001', supervisorId: 'USR-PS-005', userIds: ['USR021', 'USR022', 'USR023', 'USR024', 'USR025'], status: SubmissionStatus.DRAFT, reportingPeriod: 'FY 2025-26' },
  { id: 'PRJ006', name: 'Rajasthan Solar Park 500MW', code: 'PRJ006', businessUnitId: 'BU003', subsidiaryId: 'SUB002', supervisorId: 'USR-PS-006', userIds: ['USR026', 'USR027', 'USR028', 'USR029', 'USR030'], status: SubmissionStatus.APPROVED, reportingPeriod: 'FY 2025-26' },
  { id: 'PRJ007', name: 'Gujarat Wind-Solar Hybrid', code: 'PRJ007', businessUnitId: 'BU003', subsidiaryId: 'SUB002', supervisorId: 'USR-PS-007', userIds: ['USR031', 'USR032', 'USR033', 'USR034', 'USR035'], status: SubmissionStatus.SUBMITTED, reportingPeriod: 'FY 2025-26' },
  { id: 'PRJ008', name: 'AP Thermal Modernization', code: 'PRJ008', businessUnitId: 'BU004', subsidiaryId: 'SUB002', supervisorId: 'USR-PS-008', userIds: ['USR036', 'USR037', 'USR038', 'USR039', 'USR040'], status: SubmissionStatus.CORRECTION_REQUIRED, reportingPeriod: 'FY 2025-26' },
  { id: 'PRJ009', name: 'Kaleshwaram Lift Irrigation', code: 'PRJ009', businessUnitId: 'BU005', subsidiaryId: 'SUB003', supervisorId: 'USR-PS-009', userIds: ['USR041', 'USR042', 'USR043', 'USR044', 'USR045'], status: SubmissionStatus.APPROVED, reportingPeriod: 'FY 2025-26' },
  { id: 'PRJ010', name: 'Polavaram Dam Construction', code: 'PRJ010', businessUnitId: 'BU005', subsidiaryId: 'SUB003', supervisorId: 'USR-PS-010', userIds: ['USR046', 'USR047', 'USR048', 'USR049', 'USR050'], status: SubmissionStatus.SUBMITTED, reportingPeriod: 'FY 2025-26' },
];

// ---------- Users (Demo Accounts) ----------
export const users: User[] = [
  // Demo login accounts
  { id: 'USR-PS-001', name: 'Rajesh Sharma', email: 'projectsup@demo.com', role: UserRole.PROJECT_SUPERVISOR, password: 'demo123', assignedProjectIds: ['PRJ001'], businessUnitId: 'BU001', subsidiaryId: 'SUB001' },
  { id: 'USR-PS-002', name: 'Meera Nair', email: 'projectsup2@demo.com', role: UserRole.PROJECT_SUPERVISOR, password: 'demo123', assignedProjectIds: ['PRJ002'], businessUnitId: 'BU001', subsidiaryId: 'SUB001' },
  { id: 'USR-BU-001', name: 'Arun Patel', email: 'busupervisor@demo.com', role: UserRole.BU_SUPERVISOR, password: 'demo123', businessUnitId: 'BU001', subsidiaryId: 'SUB001', assignedBUIds: ['BU001'] },
  { id: 'USR-SUB-001', name: 'Vikram Singh', email: 'subsupervisor@demo.com', role: UserRole.SUBSIDIARY_SUPERVISOR, password: 'demo123', subsidiaryId: 'SUB001', assignedSubsidiaryIds: ['SUB001'] },
  { id: 'USR-ADMIN', name: 'Dr. Srinivas Reddy', email: 'admin@meil-demo.com', role: UserRole.MEIL_ADMIN, password: 'demo123' },
  // Three project users per BU001 project for Project User workflow demos
  { id: 'USR001', name: 'Anita Desai', email: 'anita@demo.com', role: UserRole.PROJECT_USER, password: 'demo123', projectId: 'PRJ001', businessUnitId: 'BU001', subsidiaryId: 'SUB001' },
  { id: 'USR002', name: 'Mohan Rao', email: 'mohan@demo.com', role: UserRole.PROJECT_USER, password: 'demo123', projectId: 'PRJ001', businessUnitId: 'BU001', subsidiaryId: 'SUB001' },
  { id: 'USR003', name: 'Deepa Nair', email: 'deepa@demo.com', role: UserRole.PROJECT_USER, password: 'demo123', projectId: 'PRJ001', businessUnitId: 'BU001', subsidiaryId: 'SUB001' },
  { id: 'USR006', name: 'Kavita Rao', email: 'kavita@demo.com', role: UserRole.PROJECT_USER, password: 'demo123', projectId: 'PRJ002', businessUnitId: 'BU001', subsidiaryId: 'SUB001' },
  { id: 'USR007', name: 'Arjun Menon', email: 'arjun@demo.com', role: UserRole.PROJECT_USER, password: 'demo123', projectId: 'PRJ002', businessUnitId: 'BU001', subsidiaryId: 'SUB001' },
  { id: 'USR008', name: 'Farah Khan', email: 'farah@demo.com', role: UserRole.PROJECT_USER, password: 'demo123', projectId: 'PRJ002', businessUnitId: 'BU001', subsidiaryId: 'SUB001' },
];

// ---------- ESG Parameters ----------
export const esgParameters: ESGParameter[] = [
  // Scope 1
  { parameterId: 'S1-DIESEL', name: 'Diesel Consumption', code: 'S1-DIESEL', scope: Scope.SCOPE_1, category: 'Mobile Combustion', unit: 'Litres', description: 'Total diesel fuel consumed in mobile and stationary equipment', requiresEvidence: true, emissionFactorId: 'EF-S1-DIESEL' },
  { parameterId: 'S1-PETROL', name: 'Petrol Consumption', code: 'S1-PETROL', scope: Scope.SCOPE_1, category: 'Mobile Combustion', unit: 'Litres', description: 'Total petrol consumed in vehicles and equipment', requiresEvidence: true, emissionFactorId: 'EF-S1-PETROL' },
  { parameterId: 'S1-GENSET', name: 'Fuel for Generators', code: 'S1-GENSET', scope: Scope.SCOPE_1, category: 'Stationary Combustion', unit: 'Litres', description: 'Diesel and auxiliary fuels consumed in stationary generator sets at project sites', requiresEvidence: true, emissionFactorId: 'EF-S1-GENSET' },
  { parameterId: 'S1-NATURAL-GAS', name: 'Natural Gas Consumption', code: 'S1-NATURAL-GAS', scope: Scope.SCOPE_1, category: 'Stationary Combustion', unit: 'SCM', description: 'Natural gas used in operations', requiresEvidence: true, emissionFactorId: 'EF-S1-NATGAS' },
  { parameterId: 'S1-COAL', name: 'Coal Consumption', code: 'S1-COAL', scope: Scope.SCOPE_1, category: 'Stationary Combustion', unit: 'Tonnes', description: 'Coal consumed for heating and power generation', requiresEvidence: true, emissionFactorId: 'EF-S1-COAL' },
  { parameterId: 'S1-LPG', name: 'LPG Consumption', code: 'S1-LPG', scope: Scope.SCOPE_1, category: 'Stationary Combustion', unit: 'Kg', description: 'LPG used in operations and canteens', requiresEvidence: true, emissionFactorId: 'EF-S1-LPG' },
  { parameterId: 'S1-FUGITIVE', name: 'Fugitive Emissions (Refrigerants)', code: 'S1-FUGITIVE', scope: Scope.SCOPE_1, category: 'Fugitive Emissions', unit: 'Kg', description: 'Refrigerant leakages from HVAC systems', requiresEvidence: true, emissionFactorId: 'EF-S1-FUGITIVE' },
  { parameterId: 'S1-PROCESS', name: 'Process Emissions', code: 'S1-PROCESS', scope: Scope.SCOPE_1, category: 'Process Emissions', unit: 'Tonnes', description: 'Direct emissions from industrial processes (cement, etc.)', requiresEvidence: true, emissionFactorId: 'EF-S1-PROCESS' },
  // Scope 2
  { parameterId: 'S2-ELECTRICITY', name: 'Purchased Electricity', code: 'S2-ELECTRICITY', scope: Scope.SCOPE_2, category: 'Purchased Energy', unit: 'kWh', description: 'Grid electricity purchased for operations', requiresEvidence: true, emissionFactorId: 'EF-S2-ELEC' },
  { parameterId: 'S2-STEAM', name: 'Purchased Steam', code: 'S2-STEAM', scope: Scope.SCOPE_2, category: 'Purchased Energy', unit: 'GJ', description: 'Steam purchased from external sources', requiresEvidence: true, emissionFactorId: 'EF-S2-STEAM' },
  { parameterId: 'S2-HEATING', name: 'Purchased Heating', code: 'S2-HEATING', scope: Scope.SCOPE_2, category: 'Purchased Energy', unit: 'GJ', description: 'Heating energy purchased from district/external supply', requiresEvidence: true, emissionFactorId: 'EF-S2-HEATING' },
  // Scope 3
  { parameterId: 'S3-PURCHASED-GOODS', name: 'Purchased Goods & Services', code: 'S3-PURCHASED-GOODS', scope: Scope.SCOPE_3, category: 'Cat 1: Purchased Goods', unit: 'INR Lakhs', description: 'Emissions from purchased goods and services', requiresEvidence: true, emissionFactorId: 'EF-S3-GOODS' },
  { parameterId: 'S3-CAPITAL-GOODS', name: 'Capital Goods', code: 'S3-CAPITAL-GOODS', scope: Scope.SCOPE_3, category: 'Cat 2: Capital Goods', unit: 'INR Lakhs', description: 'Emissions from capital goods procurement', requiresEvidence: true, emissionFactorId: 'EF-S3-CAPITAL' },
  { parameterId: 'S3-FUEL-ENERGY', name: 'Fuel & Energy Related Activities', code: 'S3-FUEL-ENERGY', scope: Scope.SCOPE_3, category: 'Cat 3: Fuel & Energy', unit: 'GJ', description: 'Upstream emissions of purchased fuels', requiresEvidence: true, emissionFactorId: 'EF-S3-FUEL' },
  { parameterId: 'S3-UPSTREAM-TRANSPORT', name: 'Upstream Transportation & Distribution', code: 'S3-UPSTREAM-TRANSPORT', scope: Scope.SCOPE_3, category: 'Cat 4: Transport', unit: 'Tonne-km', description: 'Transportation of purchased materials', requiresEvidence: true, emissionFactorId: 'EF-S3-TRANSPORT' },
  { parameterId: 'S3-WASTE', name: 'Waste Generated in Operations', code: 'S3-WASTE', scope: Scope.SCOPE_3, category: 'Cat 5: Waste', unit: 'Tonnes', description: 'Emissions from waste disposal and treatment', requiresEvidence: true, emissionFactorId: 'EF-S3-WASTE' },
  { parameterId: 'S3-BUSINESS-TRAVEL', name: 'Business Travel', code: 'S3-BUSINESS-TRAVEL', scope: Scope.SCOPE_3, category: 'Cat 6: Business Travel', unit: 'Passenger-km', description: 'Emissions from employee business travel', requiresEvidence: true, emissionFactorId: 'EF-S3-TRAVEL' },
  { parameterId: 'S3-EMPLOYEE-COMMUTE', name: 'Employee Commuting', code: 'S3-EMPLOYEE-COMMUTE', scope: Scope.SCOPE_3, category: 'Cat 7: Commuting', unit: 'Passenger-km', description: 'Emissions from daily employee commuting', requiresEvidence: true, emissionFactorId: 'EF-S3-COMMUTE' },
  // Section C - Other ESG Indicators
  { parameterId: 'SC-WATER', name: 'Water Consumption', code: 'SC-WATER', scope: Scope.SECTION_C, category: 'Principle 6: Environment', unit: 'KL', description: 'Total water withdrawn from all sources', requiresEvidence: true },
  { parameterId: 'SC-WASTE-GENERATED', name: 'Total Waste Generated', code: 'SC-WASTE-GENERATED', scope: Scope.SECTION_C, category: 'Principle 6: Environment', unit: 'MT', description: 'Total hazardous and non-hazardous waste generated', requiresEvidence: true },
  { parameterId: 'SC-WASTE-RECYCLED', name: 'Waste Recycled / Reused', code: 'SC-WASTE-RECYCLED', scope: Scope.SECTION_C, category: 'Principle 6: Environment', unit: 'MT', description: 'Total waste diverted from disposal via recycling', requiresEvidence: true },
  { parameterId: 'SC-ENERGY-INTENSITY', name: 'Energy Intensity', code: 'SC-ENERGY-INTENSITY', scope: Scope.SECTION_C, category: 'Principle 6: Environment', unit: 'GJ/Cr Revenue', description: 'Energy consumed per unit of revenue', requiresEvidence: true },
  { parameterId: 'SC-SAFETY-INCIDENTS', name: 'Safety Incidents (LTIFR)', code: 'SC-SAFETY-INCIDENTS', scope: Scope.SECTION_C, category: 'Principle 3: Employee Wellbeing', unit: 'Per Million Hours', description: 'Lost Time Injury Frequency Rate', requiresEvidence: true },
  { parameterId: 'SC-TRAINING-HOURS', name: 'Employee Training Hours', code: 'SC-TRAINING-HOURS', scope: Scope.SECTION_C, category: 'Principle 3: Employee Wellbeing', unit: 'Hours', description: 'Average training hours per employee', requiresEvidence: true },
  { parameterId: 'SC-CSR-SPEND', name: 'CSR Expenditure', code: 'SC-CSR-SPEND', scope: Scope.SECTION_C, category: 'Principle 8: Inclusive Growth', unit: 'INR Lakhs', description: 'Total CSR spending during reporting period', requiresEvidence: true },
  { parameterId: 'SC-DIVERSITY', name: 'Workforce Diversity (Women %)', code: 'SC-DIVERSITY', scope: Scope.SECTION_C, category: 'Principle 5: Human Rights', unit: '%', description: 'Percentage of women in total workforce', requiresEvidence: true },
];

// ---------- Emission Factors (DEMO) ----------
export const emissionFactors: EmissionFactor[] = [
  { factorId: 'EF-S1-DIESEL', parameterId: 'S1-DIESEL', factorValue: 2.68, unit: 'kgCO2e/Litre', scope: Scope.SCOPE_1, source: 'IPCC 2006 Guidelines', sourceVersion: '2006 Rev.', reportingYear: 'FY 2025-26', geography: 'India', effectiveFrom: '2025-04-01', effectiveTo: '2026-03-31', methodology: 'Tier 1 Default', status: 'DEMO', isDemo: true },
  { factorId: 'EF-S1-PETROL', parameterId: 'S1-PETROL', factorValue: 2.31, unit: 'kgCO2e/Litre', scope: Scope.SCOPE_1, source: 'IPCC 2006 Guidelines', sourceVersion: '2006 Rev.', reportingYear: 'FY 2025-26', geography: 'India', effectiveFrom: '2025-04-01', effectiveTo: '2026-03-31', methodology: 'Tier 1 Default', status: 'DEMO', isDemo: true },
  { factorId: 'EF-S1-GENSET', parameterId: 'S1-GENSET', factorValue: 2.68, unit: 'kgCO2e/Litre', scope: Scope.SCOPE_1, source: 'IPCC 2006 Guidelines', sourceVersion: '2006 Rev.', reportingYear: 'FY 2025-26', geography: 'India', effectiveFrom: '2025-04-01', effectiveTo: '2026-03-31', methodology: 'Tier 1 Default', status: 'DEMO', isDemo: true },
  { factorId: 'EF-S1-NATGAS', parameterId: 'S1-NATURAL-GAS', factorValue: 2.04, unit: 'kgCO2e/SCM', scope: Scope.SCOPE_1, source: 'IPCC 2006 Guidelines', sourceVersion: '2006 Rev.', reportingYear: 'FY 2025-26', geography: 'India', effectiveFrom: '2025-04-01', effectiveTo: '2026-03-31', methodology: 'Tier 1 Default', status: 'DEMO', isDemo: true },
  { factorId: 'EF-S1-COAL', parameterId: 'S1-COAL', factorValue: 2450.0, unit: 'kgCO2e/Tonne', scope: Scope.SCOPE_1, source: 'IPCC 2006 Guidelines', sourceVersion: '2006 Rev.', reportingYear: 'FY 2025-26', geography: 'India', effectiveFrom: '2025-04-01', effectiveTo: '2026-03-31', methodology: 'Tier 1 Default', status: 'DEMO', isDemo: true },
  { factorId: 'EF-S1-LPG', parameterId: 'S1-LPG', factorValue: 2.98, unit: 'kgCO2e/Kg', scope: Scope.SCOPE_1, source: 'IPCC 2006 Guidelines', sourceVersion: '2006 Rev.', reportingYear: 'FY 2025-26', geography: 'India', effectiveFrom: '2025-04-01', effectiveTo: '2026-03-31', methodology: 'Tier 1 Default', status: 'DEMO', isDemo: true },
  { factorId: 'EF-S1-FUGITIVE', parameterId: 'S1-FUGITIVE', factorValue: 1810.0, unit: 'kgCO2e/Kg', scope: Scope.SCOPE_1, source: 'IPCC AR5', sourceVersion: 'AR5 GWP', reportingYear: 'FY 2025-26', geography: 'Global', effectiveFrom: '2025-04-01', effectiveTo: '2026-03-31', methodology: 'R-410A GWP', status: 'DEMO', isDemo: true },
  { factorId: 'EF-S1-PROCESS', parameterId: 'S1-PROCESS', factorValue: 525.0, unit: 'kgCO2e/Tonne', scope: Scope.SCOPE_1, source: 'IPCC 2006 Guidelines', sourceVersion: '2006', reportingYear: 'FY 2025-26', geography: 'India', effectiveFrom: '2025-04-01', effectiveTo: '2026-03-31', methodology: 'Clinker-based', status: 'DEMO', isDemo: true },
  { factorId: 'EF-S2-ELEC', parameterId: 'S2-ELECTRICITY', factorValue: 0.82, unit: 'kgCO2e/kWh', scope: Scope.SCOPE_2, source: 'CEA CO2 Baseline Database', sourceVersion: 'v18.0', reportingYear: 'FY 2025-26', geography: 'India Grid Average', effectiveFrom: '2025-04-01', effectiveTo: '2026-03-31', methodology: 'Location-Based', status: 'DEMO', isDemo: true },
  { factorId: 'EF-S2-STEAM', parameterId: 'S2-STEAM', factorValue: 66.4, unit: 'kgCO2e/GJ', scope: Scope.SCOPE_2, source: 'IPCC 2006', sourceVersion: '2006', reportingYear: 'FY 2025-26', geography: 'India', effectiveFrom: '2025-04-01', effectiveTo: '2026-03-31', methodology: 'Default', status: 'DEMO', isDemo: true },
  { factorId: 'EF-S2-HEATING', parameterId: 'S2-HEATING', factorValue: 56.1, unit: 'kgCO2e/GJ', scope: Scope.SCOPE_2, source: 'IPCC 2006', sourceVersion: '2006', reportingYear: 'FY 2025-26', geography: 'India', effectiveFrom: '2025-04-01', effectiveTo: '2026-03-31', methodology: 'Default', status: 'DEMO', isDemo: true },
  { factorId: 'EF-S3-GOODS', parameterId: 'S3-PURCHASED-GOODS', factorValue: 0.43, unit: 'tCO2e/INR Lakh', scope: Scope.SCOPE_3, source: 'India Supply Chain EF', sourceVersion: '2024', reportingYear: 'FY 2025-26', geography: 'India', effectiveFrom: '2025-04-01', effectiveTo: '2026-03-31', methodology: 'Spend-based', status: 'DEMO', isDemo: true },
  { factorId: 'EF-S3-CAPITAL', parameterId: 'S3-CAPITAL-GOODS', factorValue: 0.51, unit: 'tCO2e/INR Lakh', scope: Scope.SCOPE_3, source: 'India Supply Chain EF', sourceVersion: '2024', reportingYear: 'FY 2025-26', geography: 'India', effectiveFrom: '2025-04-01', effectiveTo: '2026-03-31', methodology: 'Spend-based', status: 'DEMO', isDemo: true },
  { factorId: 'EF-S3-FUEL', parameterId: 'S3-FUEL-ENERGY', factorValue: 12.5, unit: 'kgCO2e/GJ', scope: Scope.SCOPE_3, source: 'DEFRA 2024', sourceVersion: '2024', reportingYear: 'FY 2025-26', geography: 'India', effectiveFrom: '2025-04-01', effectiveTo: '2026-03-31', methodology: 'WTT Factors', status: 'DEMO', isDemo: true },
  { factorId: 'EF-S3-TRANSPORT', parameterId: 'S3-UPSTREAM-TRANSPORT', factorValue: 0.11, unit: 'kgCO2e/Tonne-km', scope: Scope.SCOPE_3, source: 'DEFRA 2024', sourceVersion: '2024', reportingYear: 'FY 2025-26', geography: 'India', effectiveFrom: '2025-04-01', effectiveTo: '2026-03-31', methodology: 'HGV Average', status: 'DEMO', isDemo: true },
  { factorId: 'EF-S3-WASTE', parameterId: 'S3-WASTE', factorValue: 580.0, unit: 'kgCO2e/Tonne', scope: Scope.SCOPE_3, source: 'DEFRA 2024', sourceVersion: '2024', reportingYear: 'FY 2025-26', geography: 'India', effectiveFrom: '2025-04-01', effectiveTo: '2026-03-31', methodology: 'Mixed Waste', status: 'DEMO', isDemo: true },
  { factorId: 'EF-S3-TRAVEL', parameterId: 'S3-BUSINESS-TRAVEL', factorValue: 0.18, unit: 'kgCO2e/Passenger-km', scope: Scope.SCOPE_3, source: 'DEFRA 2024', sourceVersion: '2024', reportingYear: 'FY 2025-26', geography: 'India', effectiveFrom: '2025-04-01', effectiveTo: '2026-03-31', methodology: 'Average flight', status: 'DEMO', isDemo: true },
  { factorId: 'EF-S3-COMMUTE', parameterId: 'S3-EMPLOYEE-COMMUTE', factorValue: 0.14, unit: 'kgCO2e/Passenger-km', scope: Scope.SCOPE_3, source: 'DEFRA 2024', sourceVersion: '2024', reportingYear: 'FY 2025-26', geography: 'India', effectiveFrom: '2025-04-01', effectiveTo: '2026-03-31', methodology: 'Average car', status: 'DEMO', isDemo: true },
];

// ---------- Sample Submissions ----------
export const parameterSubmissions: ParameterSubmission[] = [
  { submissionId: 'DEMO-PRJ001-001', parameterId: 'S1-DIESEL', projectId: 'PRJ001', businessUnitId: 'BU001', subsidiaryId: 'SUB001', userId: 'USR001', activityData: 18450, unit: 'Litres', emissionFactorId: 'EF-S1-DIESEL', emissionFactorValue: 2.68, calculatedCO2e: 49.45, co2eUnit: 'tCO2e', reportingPeriod: 'FY 2025-26', source: 'Diesel issue register', notes: 'October generator and excavator fuel', status: SubmissionStatus.SUBMITTED, evidenceIds: ['DEMO-EVD-001'], createdAt: '2026-10-08T08:30:00Z', updatedAt: '2026-10-08T08:30:00Z', submittedAt: '2026-10-08T09:00:00Z' },
  { submissionId: 'DEMO-PRJ001-002', parameterId: 'S2-ELECTRICITY', projectId: 'PRJ001', businessUnitId: 'BU001', subsidiaryId: 'SUB001', userId: 'USR002', activityData: 93200, unit: 'kWh', emissionFactorId: 'EF-S2-ELEC', emissionFactorValue: 0.82, calculatedCO2e: 76.42, co2eUnit: 'tCO2e', reportingPeriod: 'FY 2025-26', source: 'Site electricity invoices', notes: 'Portal and camp meter readings', status: SubmissionStatus.UNDER_REVIEW, evidenceIds: ['DEMO-EVD-002'], createdAt: '2026-10-08T09:10:00Z', updatedAt: '2026-10-08T09:10:00Z', submittedAt: '2026-10-08T09:25:00Z' },
  { submissionId: 'DEMO-PRJ001-003', parameterId: 'SC-WATER', projectId: 'PRJ001', businessUnitId: 'BU001', subsidiaryId: 'SUB001', userId: 'USR003', activityData: 1260, unit: 'KL', reportingPeriod: 'FY 2025-26', source: 'Borewell meter log', notes: 'Monthly site water abstraction', status: SubmissionStatus.SUBMITTED, evidenceIds: ['DEMO-EVD-003'], createdAt: '2026-10-08T10:00:00Z', updatedAt: '2026-10-08T10:00:00Z', submittedAt: '2026-10-08T10:20:00Z' },
  { submissionId: 'DEMO-PRJ002-001', parameterId: 'S1-DIESEL', projectId: 'PRJ002', businessUnitId: 'BU001', subsidiaryId: 'SUB001', userId: 'USR006', activityData: 22100, unit: 'Litres', emissionFactorId: 'EF-S1-DIESEL', emissionFactorValue: 2.68, calculatedCO2e: 59.23, co2eUnit: 'tCO2e', reportingPeriod: 'FY 2025-26', source: 'Fleet fuel ledger', notes: 'Expressway earthworks fleet', status: SubmissionStatus.SUBMITTED, evidenceIds: ['DEMO-EVD-004'], createdAt: '2026-10-08T08:45:00Z', updatedAt: '2026-10-08T08:45:00Z', submittedAt: '2026-10-08T09:15:00Z' },
  { submissionId: 'DEMO-PRJ002-002', parameterId: 'S2-ELECTRICITY', projectId: 'PRJ002', businessUnitId: 'BU001', subsidiaryId: 'SUB001', userId: 'USR007', activityData: 118500, unit: 'kWh', emissionFactorId: 'EF-S2-ELEC', emissionFactorValue: 0.82, calculatedCO2e: 97.17, co2eUnit: 'tCO2e', reportingPeriod: 'FY 2025-26', source: 'Temporary power bills', notes: 'Batching plant and site offices', status: SubmissionStatus.CORRECTION_REQUIRED, evidenceIds: ['DEMO-EVD-005'], createdAt: '2026-10-07T13:00:00Z', updatedAt: '2026-10-08T11:30:00Z', submittedAt: '2026-10-07T13:30:00Z', supervisorNotes: 'Please include the missing meter page.' },
  { submissionId: 'DEMO-PRJ002-003', parameterId: 'SC-WASTE-GENERATED', projectId: 'PRJ002', businessUnitId: 'BU001', subsidiaryId: 'SUB001', userId: 'USR008', activityData: 86, unit: 'MT', reportingPeriod: 'FY 2025-26', source: 'Waste transfer notes', notes: 'Construction and packaging waste', status: SubmissionStatus.SUBMITTED, evidenceIds: ['DEMO-EVD-006'], createdAt: '2026-10-08T10:35:00Z', updatedAt: '2026-10-08T10:35:00Z', submittedAt: '2026-10-08T10:50:00Z' },
  { submissionId: 'SUB-007', parameterId: 'S1-COAL', projectId: 'PRJ001', businessUnitId: 'BU001', subsidiaryId: 'SUB001', userId: 'USR001', activityData: 180, unit: 'Tonnes', emissionFactorId: 'EF-S1-COAL', emissionFactorValue: 2450, calculatedCO2e: 441.00, co2eUnit: 'tCO2e', reportingPeriod: 'FY 2025-26', source: 'Coal purchase records', notes: 'Coal for batching plant', status: SubmissionStatus.APPROVED, evidenceIds: ['EVD-000009'], createdAt: '2026-07-20T08:00:00Z', updatedAt: '2026-08-25T10:00:00Z', submittedAt: '2026-07-20T09:00:00Z' },
  { submissionId: 'SUB-008', parameterId: 'S2-ELECTRICITY', projectId: 'PRJ004', businessUnitId: 'BU002', subsidiaryId: 'SUB001', userId: 'USR016', activityData: 920000, unit: 'kWh', emissionFactorId: 'EF-S2-ELEC', emissionFactorValue: 0.82, calculatedCO2e: 754.40, co2eUnit: 'tCO2e', reportingPeriod: 'FY 2025-26', source: 'Electricity bills', notes: 'Metro construction site electricity', status: SubmissionStatus.APPROVED, evidenceIds: ['EVD-000011'], createdAt: '2026-07-25T08:00:00Z', updatedAt: '2026-08-30T14:00:00Z', submittedAt: '2026-07-25T09:00:00Z' },
];

// ---------- Evidence Records ----------
export const evidenceRecords: Evidence[] = [
  { evidenceId: 'DEMO-EVD-001', originalFilename: 'zojila_diesel_register_oct.pdf', systemFilename: 'MEIL_SUB001_BU001_PRJ001_USR001_S1-DIESEL_20261008_083000_01.pdf', fileExtension: 'pdf', fileType: 'application/pdf', fileSize: 1264000, meilId: 'MEIL', subsidiaryId: 'SUB001', businessUnitId: 'BU001', projectId: 'PRJ001', userId: 'USR001', parameterId: 'S1-DIESEL', submissionId: 'DEMO-PRJ001-001', uploadedBy: 'USR001', uploadedAt: '2026-10-08T08:30:00Z', verificationStatus: SubmissionStatus.SUBMITTED },
  { evidenceId: 'DEMO-EVD-002', originalFilename: 'zojila_power_bill_oct.pdf', systemFilename: 'MEIL_SUB001_BU001_PRJ001_USR002_S2-ELECTRICITY_20261008_091000_01.pdf', fileExtension: 'pdf', fileType: 'application/pdf', fileSize: 1980000, meilId: 'MEIL', subsidiaryId: 'SUB001', businessUnitId: 'BU001', projectId: 'PRJ001', userId: 'USR002', parameterId: 'S2-ELECTRICITY', submissionId: 'DEMO-PRJ001-002', uploadedBy: 'USR002', uploadedAt: '2026-10-08T09:10:00Z', verificationStatus: SubmissionStatus.UNDER_REVIEW },
  { evidenceId: 'DEMO-EVD-003', originalFilename: 'zojila_water_meter_log.xlsx', systemFilename: 'MEIL_SUB001_BU001_PRJ001_USR003_SC-WATER_20261008_100000_01.xlsx', fileExtension: 'xlsx', fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', fileSize: 425000, meilId: 'MEIL', subsidiaryId: 'SUB001', businessUnitId: 'BU001', projectId: 'PRJ001', userId: 'USR003', parameterId: 'SC-WATER', submissionId: 'DEMO-PRJ001-003', uploadedBy: 'USR003', uploadedAt: '2026-10-08T10:00:00Z', verificationStatus: SubmissionStatus.SUBMITTED },
  { evidenceId: 'DEMO-EVD-004', originalFilename: 'expressway_fuel_ledger_oct.pdf', systemFilename: 'MEIL_SUB001_BU001_PRJ002_USR006_S1-DIESEL_20261008_084500_01.pdf', fileExtension: 'pdf', fileType: 'application/pdf', fileSize: 1532000, meilId: 'MEIL', subsidiaryId: 'SUB001', businessUnitId: 'BU001', projectId: 'PRJ002', userId: 'USR006', parameterId: 'S1-DIESEL', submissionId: 'DEMO-PRJ002-001', uploadedBy: 'USR006', uploadedAt: '2026-10-08T08:45:00Z', verificationStatus: SubmissionStatus.SUBMITTED },
  { evidenceId: 'DEMO-EVD-005', originalFilename: 'expressway_power_invoice_oct.pdf', systemFilename: 'MEIL_SUB001_BU001_PRJ002_USR007_S2-ELECTRICITY_20261007_130000_01.pdf', fileExtension: 'pdf', fileType: 'application/pdf', fileSize: 2120000, meilId: 'MEIL', subsidiaryId: 'SUB001', businessUnitId: 'BU001', projectId: 'PRJ002', userId: 'USR007', parameterId: 'S2-ELECTRICITY', submissionId: 'DEMO-PRJ002-002', uploadedBy: 'USR007', uploadedAt: '2026-10-07T13:00:00Z', verificationStatus: SubmissionStatus.CORRECTION_REQUIRED },
  { evidenceId: 'DEMO-EVD-006', originalFilename: 'expressway_waste_transfer_notes.pdf', systemFilename: 'MEIL_SUB001_BU001_PRJ002_USR008_SC-WASTE-GENERATED_20261008_103500_01.pdf', fileExtension: 'pdf', fileType: 'application/pdf', fileSize: 943000, meilId: 'MEIL', subsidiaryId: 'SUB001', businessUnitId: 'BU001', projectId: 'PRJ002', userId: 'USR008', parameterId: 'SC-WASTE-GENERATED', submissionId: 'DEMO-PRJ002-003', uploadedBy: 'USR008', uploadedAt: '2026-10-08T10:35:00Z', verificationStatus: SubmissionStatus.SUBMITTED },
  { evidenceId: 'EVD-000002', originalFilename: 'fuel_dispenser_register.pdf', systemFilename: 'MEIL_SUB001_BU001_PRJ001_USR005_S1-DIESEL_20261007_093500_02.pdf', fileExtension: 'pdf', fileType: 'application/pdf', fileSize: 1890000, meilId: 'MEIL', subsidiaryId: 'SUB001', businessUnitId: 'BU001', projectId: 'PRJ001', userId: 'USR005', parameterId: 'S1-DIESEL', submissionId: 'SUB-001', uploadedBy: 'USR005', uploadedAt: '2026-10-07T09:35:00Z', verificationStatus: SubmissionStatus.APPROVED, verificationHistory: [{ id: 'VH-002', action: VerificationAction.APPROVE, performedBy: 'USR-PS-001', performedByRole: UserRole.PROJECT_SUPERVISOR, performedAt: '2026-10-08T14:15:00Z', previousStatus: SubmissionStatus.SUBMITTED, newStatus: SubmissionStatus.APPROVED, comment: 'Fuel register corroborates the invoice.' }], sequenceNumber: 2 },
  { evidenceId: 'EVD-000003', originalFilename: 'petrol_fleet_log.pdf', systemFilename: 'MEIL_SUB001_BU001_PRJ001_USR005_S1-PETROL_20260715_100000_01.pdf', fileExtension: 'pdf', fileType: 'application/pdf', fileSize: 1245000, meilId: 'MEIL', subsidiaryId: 'SUB001', businessUnitId: 'BU001', projectId: 'PRJ001', userId: 'USR005', parameterId: 'S1-PETROL', submissionId: 'SUB-002', uploadedBy: 'USR005', uploadedAt: '2026-07-15T10:00:00Z', verificationStatus: SubmissionStatus.APPROVED, verificationHistory: [{ id: 'VH-003', action: VerificationAction.APPROVE, performedBy: 'USR-PS-001', performedByRole: UserRole.PROJECT_SUPERVISOR, performedAt: '2026-08-01T10:15:00Z', previousStatus: SubmissionStatus.SUBMITTED, newStatus: SubmissionStatus.APPROVED, comment: 'Fleet log verified.' }], sequenceNumber: 1 },
  { evidenceId: 'EVD-000004', originalFilename: 'electricity_bill_sept.pdf', systemFilename: 'MEIL_SUB001_BU001_PRJ001_USR005_S2-ELECTRICITY_20261008_090000_01.pdf', fileExtension: 'pdf', fileType: 'application/pdf', fileSize: 3120000, meilId: 'MEIL', subsidiaryId: 'SUB001', businessUnitId: 'BU001', projectId: 'PRJ001', userId: 'USR005', parameterId: 'S2-ELECTRICITY', submissionId: 'SUB-002', uploadedBy: 'USR005', uploadedAt: '2026-10-08T09:00:00Z', verificationStatus: SubmissionStatus.UNDER_REVIEW, verificationHistory: [], sequenceNumber: 1 },
  { evidenceId: 'EVD-000005', originalFilename: 'electricity_bill_may.pdf', systemFilename: 'MEIL_SUB001_BU001_PRJ001_USR005_S2-ELECTRICITY_20260715_110500_02.pdf', fileExtension: 'pdf', fileType: 'application/pdf', fileSize: 2980000, meilId: 'MEIL', subsidiaryId: 'SUB001', businessUnitId: 'BU001', projectId: 'PRJ001', userId: 'USR005', parameterId: 'S2-ELECTRICITY', submissionId: 'SUB-003', uploadedBy: 'USR005', uploadedAt: '2026-07-15T11:05:00Z', verificationStatus: SubmissionStatus.APPROVED, verificationHistory: [], sequenceNumber: 2 },
  { evidenceId: 'EVD-000006', originalFilename: 'electricity_bill_jun.pdf', systemFilename: 'MEIL_SUB001_BU001_PRJ001_USR005_S2-ELECTRICITY_20260715_111000_03.pdf', fileExtension: 'pdf', fileType: 'application/pdf', fileSize: 3050000, meilId: 'MEIL', subsidiaryId: 'SUB001', businessUnitId: 'BU001', projectId: 'PRJ001', userId: 'USR005', parameterId: 'S2-ELECTRICITY', submissionId: 'SUB-003', uploadedBy: 'USR005', uploadedAt: '2026-07-15T11:10:00Z', verificationStatus: SubmissionStatus.APPROVED, verificationHistory: [], sequenceNumber: 3 },
  { evidenceId: 'EVD-000007', originalFilename: 'water_tanker_summary.pdf', systemFilename: 'MEIL_SUB001_BU001_PRJ001_USR005_SC-WATER_20261008_093000_01.pdf', fileExtension: 'pdf', fileType: 'application/pdf', fileSize: 1145000, meilId: 'MEIL', subsidiaryId: 'SUB001', businessUnitId: 'BU001', projectId: 'PRJ001', userId: 'USR005', parameterId: 'SC-WATER', submissionId: 'SUB-004', uploadedBy: 'USR005', uploadedAt: '2026-10-08T09:30:00Z', verificationStatus: SubmissionStatus.SUBMITTED, verificationHistory: [], sequenceNumber: 1 },
  { evidenceId: 'EVD-000008', originalFilename: 'travel_desk_oct.xlsx', systemFilename: 'MEIL_SUB001_BU001_PRJ001_USR005_S3-BUSINESS-TRAVEL_20261007_140000_01.xlsx', fileExtension: 'xlsx', fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', fileSize: 856000, meilId: 'MEIL', subsidiaryId: 'SUB001', businessUnitId: 'BU001', projectId: 'PRJ001', userId: 'USR005', parameterId: 'S3-BUSINESS-TRAVEL', submissionId: 'SUB-006', uploadedBy: 'USR005', uploadedAt: '2026-10-07T14:00:00Z', verificationStatus: SubmissionStatus.SUBMITTED, verificationHistory: [], sequenceNumber: 1 },
  { evidenceId: 'EVD-000009', originalFilename: 'coal_purchase_order.pdf', systemFilename: 'MEIL_SUB001_BU001_PRJ001_USR001_S1-COAL_20260720_080000_01.pdf', fileExtension: 'pdf', fileType: 'application/pdf', fileSize: 1670000, meilId: 'MEIL', subsidiaryId: 'SUB001', businessUnitId: 'BU001', projectId: 'PRJ001', userId: 'USR001', parameterId: 'S1-COAL', submissionId: 'SUB-006', uploadedBy: 'USR001', uploadedAt: '2026-07-20T08:00:00Z', verificationStatus: SubmissionStatus.APPROVED, verificationHistory: [{ id: 'VH-006', action: VerificationAction.APPROVE, performedBy: 'USR-PS-001', performedByRole: UserRole.PROJECT_SUPERVISOR, performedAt: '2026-08-25T10:00:00Z', previousStatus: SubmissionStatus.SUBMITTED, newStatus: SubmissionStatus.APPROVED, comment: 'Coal purchase records verified.' }], sequenceNumber: 1 },
  { evidenceId: 'EVD-000010', originalFilename: 'diesel_invoice_expressway.pdf', systemFilename: 'MEIL_SUB001_BU001_PRJ002_USR006_S1-DIESEL_20260805_090000_01.pdf', fileExtension: 'pdf', fileType: 'application/pdf', fileSize: 2340000, meilId: 'MEIL', subsidiaryId: 'SUB001', businessUnitId: 'BU001', projectId: 'PRJ002', userId: 'USR006', parameterId: 'S1-DIESEL', submissionId: 'SUB-007', uploadedBy: 'USR006', uploadedAt: '2026-08-05T09:00:00Z', verificationStatus: SubmissionStatus.SUBMITTED, verificationHistory: [], sequenceNumber: 1 },
  { evidenceId: 'EVD-000011', originalFilename: 'metro_electricity_bill.pdf', systemFilename: 'MEIL_SUB001_BU002_PRJ004_USR016_S2-ELECTRICITY_20260725_080000_01.pdf', fileExtension: 'pdf', fileType: 'application/pdf', fileSize: 3890000, meilId: 'MEIL', subsidiaryId: 'SUB001', businessUnitId: 'BU002', projectId: 'PRJ004', userId: 'USR016', parameterId: 'S2-ELECTRICITY', submissionId: 'SUB-008', uploadedBy: 'USR016', uploadedAt: '2026-07-25T08:00:00Z', verificationStatus: SubmissionStatus.APPROVED, verificationHistory: [{ id: 'VH-007', action: VerificationAction.APPROVE, performedBy: 'USR-PS-004', performedByRole: UserRole.PROJECT_SUPERVISOR, performedAt: '2026-08-30T14:00:00Z', previousStatus: SubmissionStatus.SUBMITTED, newStatus: SubmissionStatus.APPROVED, comment: 'Metro site electricity verified.' }], sequenceNumber: 1 },
];

// Add the matching live-model data for the six BU001 Project User demo accounts.
parameterSubmissions.push(
  ...parameterSubmissions.filter(submission => submission.submissionId?.startsWith('DEMO-PRJ')).map(submission => ({
    ...submission,
    id: submission.submissionId,
    value: submission.activityData,
    scope: esgParameters.find(parameter => parameter.parameterId === submission.parameterId)?.scope,
    period: '202610',
  })),
);

// ---------- Consolidation Records ----------
export const consolidationRecords: ConsolidationRecord[] = [
  { id: 'CON-PRJ001', level: 'PROJECT', entityId: 'PRJ001', entityName: 'NH-44 Expansion Project', parentEntityId: 'BU001', childRecordIds: ['SUB-001', 'SUB-002', 'SUB-003', 'SUB-006'], scope1Total: 481.89, scope2Total: 397.70, scope3Total: 283.50, sectionCData: {}, totalCO2e: 1163.09, status: SubmissionStatus.CONSOLIDATED, consolidatedBy: 'USR-PS-001', consolidatedAt: '2026-09-01T12:00:00Z', reportingPeriod: 'FY 2025-26', verificationHistory: [] },
  { id: 'CON-PRJ004', level: 'PROJECT', entityId: 'PRJ004', entityName: 'Hyderabad Metro Phase-II', parentEntityId: 'BU002', childRecordIds: ['SUB-008'], scope1Total: 125.40, scope2Total: 754.40, scope3Total: 89.20, sectionCData: {}, totalCO2e: 969.00, status: SubmissionStatus.CONSOLIDATED, consolidatedBy: 'USR-PS-004', consolidatedAt: '2026-09-05T10:00:00Z', reportingPeriod: 'FY 2025-26', verificationHistory: [] },
  { id: 'CON-BU001', level: 'BUSINESS_UNIT', entityId: 'BU001', entityName: 'Highway Construction Division', parentEntityId: 'SUB001', childRecordIds: ['CON-PRJ001'], scope1Total: 612.30, scope2Total: 485.90, scope3Total: 356.70, sectionCData: {}, totalCO2e: 1454.90, status: SubmissionStatus.CONSOLIDATED, consolidatedBy: 'USR-BU-001', consolidatedAt: '2026-09-10T14:00:00Z', reportingPeriod: 'FY 2025-26', verificationHistory: [] },
  { id: 'CON-BU002', level: 'BUSINESS_UNIT', entityId: 'BU002', entityName: 'Metro Rail Division', parentEntityId: 'SUB001', childRecordIds: ['CON-PRJ004'], scope1Total: 245.80, scope2Total: 1120.60, scope3Total: 198.50, sectionCData: {}, totalCO2e: 1564.90, status: SubmissionStatus.CONSOLIDATED, consolidatedBy: 'USR-BU-002', consolidatedAt: '2026-09-10T15:00:00Z', reportingPeriod: 'FY 2025-26', verificationHistory: [] },
  { id: 'CON-SUB001', level: 'SUBSIDIARY', entityId: 'SUB001', entityName: 'MEIL Infrastructure Projects', parentEntityId: 'MEIL', childRecordIds: ['CON-BU001', 'CON-BU002'], scope1Total: 858.10, scope2Total: 1606.50, scope3Total: 555.20, sectionCData: {}, totalCO2e: 3019.80, status: SubmissionStatus.FORWARDED, consolidatedBy: 'USR-SUB-001', consolidatedAt: '2026-09-15T10:00:00Z', reportingPeriod: 'FY 2025-26', verificationHistory: [] },
];

// ---------- Audit Events ----------
export const auditEvents: AuditEvent[] = [
  { id: 'AUD-001', user: 'Rajesh Kumar', userId: 'USR005', role: UserRole.PROJECT_USER, action: 'EVIDENCE_UPLOADED', entity: 'Evidence', entityId: 'EVD-000001', timestamp: '2026-07-15T09:30:00Z', comment: 'Uploaded diesel invoice for Q1' },
  { id: 'AUD-002', user: 'Rajesh Kumar', userId: 'USR005', role: UserRole.PROJECT_USER, action: 'PARAMETER_SUBMITTED', entity: 'Submission', entityId: 'SUB-001', timestamp: '2026-07-16T10:00:00Z', previousStatus: SubmissionStatus.DRAFT, newStatus: SubmissionStatus.SUBMITTED, comment: 'Submitted Scope 1 Diesel data for review' },
  { id: 'AUD-003', user: 'Priya Sharma', userId: 'USR-PS-001', role: UserRole.PROJECT_SUPERVISOR, action: 'DATA_APPROVED', entity: 'Submission', entityId: 'SUB-001', timestamp: '2026-08-01T10:00:00Z', previousStatus: SubmissionStatus.SUBMITTED, newStatus: SubmissionStatus.APPROVED, comment: 'Verified against fuel register. Data is consistent.' },
  { id: 'AUD-004', user: 'Priya Sharma', userId: 'USR-PS-001', role: UserRole.PROJECT_SUPERVISOR, action: 'CORRECTION_REQUESTED', entity: 'Submission', entityId: 'SUB-005', timestamp: '2026-09-01T11:00:00Z', previousStatus: SubmissionStatus.SUBMITTED, newStatus: SubmissionStatus.CORRECTION_REQUIRED, comment: 'Waste manifest does not cover Q2 period.' },
  { id: 'AUD-005', user: 'Priya Sharma', userId: 'USR-PS-001', role: UserRole.PROJECT_SUPERVISOR, action: 'PROJECT_CONSOLIDATED', entity: 'Consolidation', entityId: 'CON-PRJ001', timestamp: '2026-09-01T12:00:00Z', comment: 'PRJ001 consolidated with approved data' },
  { id: 'AUD-006', user: 'Arun Patel', userId: 'USR-BU-001', role: UserRole.BU_SUPERVISOR, action: 'BU_CONSOLIDATED', entity: 'Consolidation', entityId: 'CON-BU001', timestamp: '2026-09-10T14:00:00Z', comment: 'BU001 Highway Construction Division consolidated' },
  { id: 'AUD-007', user: 'Vikram Singh', userId: 'USR-SUB-001', role: UserRole.SUBSIDIARY_SUPERVISOR, action: 'SUBSIDIARY_CONSOLIDATED', entity: 'Consolidation', entityId: 'CON-SUB001', timestamp: '2026-09-15T10:00:00Z', comment: 'SUB001 MEIL Infrastructure Projects consolidated and forwarded to MEIL' },
  { id: 'AUD-008', user: 'Dr. Srinivas Reddy', userId: 'USR-ADMIN', role: UserRole.MEIL_ADMIN, action: 'REPORT_GENERATED', entity: 'Report', entityId: 'RPT-001', timestamp: '2026-09-30T16:00:00Z', comment: 'BRSR Draft Report generated for FY 2025-26' },
];

// ---------- Notifications ----------
export const notifications: Notification[] = [
  { id: 'NOT-001', userId: 'USR005', title: 'Correction Required', message: 'Correction requested for Employee Commuting: Please upload the travel statement.', type: 'warning', read: false, createdAt: '2026-10-08T11:00:00Z', link: '/project-user/corrections' },
  { id: 'NOT-002', userId: 'USR005', title: 'Submission Approved', message: 'Your Diesel Consumption submission was approved by Project Supervisor Rajesh Sharma.', type: 'success', read: true, createdAt: '2026-10-08T14:15:00Z', link: '/project-user/submissions' },
  { id: 'NOT-003', userId: 'USR005', title: 'Submission Under Review', message: 'Purchased Electricity is under review by Project Supervisor.', type: 'info', read: false, createdAt: '2026-10-08T09:15:00Z', link: '/project-user/submissions' },
  { id: 'NOT-004', userId: 'USR005', title: 'Evidence Logged', message: 'Water Consumption evidence uploaded successfully.', type: 'info', read: true, createdAt: '2026-10-08T10:00:00Z', link: '/project-user/submissions' },
  { id: 'NOT-005', userId: 'USR005', title: 'Parameter Assignment', message: 'New parameter assigned: Total Waste Generated.', type: 'info', read: true, createdAt: '2026-10-07T08:00:00Z', link: '/project-user/esg-data/additional' },
  { id: 'NOT-006', userId: 'USR-PS-001', title: 'New Submission', message: 'Priyaranjan Pani submitted Purchased Electricity data for Zojila Tunnel Project.', type: 'info', read: false, createdAt: '2026-10-08T09:15:00Z', link: '/project-supervisor/review' },
  { id: 'NOT-007', userId: 'USR-BU-001', title: 'Project Consolidated', message: 'PRJ001 Zojila Tunnel Project has been consolidated and is ready for BU review.', type: 'info', read: false, createdAt: '2026-10-08T15:00:00Z', link: '/business-unit/review' },
  { id: 'NOT-008', userId: 'USR-ADMIN', title: 'Report Generated', message: 'BRSR Draft Report for FY 2025-26 has been generated successfully.', type: 'success', read: true, createdAt: '2026-09-30T16:00:00Z', link: '/admin/reports' },
];

// ---------- Helper Functions ----------
export function getSubsidiaryById(id: string): Subsidiary | undefined {
  return subsidiaries.find(s => s.id === id);
}

export function getBusinessUnitById(id: string): BusinessUnit | undefined {
  return businessUnits.find(bu => bu.id === id);
}

export function getProjectById(id: string): Project | undefined {
  return projects.find(p => p.id === id);
}

export function getUserById(id: string): User | undefined {
  return users.find(u => u.id === id);
}

export function getParameterById(id: string): ESGParameter | undefined {
  return esgParameters.find(p => p.parameterId === id);
}

export function getEmissionFactorById(id: string): EmissionFactor | undefined {
  return emissionFactors.find(ef => ef.factorId === id);
}

export function getEmissionFactorByParameterId(parameterId: string): EmissionFactor | undefined {
  return emissionFactors.find(ef => ef.parameterId === parameterId);
}

export function getEvidenceById(id: string): Evidence | undefined {
  return evidenceRecords.find(e => e.evidenceId === id);
}

export function getSubmissionById(id: string): ParameterSubmission | undefined {
  return parameterSubmissions.find(s => s.submissionId === id);
}

export function getProjectsByBusinessUnit(buId: string): Project[] {
  return projects.filter(p => p.businessUnitId === buId);
}

export function getBusinessUnitsBySubsidiary(subId: string): BusinessUnit[] {
  return businessUnits.filter(bu => bu.subsidiaryId === subId);
}

export function getSubmissionsByProject(projectId: string): ParameterSubmission[] {
  return parameterSubmissions.filter(s => s.projectId === projectId);
}

export function getEvidenceBySubmission(submissionId: string): Evidence[] {
  return evidenceRecords.filter(e => e.submissionId === submissionId);
}

export function getEvidenceByProject(projectId: string): Evidence[] {
  return evidenceRecords.filter(e => e.projectId === projectId);
}

export function getNotificationsByUser(userId: string): Notification[] {
  return notifications.filter(n => n.userId === userId);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function generateSystemFilename(
  subsidiaryId: string,
  buId: string,
  projectId: string,
  userId: string,
  parameterId: string,
  extension: string,
  sequence: number = 1
): string {
  const now = new Date();
  const timestamp = now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0') + '_' +
    now.getHours().toString().padStart(2, '0') +
    now.getMinutes().toString().padStart(2, '0') +
    now.getSeconds().toString().padStart(2, '0');
  return `MEIL_${subsidiaryId}_${buId}_${projectId}_${userId}_${parameterId}_${timestamp}_${sequence.toString().padStart(2, '0')}.${extension}`;
}

export function generateEvidenceId(): string {
  const existing = evidenceRecords.length;
  return `EVD-${(existing + 1).toString().padStart(6, '0')}`;
}

// Scope summary helpers
export function getScopeTotals(projectId?: string, buId?: string, subId?: string) {
  let submissions = parameterSubmissions;
  if (projectId) submissions = submissions.filter(s => s.projectId === projectId);
  if (buId) submissions = submissions.filter(s => s.businessUnitId === buId);
  if (subId) submissions = submissions.filter(s => s.subsidiaryId === subId);

  const approved = submissions.filter(s => s.status === SubmissionStatus.APPROVED || s.status === SubmissionStatus.CONSOLIDATED);

  const scope1 = approved.filter(s => {
    const param = getParameterById(s.parameterId);
    return param?.scope === Scope.SCOPE_1;
  }).reduce((sum, s) => sum + s.calculatedCO2e, 0);

  const scope2 = approved.filter(s => {
    const param = getParameterById(s.parameterId);
    return param?.scope === Scope.SCOPE_2;
  }).reduce((sum, s) => sum + s.calculatedCO2e, 0);

  const scope3 = approved.filter(s => {
    const param = getParameterById(s.parameterId);
    return param?.scope === Scope.SCOPE_3;
  }).reduce((sum, s) => sum + s.calculatedCO2e, 0);

  return { scope1, scope2, scope3, total: scope1 + scope2 + scope3 };
}
