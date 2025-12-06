// src/interface/app.interface.ts
export interface AppItem {
  ID: string;
  Name: string;
  Description: string;
  Status: string;
}

export type AppList = AppItem[];