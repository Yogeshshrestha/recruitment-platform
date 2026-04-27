export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'candidate' | 'recruiter'
          full_name: string | null
          bio: string | null
          skills: string[]
          avatar_url: string | null
          resume_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: 'candidate' | 'recruiter'
          full_name?: string | null
          bio?: string | null
          skills?: string[]
          avatar_url?: string | null
          resume_url?: string | null
        }
        Update: {
          role?: 'candidate' | 'recruiter'
          full_name?: string | null
          bio?: string | null
          skills?: string[]
          avatar_url?: string | null
          resume_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          id: string
          recruiter_id: string
          name: string
          description: string | null
          logo_url: string | null
          website: string | null
          location: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          recruiter_id: string
          name: string
          description?: string | null
          logo_url?: string | null
          website?: string | null
          location?: string | null
        }
        Update: {
          name?: string
          description?: string | null
          logo_url?: string | null
          website?: string | null
          location?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          id: string
          company_id: string | null
          recruiter_id: string
          title: string
          description: string
          location: string | null
          salary_range: string | null
          type: string
          category: string | null
          status: 'open' | 'closed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id?: string | null
          recruiter_id: string
          title: string
          description: string
          location?: string | null
          salary_range?: string | null
          type?: string
          category?: string | null
          status?: 'open' | 'closed'
        }
        Update: {
          title?: string
          description?: string
          location?: string | null
          salary_range?: string | null
          type?: string
          category?: string | null
          status?: 'open' | 'closed'
          updated_at?: string
        }
        Relationships: []
      }
      applications: {
        Row: {
          id: string
          job_id: string
          candidate_id: string
          resume_url: string | null
          cover_letter: string | null
          status: 'applied' | 'reviewing' | 'interviewing' | 'rejected' | 'hired'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_id: string
          candidate_id: string
          resume_url?: string | null
          cover_letter?: string | null
          status?: 'applied' | 'reviewing' | 'interviewing' | 'rejected' | 'hired'
        }
        Update: {
          status?: 'applied' | 'reviewing' | 'interviewing' | 'rejected' | 'hired'
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
