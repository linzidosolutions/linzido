import * as migration_20260902_125635_baseline from './20260902_125635_baseline';
import * as migration_20260902_125911_db_integrity_remediation from './20260902_125911_db_integrity_remediation';
import * as migration_20260903_130353_remove_leads_budget from './20260903_130353_remove_leads_budget';
import * as migration_20260904_143551_add_company_contact_fields from './20260904_143551_add_company_contact_fields';

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
    name: '20260903_130353_remove_leads_budget',
  },
  {
    up: migration_20260904_143551_add_company_contact_fields.up,
    down: migration_20260904_143551_add_company_contact_fields.down,
    name: '20260904_143551_add_company_contact_fields'
  },
];
