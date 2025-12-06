import { zhCN_account } from './account';
import { zhCN_app } from './app';
import { zhCN_component } from './component';
import { zhCN_dashboard } from './dashboard';
import { zhCN_globalTips } from './global/tips';
import { zhCN_permissionRole } from './permission/role';
import { zhCN_avatorDropMenu } from './user/avatorDropMenu';
import { zhCN_title } from './user/title';

const zh_CN = {
  ...zhCN_account,
  ...zhCN_app,
  ...zhCN_avatorDropMenu,
  ...zhCN_title,
  ...zhCN_globalTips,
  ...zhCN_permissionRole,
  ...zhCN_dashboard,
  ...zhCN_component,
};

export default zh_CN;
