// src/interface/app.interface.ts
export interface AppItem {
  ID: string;
  Name: string;
  Description: string;
  Status: string;
}

export type AppList = AppItem[];


export interface AppInfo {
  ID: number;
  Name: string;
  Description: string;
  Notice: string;
  Status: string;
  RsaKey: string;
  Config: string;
}

export type SetAppInfoParams = {
  ID: number;
  Description: string;
  Notice: string;
  Status: string;
}