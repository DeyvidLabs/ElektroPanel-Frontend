export interface IEmailHistory {
  daily: { date: Date; in: number; out: number }[];
  weekly: { weekStart: Date; weekEnd: Date; in: number; out: number }[];
  monthly: { monthStart: Date; monthEnd: Date; in: number; out: number }[];
  yearly: { yearStart: Date; yearEnd: Date; in: number; out: number }[];
}

export interface IBlacklistIPInfo {
  address: string;
  count: number;
  lastSeen: Date;
  blacklisted: boolean;
  info?: IPInfo;
}

export interface IPInfo {
  isp?: string;
  org?: string;
  country?: string;
}

export interface IEmailUser {
  username: string;
  recoveryEmail: string;
}