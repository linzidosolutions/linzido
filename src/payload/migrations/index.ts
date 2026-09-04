import * as migration_20260902_125635_baseline from './20260902_125635_baseline';
import * as migration_20260902_125911_db_integrity_remediation from './20260902_125911_db_integrity_remediation';
import * as migration_20260903_130353_remove_leads_budget from './20260903_130353_remove_leads_budget';

export const migrations = [
  {
    up: migration_20260902_125635_baseline.up,
    down: migration_20260902_125635_baseline.down,
    name: '20260902_125635_baseline',
  },
  {
    up: migration_20260902_125911_db_integrity_remediation.up,
    down: migration_20260902_125911_db_integrity_remediation.down,
    name: '20260902_125911_db_integrity_remediation',
  },
  {
    up: migration_20260903_130353_remove_leads_budget.up,
    down: migration_20260903_130353_remove_leads_budget.down,
    name: '20260903_130353_remove_leads_budget'
  },
];
