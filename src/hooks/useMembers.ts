"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getAllMembers,
  addMember,
  updateMember,
  deleteMember,
  searchMembers,
  FirestoreMember,
  MemberSearchFilters,
} from "@/services/memberService";

interface UseMembersReturn {
  members: FirestoreMember[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  add: (member: Omit<FirestoreMember, "id" | "createdAt" | "updatedAt">, actorName?: string | null) => Promise<{ id: string; serialNumber: number }>;
  update: (id: string, updates: Partial<FirestoreMember>, actorName?: string | null) => Promise<void>;
  remove: (id: string, memberName?: string | null, actorName?: string | null) => Promise<void>;
  search: (filters: MemberSearchFilters) => Promise<FirestoreMember[]>;
}

export function useMembers(): UseMembersReturn {
  const [members, setMembers] = useState<FirestoreMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllMembers();
      setMembers(data);
    } catch (err: unknown) {
      setError((err as Error).message ?? "Failed to load members");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const add = useCallback(
    async (member: Omit<FirestoreMember, "id" | "createdAt" | "updatedAt">, actorName?: string | null) => {
      const result = await addMember(member, actorName);
      await fetch();
      return result;
    },
    [fetch]
  );

  const update = useCallback(
    async (id: string, updates: Partial<FirestoreMember>, actorName?: string | null) => {
      await updateMember(id, updates, actorName);
      await fetch();
    },
    [fetch]
  );

  const remove = useCallback(
    async (id: string, memberName?: string | null, actorName?: string | null) => {
      await deleteMember(id, memberName, actorName);
      setMembers((prev) => prev.filter((m) => m.id !== id));
    },
    []
  );

  const search = useCallback(async (filters: MemberSearchFilters) => {
    return searchMembers(filters);
  }, []);

  return { members, loading, error, refetch: fetch, add, update, remove, search };
}
