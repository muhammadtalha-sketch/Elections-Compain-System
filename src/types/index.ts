export type Gender = "Male" | "Female";

export type Role = "Super Admin" | "Admin" | "User";

export type MemberStatus = "Active" | "Pending" | "Inactive";

export interface Member {
  id: string;
  serialNumber: string;
  name: string;
  fatherName: string;
  gender: Gender;
  dob: string;
  age: number;
  address: string;
  area: string;
  phone: string;
  requestMemberBar: string;
  registrationDate: string;
  status: MemberStatus;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  status: "Active" | "Inactive";
  lastLogin: string;
  avatar?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: Role;
  action: string;
  description: string;
  timestamp: string;
  type: "login" | "member_added" | "member_updated" | "import" | "export" | "user_created" | "settings";
}

export interface DashboardStats {
  totalMembers: number;
  maleMembers: number;
  femaleMembers: number;
  todayRegistrations: number;
  monthRegistrations: number;
  topArea: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface MonthlyRegistration {
  month: string;
  registrations: number;
  male: number;
  female: number;
}

export interface AreaStat {
  area: string;
  count: number;
  percentage: number;
}

export type NavItem = {
  label: string;
  href: string;
  icon: string;
  badge?: number;
};
