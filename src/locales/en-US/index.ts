import { enUS_account } from './account';
import { en_US_component } from './component';
import { enUS_dashboard } from './dashboard';
import { enUS_globalTips } from './global/tips';
import { enUS_permissionRole } from './permission/role';
import { enUS_avatorDropMenu } from './user/avatorDropMenu';
import { enUS_title } from './user/title';

const en_US = {
  ...enUS_account,
  ...enUS_avatorDropMenu,
  ...enUS_title,
  ...enUS_globalTips,
  ...enUS_permissionRole,
  ...enUS_dashboard,
  ...en_US_component,
};

export default en_US;
