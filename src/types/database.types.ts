export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'Admin' | 'Manager' | 'Data Entry Operator' | 'Viewer'
export type Gender   = 'Male' | 'Female' | 'Other'
export type ImportStatus   = 'Processing' | 'Completed' | 'Failed'
export type ActivityAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'CREATE_MEMBER'
  | 'UPDATE_MEMBER'
  | 'DELETE_MEMBER'
  | 'IMPORT_EXCEL'
  | 'EXPORT_DATA'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id:         string
          full_name:  string | null
          email:      string | null
          phone:      string | null
          role:       UserRole
          avatar_url: string | null
          is_active:  boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id:         string
          full_name?: string | null
          email?:     string | null
          phone?:     string | null
          role?:      UserRole
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          full_name?:  string | null
          email?:      string | null
          phone?:      string | null
          role?:       UserRole
          avatar_url?: string | null
          is_active?:  boolean
          updated_at?: string
        }
      }

      members: {
        Row: {
          id:                  string
          serial_number:       number
          name:                string
          father_name:         string | null
          gender:              Gender | null
          dob:                 string | null
          birth_year:          number | null
          address:             string | null
          area:                string | null
          city:                string
          phone_number:        string | null
          request_member_bar:  string | null
          registration_date:   string
          remarks:             string | null
          created_by:          string | null
          updated_by:          string | null
          created_at:          string
          updated_at:          string
          search_vector:       string | null
        }
        Insert: {
          id?:                  string
          serial_number:        number
          name:                 string
          father_name?:         string | null
          gender?:              Gender | null
          dob?:                 string | null
          birth_year?:          number | null
          address?:             string | null
          area?:                string | null
          city?:                string
          phone_number?:        string | null
          request_member_bar?:  string | null
          registration_date?:   string
          remarks?:             string | null
          created_by?:          string | null
          updated_by?:          string | null
          created_at?:          string
          updated_at?:          string
        }
        Update: {
          name?:                string
          father_name?:         string | null
          gender?:              Gender | null
          dob?:                 string | null
          birth_year?:          number | null
          address?:             string | null
          area?:                string | null
          city?:                string
          phone_number?:        string | null
          request_member_bar?:  string | null
          registration_date?:   string
          remarks?:             string | null
          updated_by?:          string | null
          updated_at?:          string
        }
      }

      activity_logs: {
        Row: {
          id:          string
          user_id:     string | null
          action:      ActivityAction
          table_name:  string | null
          record_id:   string | null
          description: string | null
          created_at:  string
        }
        Insert: {
          id?:          string
          user_id?:     string | null
          action:       ActivityAction
          table_name?:  string | null
          record_id?:   string | null
          description?: string | null
          created_at?:  string
        }
        Update: never
      }

      import_history: {
        Row: {
          id:                  string
          file_name:           string
          total_records:       number
          successful_records:  number
          failed_records:      number
          imported_by:         string | null
          status:              ImportStatus
          created_at:          string
        }
        Insert: {
          id?:                  string
          file_name:            string
          total_records?:       number
          successful_records?:  number
          failed_records?:      number
          imported_by?:         string | null
          status?:              ImportStatus
          created_at?:          string
        }
        Update: {
          total_records?:       number
          successful_records?:  number
          failed_records?:      number
          status?:              ImportStatus
        }
      }

      saved_searches: {
        Row: {
          id:          string
          user_id:     string
          search_name: string
          filters:     Json
          created_at:  string
        }
        Insert: {
          id?:          string
          user_id:      string
          search_name:  string
          filters?:     Json
          created_at?:  string
        }
        Update: {
          search_name?: string
          filters?:     Json
        }
      }

      dashboard_stats_cache: {
        Row: {
          id:           string
          stat_key:     string
          stat_value:   Json
          last_updated: string
        }
        Insert: {
          id?:           string
          stat_key:      string
          stat_value?:   Json
          last_updated?: string
        }
        Update: {
          stat_value?:   Json
          last_updated?: string
        }
      }
    }

    Views: {
      member_statistics_view: {
        Row: {
          total_members:                number
          male_members:                 number
          female_members:               number
          today_registrations:          number
          current_month_registrations:  number
        }
      }
      area_statistics_view: {
        Row: {
          area:          string
          total_members: number
          male_count:    number
          female_count:  number
          other_count:   number
        }
      }
    }

    Functions: {
      get_next_serial_number: {
        Args:    Record<never, never>
        Returns: number
      }
      get_user_role: {
        Args:    Record<never, never>
        Returns: UserRole
      }
      search_members: {
        Args: {
          p_query?:         string
          p_gender?:        string
          p_area?:          string
          p_birth_year?:    number
          p_reg_date_from?: string
          p_reg_date_to?:   string
          p_rmb?:           string
          p_limit?:         number
          p_offset?:        number
        }
        Returns: Database['public']['Tables']['members']['Row'][]
      }
      count_members: {
        Args: {
          p_query?:         string
          p_gender?:        string
          p_area?:          string
          p_birth_year?:    number
          p_reg_date_from?: string
          p_reg_date_to?:   string
          p_rmb?:           string
        }
        Returns: number
      }
    }
  }
}

// Convenience row types
export type Profile        = Database['public']['Tables']['profiles']['Row']
export type Member         = Database['public']['Tables']['members']['Row']
export type ActivityLog    = Database['public']['Tables']['activity_logs']['Row']
export type ImportHistory  = Database['public']['Tables']['import_history']['Row']
export type SavedSearch    = Database['public']['Tables']['saved_searches']['Row']
export type DashboardStat  = Database['public']['Tables']['dashboard_stats_cache']['Row']

export type MemberStatistics = Database['public']['Views']['member_statistics_view']['Row']
export type AreaStatistics   = Database['public']['Views']['area_statistics_view']['Row']

// Insert / Update helpers
export type MemberInsert = Database['public']['Tables']['members']['Insert']
export type MemberUpdate = Database['public']['Tables']['members']['Update']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

// Search filter shape (mirrors search_members args)
export interface MemberSearchFilters {
  query?:        string
  gender?:       Gender
  area?:         string
  birthYear?:    number
  regDateFrom?:  string
  regDateTo?:    string
  rmb?:          string
}
