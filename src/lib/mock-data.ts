import { Member, User, ActivityLog, MonthlyRegistration, AreaStat } from "@/types";

const AREAS = [
  "New Siyana Pura",
  "Firdoos Pura",
  "Aibak Road",
  "Rangpura",
  "Shahabpura",
  "Hajipura",
  "Paris Road",
  "Kashmir Road",
  "Cantonment",
  "Model Town",
  "Allama Iqbal Road",
  "Defence Colony",
  "Gulshan-e-Iqbal",
  "Satellite Town",
  "Uggoki Road",
];

const MALE_NAMES = [
  "Muhammad Ali", "Ahmad Hassan", "Usman Khan", "Bilal Ahmed", "Zubair Malik",
  "Tariq Mehmood", "Imran Butt", "Shoaib Akhtar", "Kamran Akmal", "Faisal Qureshi",
  "Asad Shafiq", "Rizwan Ahmed", "Babar Azam", "Shadab Khan", "Haris Rauf",
  "Naseem Shah", "Mohammad Wasim", "Faheem Ashraf", "Khurram Shehzad", "Sarfraz Ahmed",
  "Abdul Razzaq", "Waqar Younis", "Wasim Akram", "Inzamam ul Haq", "Saeed Anwar",
  "Ijaz Ahmed", "Yousuf Youhana", "Saleem Malik", "Aamer Sohail", "Rameez Raja",
  "Misbah ul Haq", "Younis Khan", "Shahid Afridi", "Danish Kaneria", "Umar Akmal",
  "Sohaib Maqsood", "Yasir Shah", "Zulfiqar Babar", "Junaid Khan", "Wahab Riaz",
  "Mohammad Amir", "Sohail Khan", "Ehsan Adil", "Rahat Fateh Ali", "Amjad Khan",
  "Pervez Musharraf", "Nawaz Sharif", "Asif Zardari", "Imran Khan", "Asfandyar Wali",
];

const FEMALE_NAMES = [
  "Fatima Malik", "Ayesha Khan", "Zainab Ahmed", "Sana Butt", "Nadia Hassan",
  "Rabia Qureshi", "Hina Rabbani", "Maryam Nawaz", "Benazir Khan", "Shahida Parveen",
  "Amina Tariq", "Rukhsana Bibi", "Nusrat Fateh", "Gulnaz Akhtar", "Parveen Shakir",
  "Sara Azhar", "Mehwish Hayat", "Mahira Khan", "Sajal Ali", "Aiman Zaman",
  "Saba Qamar", "Iqra Aziz", "Yumna Zaidi", "Hira Mani", "Sonya Hussyn",
  "Neelam Muneer", "Noor Hassan", "Sana Javed", "Maya Ali", "Urwa Hocane",
  "Mawra Hocane", "Syra Shehroz", "Humaima Malik", "Zara Sheikh", "Meera Malik",
  "Nadia Hussain", "Juggun Kazim", "Farah Khan", "Shaista Lodhi", "Sanam Baloch",
  "Rabia Butt", "Kubra Khan", "Ushna Shah", "Sanam Jung", "Ayesha Omer",
  "Armeena Khan", "Sarmad Sultan", "Hajra Khan", "Amna Ilyas", "Sunita Marshal",
];

const FATHER_NAMES = [
  "Muhammad Hussain", "Abdul Rehman", "Ghulam Rasool", "Noor Muhammad", "Haji Ahmed",
  "Khan Muhammad", "Muhammad Yousuf", "Asghar Ali", "Nasir Ahmed", "Bashir Ahmad",
  "Iqbal Hussain", "Ramzan Ali", "Akbar Khan", "Sardar Muhammad", "Riaz Ahmed",
  "Liaquat Ali", "Zahid Hussain", "Pervaiz Ahmed", "Shaukat Ali", "Arif Khan",
  "Tariq Mahmood", "Khalid Mehmood", "Shahbaz Ahmad", "Manzoor Ahmad", "Rafique Ahmed",
];

const REQUEST_MEMBER_BARS = [
  "PML-N Sialkot", "PTI Sialkot North", "PPP Sialkot", "PMLN District",
  "PTI NA-75", "MQM Sialkot", "PML-Q Sialkot", "JUI-F Sialkot",
  "ANP Sialkot", "Independent - NA-76",
];

// Seeded LCG PRNG — deterministic on both server and client, eliminating hydration mismatches
function createRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

const rng = createRng(42);

function randomDate(start: Date, end: Date): string {
  const d = new Date(start.getTime() + rng() * (end.getTime() - start.getTime()));
  return d.toISOString().split("T")[0];
}

function randomBetween(min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function generateSerialNumber(index: number): string {
  return `SLK-${String(index + 1).padStart(4, "0")}`;
}

function generatePhone(): string {
  const prefixes = ["0300", "0301", "0302", "0303", "0311", "0312", "0321", "0333", "0345", "0346"];
  const prefix = prefixes[Math.floor(rng() * prefixes.length)];
  return `${prefix}-${randomBetween(1000000, 9999999)}`;
}

function getAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export function generateMembers(count: number = 120): Member[] {
  const members: Member[] = [];
  const startDate = new Date("2023-01-01");
  const endDate = new Date("2024-12-31");

  for (let i = 0; i < count; i++) {
    const gender = rng() > 0.42 ? "Male" : "Female";
    const names = gender === "Male" ? MALE_NAMES : FEMALE_NAMES;
    const name = names[Math.floor(rng() * names.length)];
    const fatherName = FATHER_NAMES[Math.floor(rng() * FATHER_NAMES.length)];
    const area = AREAS[Math.floor(rng() * AREAS.length)];
    const dobYear = randomBetween(1960, 2000);
    const dobMonth = String(randomBetween(1, 12)).padStart(2, "0");
    const dobDay = String(randomBetween(1, 28)).padStart(2, "0");
    const dob = `${dobYear}-${dobMonth}-${dobDay}`;
    const registrationDate = randomDate(startDate, endDate);
    const requestMemberBar = REQUEST_MEMBER_BARS[Math.floor(rng() * REQUEST_MEMBER_BARS.length)];
    const statuses: Member["status"][] = ["Active", "Pending", "Inactive"];
    const status = statuses[Math.floor(rng() * (i < 90 ? 2 : 3))];

    members.push({
      id: `MBR-${String(i + 1).padStart(5, "0")}`,
      serialNumber: generateSerialNumber(i),
      name,
      fatherName,
      gender,
      dob,
      age: getAge(dob),
      address: `House #${randomBetween(1, 500)}, Street #${randomBetween(1, 20)}, ${area}, Sialkot`,
      area,
      phone: generatePhone(),
      requestMemberBar,
      registrationDate,
      status,
    });
  }

  return members.sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime());
}

export const MOCK_MEMBERS: Member[] = generateMembers(120);

export const MOCK_USERS: User[] = [
  {
    id: "USR-001",
    name: "Arif Mehmood",
    email: "arif.mehmood@ecs.pk",
    phone: "0300-1234567",
    role: "Admin",
    status: "Active",
    lastLogin: "2024-12-20T09:15:00",
    createdAt: "2023-01-15",
  },
  {
    id: "USR-002",
    name: "Khalid Mahmood",
    email: "khalid.mahmood@ecs.pk",
    phone: "0301-2345678",
    role: "Admin",
    status: "Active",
    lastLogin: "2024-12-20T08:30:00",
    createdAt: "2023-02-10",
  },
  {
    id: "USR-003",
    name: "Fatima Zahra",
    email: "fatima.zahra@ecs.pk",
    phone: "0321-3456789",
    role: "User",
    status: "Active",
    lastLogin: "2024-12-19T16:45:00",
    createdAt: "2023-03-05",
  },
  {
    id: "USR-004",
    name: "Usman Tariq",
    email: "usman.tariq@ecs.pk",
    phone: "0333-4567890",
    role: "User",
    status: "Active",
    lastLogin: "2024-12-20T10:00:00",
    createdAt: "2023-04-20",
  },
  {
    id: "USR-005",
    name: "Ayesha Siddiqa",
    email: "ayesha.siddiqa@ecs.pk",
    phone: "0345-5678901",
    role: "User",
    status: "Active",
    lastLogin: "2024-12-18T14:20:00",
    createdAt: "2023-06-12",
  },
  {
    id: "USR-006",
    name: "Shahbaz Riaz",
    email: "shahbaz.riaz@ecs.pk",
    phone: "0311-6789012",
    role: "Admin",
    status: "Inactive",
    lastLogin: "2024-11-30T11:10:00",
    createdAt: "2023-05-18",
  },
  {
    id: "USR-007",
    name: "Nadia Hussain",
    email: "nadia.hussain@ecs.pk",
    phone: "0302-7890123",
    role: "User",
    status: "Active",
    lastLogin: "2024-12-20T07:55:00",
    createdAt: "2023-07-22",
  },
];

export const MOCK_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: "LOG-001",
    userId: "USR-001",
    userName: "Arif Mehmood",
    userRole: "Admin",
    action: "User Login",
    description: "Admin logged in from Sialkot office",
    timestamp: "2024-12-20T09:15:00",
    type: "login",
  },
  {
    id: "LOG-002",
    userId: "USR-003",
    userName: "Fatima Zahra",
    userRole: "User",
    action: "Member Added",
    description: "New member Muhammad Bilal (SLK-0118) added to Rangpura area",
    timestamp: "2024-12-20T09:30:00",
    type: "member_added",
  },
  {
    id: "LOG-003",
    userId: "USR-004",
    userName: "Usman Tariq",
    userRole: "User",
    action: "Member Added",
    description: "New member Sana Malik (SLK-0119) added to Model Town area",
    timestamp: "2024-12-20T09:45:00",
    type: "member_added",
  },
  {
    id: "LOG-004",
    userId: "USR-002",
    userName: "Khalid Mahmood",
    userRole: "Admin",
    action: "Import Completed",
    description: "Successfully imported 45 members from Excel file 'sialkot_dec_2024.xlsx'",
    timestamp: "2024-12-20T10:15:00",
    type: "import",
  },
  {
    id: "LOG-005",
    userId: "USR-003",
    userName: "Fatima Zahra",
    userRole: "User",
    action: "Member Updated",
    description: "Updated phone number for member Ahmad Hassan (SLK-0023)",
    timestamp: "2024-12-20T10:30:00",
    type: "member_updated",
  },
  {
    id: "LOG-006",
    userId: "USR-001",
    userName: "Arif Mehmood",
    userRole: "Admin",
    action: "User Created",
    description: "New user Nadia Hussain created with User role",
    timestamp: "2024-12-20T11:00:00",
    type: "user_created",
  },
  {
    id: "LOG-007",
    userId: "USR-002",
    userName: "Khalid Mahmood",
    userRole: "Admin",
    action: "Export Generated",
    description: "Exported member list for Hajipura area (PDF format)",
    timestamp: "2024-12-20T11:30:00",
    type: "export",
  },
  {
    id: "LOG-008",
    userId: "USR-007",
    userName: "Nadia Hussain",
    userRole: "User",
    action: "User Login",
    description: "Data entry operator logged in",
    timestamp: "2024-12-20T07:55:00",
    type: "login",
  },
  {
    id: "LOG-009",
    userId: "USR-003",
    userName: "Fatima Zahra",
    userRole: "User",
    action: "Member Added",
    description: "New member Rukhsana Bibi (SLK-0120) added to Shahabpura area",
    timestamp: "2024-12-20T12:10:00",
    type: "member_added",
  },
  {
    id: "LOG-010",
    userId: "USR-001",
    userName: "Arif Mehmood",
    userRole: "Admin",
    action: "Settings Updated",
    description: "System notification preferences updated",
    timestamp: "2024-12-19T15:30:00",
    type: "settings",
  },
  {
    id: "LOG-011",
    userId: "USR-004",
    userName: "Usman Tariq",
    userRole: "User",
    action: "Import Completed",
    description: "Successfully imported 28 members from CSV file 'cantonment_area.csv'",
    timestamp: "2024-12-19T14:00:00",
    type: "import",
  },
  {
    id: "LOG-012",
    userId: "USR-002",
    userName: "Khalid Mahmood",
    userRole: "Admin",
    action: "Member Updated",
    description: "Updated address for 3 members in Paris Road area",
    timestamp: "2024-12-19T13:45:00",
    type: "member_updated",
  },
];

export const MOCK_MONTHLY_REGISTRATIONS: MonthlyRegistration[] = [
  { month: "Jan 24", registrations: 42, male: 26, female: 16 },
  { month: "Feb 24", registrations: 58, male: 34, female: 24 },
  { month: "Mar 24", registrations: 73, male: 45, female: 28 },
  { month: "Apr 24", registrations: 65, male: 38, female: 27 },
  { month: "May 24", registrations: 89, male: 52, female: 37 },
  { month: "Jun 24", registrations: 102, male: 61, female: 41 },
  { month: "Jul 24", registrations: 118, male: 70, female: 48 },
  { month: "Aug 24", registrations: 95, male: 57, female: 38 },
  { month: "Sep 24", registrations: 134, male: 80, female: 54 },
  { month: "Oct 24", registrations: 156, male: 93, female: 63 },
  { month: "Nov 24", registrations: 142, male: 85, female: 57 },
  { month: "Dec 24", registrations: 78, male: 47, female: 31 },
];

export const MOCK_AREA_STATS: AreaStat[] = [
  { area: "Cantonment", count: 156, percentage: 15.2 },
  { area: "Model Town", count: 142, percentage: 13.8 },
  { area: "Rangpura", count: 128, percentage: 12.5 },
  { area: "Shahabpura", count: 115, percentage: 11.2 },
  { area: "Hajipura", count: 108, percentage: 10.5 },
  { area: "Paris Road", count: 97, percentage: 9.5 },
  { area: "Kashmir Road", count: 89, percentage: 8.7 },
  { area: "Aibak Road", count: 78, percentage: 7.6 },
  { area: "Firdoos Pura", count: 67, percentage: 6.5 },
  { area: "New Siyana Pura", count: 45, percentage: 4.4 },
];

export const MOCK_GENDER_DATA = [
  { name: "Male", value: 682, color: "#0F766E" },
  { name: "Female", value: 345, color: "#F59E0B" },
];

export const DASHBOARD_STATS = {
  totalMembers: 1027,
  maleMembers: 682,
  femaleMembers: 345,
  todayRegistrations: 12,
  monthRegistrations: 78,
  topArea: "Cantonment",
};

export const ALL_AREAS = AREAS;
export const ALL_REQUEST_MEMBER_BARS = REQUEST_MEMBER_BARS;
