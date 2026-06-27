import { supabase } from '@/lib/supabase'

export interface CommentWithAuthor {
  id:         string
  member_id:  string
  user_id:    string
  comment:    string
  created_at: string
  updated_at: string
  author: {
    full_name:  string | null
    avatar_url: string | null
    role:       string
  }
}

export async function getComments(memberId: string): Promise<CommentWithAuthor[]> {
  const { data: comments, error } = await supabase
    .from('member_comments')
    .select('*')
    .eq('member_id', memberId)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  if (!comments?.length) return []

  const userIds = [...new Set(comments.map((c) => c.user_id))]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, role')
    .in('id', userIds)

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]))

  return comments.map((c) => ({
    ...c,
    author: profileMap[c.user_id] ?? { full_name: 'Unknown', avatar_url: null, role: 'User' },
  }))
}

export async function addComment(memberId: string, userId: string, comment: string): Promise<CommentWithAuthor> {
  const { data, error } = await supabase
    .from('member_comments')
    .insert({ member_id: memberId, user_id: userId, comment: comment.trim() })
    .select()
    .single()
  if (error) throw new Error(error.message)

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, role')
    .eq('id', userId)
    .single()

  return {
    ...data,
    author: profile ?? { full_name: null, avatar_url: null, role: 'User' },
  }
}

export async function updateComment(commentId: string, comment: string): Promise<void> {
  const { error } = await supabase
    .from('member_comments')
    .update({ comment: comment.trim() })
    .eq('id', commentId)
  if (error) throw new Error(error.message)
}

export async function deleteComment(commentId: string): Promise<void> {
  const { error } = await supabase
    .from('member_comments')
    .delete()
    .eq('id', commentId)
  if (error) throw new Error(error.message)
}
