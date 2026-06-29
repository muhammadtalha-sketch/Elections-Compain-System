import { supabase } from "@/lib/supabase";
import type { Gender, InterestStatus, Member, MemberUpdate } from "@/types/database.types";
import { resolveArea } from "@/lib/area-utils";

// ─── Public interface (camelCase, kept for backward compat with hooks/components) ─

export interface FirestoreMember {
  id?: string;
  serialNumber: string;
  name: string;
  fatherName: string;
  gender: "Male" | "Female";
  dob: string;
  birthYear: number;
  address: string;
  area: string;
  city: string;
  phoneNumber: string;
  requestMemberBar: string;
  registrationDate: string;
  photoUrl?: string | null;
  status: "Active" | "Pending" | "Inactive";
  interestStatus?: InterestStatus;
  interestUpdatedBy?: string | null;
  interestUpdatedAt?: string | null;
  remarks?: string | null;
  notes?: string | null;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface MemberSearchFilters {
  serialExact?: string;
  serialFrom?: number;
  serialTo?: number;
  name?: string;
  fatherName?: string;
  gender?: string;
  birthYear?: number;
  area?: string;
  regFrom?: string;
  regTo?: string;
  requestMemberBar?: string;
  interestStatus?: string;
}

// ─── Adapter ────────────────────────────────────────────────────────────────

function toMember(row: Member): FirestoreMember {
  return {
    id: row.id,
    serialNumber: String(row.serial_number),
    name: row.name,
    fatherName: row.father_name ?? "",
    gender:
      row.gender === "Male" || row.gender === "Female" ? row.gender : "Male",
    dob: row.dob ?? "",
    birthYear: row.birth_year ?? 0,
    address: row.address ?? "",
    area: row.area ?? "",
    city: row.city,
    phoneNumber: row.phone_number ?? "",
    requestMemberBar: row.request_member_bar ?? "",
    registrationDate: row.registration_date,
    photoUrl: (row as any).photo_url ?? null,
    status: "Active",
    interestStatus: row.interest_status ?? "Pending",
    interestUpdatedBy: row.interest_updated_by ?? null,
    interestUpdatedAt: row.interest_updated_at ?? null,
    remarks: row.remarks,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── Read ────────────────────────────────────────────────────────────────────

export async function getAllMembers(): Promise<FirestoreMember[]> {
  const PAGE = 1000;
  const all: Member[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .order("serial_number", { ascending: true })
      .range(from, from + PAGE - 1);

    if (error) throw new Error(error.message);
    all.push(...(data ?? []));
    if ((data ?? []).length < PAGE) break;
    from += PAGE;
  }

  return all.map(toMember);
}

export async function getMemberById(
  id: string,
): Promise<FirestoreMember | null> {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return toMember(data);
}

// ─── Write ───────────────────────────────────────────────────────────────────

export async function getNextSerialNumber(): Promise<number> {
  const { data, error } = await supabase.rpc("get_next_serial_number");
  if (error) throw new Error(error.message);
  return data as number;
}

export async function addMember(
  member: Omit<FirestoreMember, "id" | "createdAt" | "updatedAt">,
): Promise<{ id: string; serialNumber: number }> {
  // Always use the database-generated serial — manual input is ignored
  const { data: nextSerial, error: serialError } = await supabase.rpc(
    "get_next_serial_number",
  );
  if (serialError)
    throw new Error(`Could not generate serial number: ${serialError.message}`);

  const serial = nextSerial as number;

  const { data, error } = await supabase
    .from("members")
    .insert({
      serial_number: serial,
      name: member.name.trim(),
      father_name: member.fatherName?.trim() || null,
      gender: (member.gender || null) as "Male" | "Female" | "Other" | null,
      dob: member.dob || null,
      birth_year: member.dob
        ? parseInt(member.dob.slice(0, 4))
        : member.birthYear || null,
      address: member.address?.trim() || null,
      area: member.area?.trim() || null,
      city: member.city?.trim() || "Sialkot",
      phone_number: member.phoneNumber?.trim() || null,
      request_member_bar: member.requestMemberBar?.trim() || null,
      registration_date: member.registrationDate,
      photo_url: member.photoUrl || null,
      remarks: member.remarks?.trim() || null,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return { id: data.id, serialNumber: serial };
}

export async function updateMember(
  id: string,
  updates: Partial<FirestoreMember>,
): Promise<void> {
  const patch: MemberUpdate = {};
  if (updates.name !== undefined) patch.name = updates.name;
  if (updates.fatherName !== undefined)
    patch.father_name = updates.fatherName || null;
  if (updates.gender !== undefined)
    patch.gender = (updates.gender as Gender) || null;
  if (updates.dob !== undefined) patch.dob = updates.dob || null;
  if (updates.birthYear !== undefined)
    patch.birth_year = updates.birthYear || null;
  if (updates.address !== undefined) patch.address = updates.address || null;
  if (updates.area !== undefined) patch.area = updates.area || null;
  if (updates.city !== undefined) patch.city = updates.city;
  if (updates.phoneNumber !== undefined)
    patch.phone_number = updates.phoneNumber || null;
  if (updates.requestMemberBar !== undefined)
    patch.request_member_bar = updates.requestMemberBar || null;
  if (updates.registrationDate !== undefined)
    patch.registration_date = updates.registrationDate;
  if (updates.photoUrl !== undefined)
    (patch as any).photo_url = updates.photoUrl || null;

  const { error } = await supabase.from("members").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteMember(id: string): Promise<void> {
  const { error } = await supabase.from("members").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ─── Search ──────────────────────────────────────────────────────────────────

export async function searchMembers(
  filters: MemberSearchFilters,
): Promise<FirestoreMember[]> {
  let query = supabase.from("members").select("*");

  if (filters.gender) query = query.eq("gender", filters.gender as Gender);
  if (filters.area) query = query.ilike("area", `%${filters.area}%`);
  if (filters.birthYear) query = query.eq("birth_year", filters.birthYear);
  if (filters.requestMemberBar)
    query = query.eq("request_member_bar", filters.requestMemberBar);
  if (filters.regFrom) query = query.gte("registration_date", filters.regFrom);
  if (filters.regTo) query = query.lte("registration_date", filters.regTo);
  if (filters.name) query = query.ilike("name", `%${filters.name}%`);
  if (filters.fatherName)
    query = query.ilike("father_name", `%${filters.fatherName}%`);
  if (filters.serialFrom !== undefined)
    query = query.gte("serial_number", filters.serialFrom);
  if (filters.serialTo !== undefined)
    query = query.lte("serial_number", filters.serialTo);
  if (filters.serialExact) {
    const num = parseInt(filters.serialExact.replace(/\D/g, ""));
    if (!isNaN(num)) query = query.eq("serial_number", num);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (filters.interestStatus) query = (query as any).eq('interest_status', filters.interestStatus)

  const { data, error } = await query
    .order("registration_date", { ascending: false })
    .limit(500);

  if (error) throw new Error(error.message);
  return (data ?? []).map(toMember);
}

// ─── Bulk import ─────────────────────────────────────────────────────────────

export async function bulkImportMembers(
  members: Omit<FirestoreMember, "id" | "createdAt" | "updatedAt">[],
  onProgress?: (done: number, total: number) => void,
): Promise<{ inserted: number; errors: string[] }> {
  const BATCH = 500;
  let inserted = 0;
  const errors: string[] = [];

  // Get starting serial number
  const { data: startSerial } = await supabase.rpc("get_next_serial_number");
  let nextSerial: number = (startSerial as number) ?? 1;

  for (let i = 0; i < members.length; i += BATCH) {
    const chunk = members.slice(i, i + BATCH);
    const rows = chunk.map((m, j) => ({
      serial_number: nextSerial + j,
      name: m.name,
      father_name: m.fatherName || null,
      gender: (m.gender || null) as "Male" | "Female" | null,
      dob: m.dob || null,
      birth_year: m.dob ? parseInt(m.dob.split("-")[0]) : m.birthYear || null,
      address: m.address || null,
      area: m.area || null,
      city: m.city || "Sialkot",
      phone_number: m.phoneNumber || null,
      request_member_bar: m.requestMemberBar || null,
      registration_date: m.registrationDate,
      photo_url: m.photoUrl || null,
    }));
    nextSerial += chunk.length;

    const { error } = await supabase.from("members").insert(rows);
    if (error) {
      errors.push(`Batch ${Math.floor(i / BATCH) + 1}: ${error.message}`);
    } else {
      inserted += chunk.length;
    }
    onProgress?.(inserted, members.length);
  }

  return { inserted, errors };
}

// ─── Helpers for filter dropdowns ────────────────────────────────────────────

export async function getDistinctAreas(): Promise<string[]> {
  // Try the view first (fast, post-migration)
  const { data: viewData, error: viewErr } = await supabase
    .from("area_statistics_view")
    .select("area")
    .order("total_members", { ascending: false });

  if (!viewErr && viewData && viewData.length > 0) {
    return viewData.map((r) => r.area).filter(Boolean) as string[];
  }

  // Fallback: derive distinct areas from address column (pre-migration)
  const { data } = await supabase.from("members").select("area, address");

  const set = new Set<string>();
  (data ?? []).forEach((m) => {
    const a = resolveArea(m.area, m.address);
    if (a) set.add(a);
  });
  return [...set].sort();
}

export async function updateInterestStatus(
  memberId: string,
  status: InterestStatus,
  updatedBy: string
): Promise<void> {
  const { error } = await supabase
    .from('members')
    .update({
      interest_status:     status,
      interest_updated_by: updatedBy,
      interest_updated_at: new Date().toISOString(),
    })
    .eq('id', memberId)
  if (error) throw new Error(error.message)
}

export async function getDistinctBars(): Promise<string[]> {
  const { data, error } = await supabase
    .from("members")
    .select("request_member_bar")
    .not("request_member_bar", "is", null)
    .order("request_member_bar")
    .limit(2000);
  if (error) return [];
  return [
    ...new Set(
      (data ?? []).map((r) => r.request_member_bar).filter(Boolean) as string[],
    ),
  ];
}
