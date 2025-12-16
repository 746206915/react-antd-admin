// 粗略信息
export interface AppUserList {
  ID: number;
  Usertype: string;
  Cardkey: string;
  Serial: string;
  Description: string;
  Status: string;
  TimeInterval: number;
  Endtime: number;
}

export interface AppUserInfo {
  ID: number;
  CreatorID: number;
  UserType: string;
  Cardkey: string;
  Serial: string;
  Description: string;
  Status: string;
  CreatTime: number;
  TimeInterval: number;
  ActiveTime: number;
  EndTime: number;
  LoginTime: number;
  LoginIp: string;
}