"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ThumbsUp, ThumbsDown, Clock, User, MessageSquare,
  Send, Pencil, X, Check, Loader2, AlertCircle,
  Calendar, Phone, MapPin, Users, Hash, Activity,
} from "lucide-react";
function timeAgo(date: string | Date): string {
  const secs = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (secs < 60)       return "just now";
  if (secs < 3600)     return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400)    return `${Math.floor(secs / 3600)}h ago`;
  if (secs < 2592000)  return `${Math.floor(secs / 86400)}d ago`;
  if (secs < 31536000) return `${Math.floor(secs / 2592000)}mo ago`;
  return `${Math.floor(secs / 31536000)}y ago`;
}
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import { initials, ROLE_BADGE } from "@/lib/rbac";
import { getMemberById, updateInterestStatus, FirestoreMember } from "@/services/memberService";
import {
  getComments, addComment, updateComment, deleteComment, CommentWithAuthor,
} from "@/services/commentService";
import type { InterestStatus } from "@/types/database.types";

const INTEREST_BADGE: Record<InterestStatus, string> = {
  "Interested":     "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-900",
  "Not Interested": "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900",
  "Pending":        "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900",
};

// ─── Timeline ─────────────────────────────────────────────────────────────────

interface TimelineItem {
  id:        string
  type:      'created' | 'interest' | 'comment' | 'updated'
  label:     string
  detail?:   string
  actor?:    string
  timestamp: string
}

// ─── Comment Thread ────────────────────────────────────────────────────────────

function CommentItem({
  comment,
  currentUserId,
  currentRole,
  onEdit,
  onDelete,
}: {
  comment:       CommentWithAuthor
  currentUserId: string
  currentRole:   string | null
  onEdit:        (id: string, text: string) => void
  onDelete:      (id: string) => void
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(comment.comment);
  const [saving, setSaving] = useState(false);

  const canModify =
    comment.user_id === currentUserId ||
    currentRole === "Admin" ||
    currentRole === "Super Admin";

  const handleSave = async () => {
    if (!text.trim()) return;
    setSaving(true);
    try {
      await updateComment(comment.id, text);
      onEdit(comment.id, text.trim());
      setEditing(false);
      toast.success("Comment updated");
    } catch {
      toast.error("Failed to update comment");
    }
    setSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 group"
    >
      <Avatar className="h-8 w-8 flex-shrink-0 mt-0.5">
        {comment.author.avatar_url && (
          <AvatarImage src={comment.author.avatar_url} alt={comment.author.full_name ?? ""} />
        )}
        <AvatarFallback className="bg-primary text-primary-foreground text-[11px] font-bold">
          {initials(comment.author.full_name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="bg-muted/50 rounded-2xl px-4 py-3">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs font-bold text-foreground">
              {comment.author.full_name ?? "Unknown"}
            </span>
            <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded-md", ROLE_BADGE[comment.author.role as keyof typeof ROLE_BADGE] ?? "")}>
              {comment.author.role}
            </span>
          </div>

          {editing ? (
            <div className="space-y-2">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={2}
                className="text-sm resize-none min-h-0"
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" className="h-7 text-xs gap-1" onClick={handleSave} disabled={saving || !text.trim()}>
                  {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                  Save
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setEditing(false); setText(comment.comment); }}>
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{comment.comment}</p>
          )}
        </div>

        <div className="flex items-center gap-3 px-1 mt-1">
          <span className="text-[10px] text-muted-foreground">
            {timeAgo(comment.created_at)}
          </span>
          {comment.updated_at !== comment.created_at && (
            <span className="text-[10px] text-muted-foreground italic">edited</span>
          )}
          {canModify && !editing && (
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors" onClick={() => setEditing(true)}>
                Edit
              </button>
              <button className="text-[10px] font-medium text-destructive/80 hover:text-destructive transition-colors" onClick={() => onDelete(comment.id)}>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function MemberDetail({ memberId }: { memberId: string }) {
  const router = useRouter();
  const { user, role } = useAuth();

  const [member,   setMember]   = useState<FirestoreMember | null>(null);
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [interest, setInterest] = useState<InterestStatus>("Pending");
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);
  const commentRef = useRef<HTMLTextAreaElement>(null);

  const buildTimeline = useCallback((m: FirestoreMember, cmts: CommentWithAuthor[]): TimelineItem[] => {
    const items: TimelineItem[] = [];

    items.push({
      id:        "created",
      type:      "created",
      label:     "Member record created",
      timestamp: String(m.createdAt ?? m.registrationDate),
    });

    if (m.interestUpdatedAt) {
      items.push({
        id:        "interest",
        type:      "interest",
        label:     `Interest status set to ${m.interestStatus}`,
        timestamp: m.interestUpdatedAt as string,
      });
    }

    cmts.forEach((c) => {
      items.push({
        id:        `cmt-${c.id}`,
        type:      "comment",
        label:     "Comment added",
        detail:    c.comment.slice(0, 60) + (c.comment.length > 60 ? "…" : ""),
        actor:     c.author.full_name ?? undefined,
        timestamp: c.created_at,
      });
    });

    return items.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [m, cmts] = await Promise.all([
        getMemberById(memberId),
        getComments(memberId),
      ]);
      if (!m) { setError("Member not found"); return; }
      setMember(m);
      setInterest(m.interestStatus ?? "Pending");
      setComments(cmts);
      setTimeline(buildTimeline(m, cmts));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [memberId, buildTimeline]);

  useEffect(() => { load(); }, [load]);

  const handleInterest = async (status: InterestStatus) => {
    if (!user) return;
    const prev = interest;
    setInterest(status);
    try {
      await updateInterestStatus(memberId, status, user.id);
      toast.success(`Marked as ${status}`);
      setTimeline((tl) => [
        ...tl.filter((t) => t.type !== "interest"),
        { id: "interest", type: "interest" as const, label: `Interest status set to ${status}`, timestamp: new Date().toISOString() },
      ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
    } catch {
      setInterest(prev);
      toast.error("Failed to update interest status");
    }
  };

  const handlePostComment = async () => {
    if (!user || !commentText.trim()) return;
    setPosting(true);
    try {
      const newComment = await addComment(memberId, user.id, commentText.trim());
      setComments((prev) => [...prev, newComment]);
      setTimeline((tl) => [...tl, {
        id:        `cmt-${newComment.id}`,
        type:      "comment" as const,
        label:     "Comment added",
        detail:    newComment.comment.slice(0, 60) + (newComment.comment.length > 60 ? "…" : ""),
        actor:     newComment.author.full_name ?? undefined,
        timestamp: newComment.created_at,
      }]);
      setCommentText("");

      await supabase.from("activity_logs").insert({
        user_id:     user.id,
        action:      "COMMENT_ADDED" as const,
        table_name:  "member_comments",
        record_id:   memberId,
        description: `Comment added on member ${member?.name}`,
      });
    } catch (e) {
      toast.error((e as Error).message);
    }
    setPosting(false);
  };

  const handleEditComment = (id: string, newText: string) => {
    setComments((prev) => prev.map((c) => c.id === id ? { ...c, comment: newText } : c));
  };

  const handleDeleteComment = async (id: string) => {
    try {
      await deleteComment(id);
      setComments((prev) => prev.filter((c) => c.id !== id));
      setTimeline((tl) => tl.filter((t) => t.id !== `cmt-${id}`));
      await supabase.from("activity_logs").insert({
        user_id:     user?.id,
        action:      "COMMENT_DELETED" as const,
        table_name:  "member_comments",
        record_id:   memberId,
        description: `Comment deleted on member ${member?.name}`,
      });
      toast.success("Comment deleted");
    } catch {
      toast.error("Failed to delete comment");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading member…</p>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle className="w-8 h-8 text-destructive" />
        <p className="text-sm text-foreground font-medium">{error ?? "Member not found"}</p>
        <Button variant="outline" size="sm" onClick={() => router.back()}>Go back</Button>
      </div>
    );
  }

  const TIMELINE_ICONS: Record<TimelineItem["type"], React.ReactNode> = {
    created:  <Users    className="w-3.5 h-3.5" />,
    interest: <ThumbsUp className="w-3.5 h-3.5" />,
    comment:  <MessageSquare className="w-3.5 h-3.5" />,
    updated:  <Pencil   className="w-3.5 h-3.5" />,
  };

  const age = member.dob
    ? Math.floor((Date.now() - new Date(member.dob).getTime()) / (365.25 * 24 * 3600 * 1000))
    : member.birthYear
      ? new Date().getFullYear() - member.birthYear
      : null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Members
      </button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Left: Member Info ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Member card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden"
          >
            {/* Header gradient strip */}
            <div className="h-2 bg-gradient-to-r from-primary to-primary/50" />

            <div className="p-6">
              <div className="flex items-start gap-5">
                {/* Photo or initials avatar */}
                {member.photoUrl ? (
                  <img
                    src={member.photoUrl}
                    alt={member.name}
                    className="w-20 h-20 rounded-2xl object-cover border border-border shadow-md flex-shrink-0"
                  />
                ) : (
                  <div className={cn(
                    "w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 shadow-md",
                    member.gender === "Male" ? "bg-gradient-to-br from-blue-400 to-blue-600" : "bg-gradient-to-br from-pink-400 to-pink-600"
                  )}>
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-xl font-bold text-foreground">{member.name}</h1>
                    <Badge variant="outline" className={cn("text-xs border font-semibold", INTEREST_BADGE[interest])}>
                      {interest}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {member.fatherName ? `S/O ${member.fatherName}` : ""}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className="text-xs font-mono text-primary font-semibold">#{member.serialNumber}</span>
                    <Badge variant="outline" className={cn(
                      "text-[10px] px-1.5 py-0 h-4 border-0 font-semibold",
                      member.gender === "Male"
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                        : "bg-pink-50 text-pink-700 dark:bg-pink-950/50 dark:text-pink-300"
                    )}>
                      {member.gender}
                    </Badge>
                    {age !== null && (
                      <span className="text-xs text-muted-foreground">{age} yrs</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Interest quick actions */}
              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => handleInterest("Interested")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all",
                    interest === "Interested"
                      ? "bg-green-500 text-white border-green-500 shadow-md shadow-green-500/25"
                      : "border-border text-muted-foreground hover:border-green-300 hover:text-green-600"
                  )}
                >
                  <ThumbsUp className="w-3.5 h-3.5" /> Interested
                </button>
                <button
                  onClick={() => handleInterest("Not Interested")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all",
                    interest === "Not Interested"
                      ? "bg-red-500 text-white border-red-500 shadow-md shadow-red-500/25"
                      : "border-border text-muted-foreground hover:border-red-300 hover:text-red-600"
                  )}
                >
                  <ThumbsDown className="w-3.5 h-3.5" /> Not Interested
                </button>
                <button
                  onClick={() => handleInterest("Pending")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all",
                    interest === "Pending"
                      ? "bg-amber-500 text-white border-amber-500"
                      : "border-border text-muted-foreground hover:border-amber-300 hover:text-amber-600"
                  )}
                >
                  <Clock className="w-3.5 h-3.5" /> Pending
                </button>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-border">
                {([
                  { icon: User,     label: "Gender",       value: member.gender || "—" },
                  { icon: Calendar, label: "Date of Birth", value: member.dob || "—" },
                  { icon: Hash,     label: "Age",          value: age !== null ? `${age} years` : "—" },
                  { icon: MapPin,   label: "Area",         value: member.area || "—" },
                  { icon: Phone,    label: "Phone",        value: member.phoneNumber || "—" },
                  { icon: Calendar, label: "Reg. Date",    value: member.registrationDate || "—" },
                  { icon: Users,    label: "Member Bar",   value: member.requestMemberBar || "—" },
                  { icon: Clock,    label: "Created",      value: member.createdAt ? new Date(String(member.createdAt)).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" }) : "—" },
                  { icon: Activity, label: "Updated",      value: member.updatedAt ? new Date(String(member.updatedAt)).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" }) : "—" },
                ] as { icon: React.ElementType; label: string; value: string }[]).map(({ icon: Icon, label, value }) => (
                  <div key={label} className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                      <Icon className="w-3 h-3" /> {label}
                    </div>
                    <p className="text-sm font-medium text-foreground">{value}</p>
                  </div>
                ))}
              </div>

              {member.address && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Address
                  </p>
                  <p className="text-sm text-foreground">{member.address}</p>
                </div>
              )}

              {(member.remarks || member.notes) && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> Notes / Remarks
                  </p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{member.notes || member.remarks}</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* ── Comments ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden"
          >
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border">
              <MessageSquare className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-sm text-foreground">Discussion</h2>
              <Badge variant="secondary" className="text-xs ml-1">{comments.length}</Badge>
            </div>

            <div className="p-5 space-y-4">
              {comments.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No comments yet. Be the first to leave a note.
                </p>
              )}

              <AnimatePresence>
                {comments.map((c) => (
                  <CommentItem
                    key={c.id}
                    comment={c}
                    currentUserId={user?.id ?? ""}
                    currentRole={role}
                    onEdit={handleEditComment}
                    onDelete={handleDeleteComment}
                  />
                ))}
              </AnimatePresence>

              {/* New comment box */}
              <div className="flex gap-3 pt-3 border-t border-border">
                <Avatar className="h-8 w-8 flex-shrink-0 mt-0.5">
                  <AvatarFallback className="bg-primary text-primary-foreground text-[11px] font-bold">
                    {initials(user?.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    ref={commentRef}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment…"
                    rows={2}
                    className="text-sm resize-none min-h-0"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handlePostComment();
                    }}
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] text-muted-foreground">Ctrl+Enter to post</p>
                    <Button
                      size="sm"
                      className="gap-1.5 h-8"
                      onClick={handlePostComment}
                      disabled={posting || !commentText.trim()}
                    >
                      {posting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      Post
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Right: Timeline ── */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden sticky top-4"
          >
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border">
              <Activity className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-sm text-foreground">Timeline</h2>
            </div>

            <div className="p-4">
              {timeline.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No activity yet.</p>
              ) : (
                <div className="relative pl-5">
                  {/* Vertical line */}
                  <div className="absolute left-2 top-1 bottom-1 w-px bg-border" />

                  <div className="space-y-5">
                    {timeline.map((item) => (
                      <div key={item.id} className="relative">
                        {/* Dot */}
                        <div className={cn(
                          "absolute -left-[13px] top-0.5 w-4 h-4 rounded-full border-2 border-background flex items-center justify-center",
                          item.type === "created"  && "bg-teal-500 text-white",
                          item.type === "interest" && "bg-primary text-primary-foreground",
                          item.type === "comment"  && "bg-violet-500 text-white",
                          item.type === "updated"  && "bg-amber-500 text-white",
                        )}>
                          <span className="scale-[0.6]">{TIMELINE_ICONS[item.type]}</span>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-foreground leading-snug">{item.label}</p>
                          {item.detail && (
                            <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{item.detail}</p>
                          )}
                          {item.actor && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">by {item.actor}</p>
                          )}
                          <p className="text-[10px] text-muted-foreground/70 mt-1">
                            {timeAgo(item.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
