export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; full_name: string | null; college: string | null; department: string | null; regulation: string | null; current_semester: number | null; avatar_url: string | null; created_at: string; updated_at: string };
        Insert: { id: string; full_name?: string | null; college?: string | null; department?: string | null; regulation?: string | null; current_semester?: number | null; avatar_url?: string | null; created_at?: string; updated_at?: string };
        Update: { id?: string; full_name?: string | null; college?: string | null; department?: string | null; regulation?: string | null; current_semester?: number | null; avatar_url?: string | null; created_at?: string; updated_at?: string };
      };
      semesters: {
        Row: { id: string; student_id: string; semester_number: number; gpa: number; total_credits: number; is_complete: boolean; created_at: string };
        Insert: { id?: string; student_id: string; semester_number: number; gpa?: number; total_credits?: number; is_complete?: boolean; created_at?: string };
        Update: { id?: string; student_id?: string; semester_number?: number; gpa?: number; total_credits?: number; is_complete?: boolean; created_at?: string };
      };
      subjects: {
        Row: { id: string; semester_id: string; subject_code: string; subject_name: string; credits: number; grade: string | null; grade_points: number; is_arrear: boolean; arrear_cleared: boolean; created_at: string };
        Insert: { id?: string; semester_id: string; subject_code: string; subject_name: string; credits: number; grade?: string | null; grade_points?: number; is_arrear?: boolean; arrear_cleared?: boolean; created_at?: string };
        Update: { id?: string; semester_id?: string; subject_code?: string; subject_name?: string; credits?: number; grade?: string | null; grade_points?: number; is_arrear?: boolean; arrear_cleared?: boolean; created_at?: string };
      };
      attendance: {
        Row: { id: string; student_id: string; subject_id: string; subject_name: string; total_classes: number; attended_classes: number; updated_at: string };
        Insert: { id?: string; student_id: string; subject_id: string; subject_name: string; total_classes?: number; attended_classes?: number; updated_at?: string };
        Update: { id?: string; student_id?: string; subject_id?: string; subject_name?: string; total_classes?: number; attended_classes?: number; updated_at?: string };
      };
      notes: {
        Row: { id: string; student_id: string; subject_code: string; title: string; content: string | null; file_url: string | null; type: string; created_at: string };
        Insert: { id?: string; student_id: string; subject_code: string; title: string; content?: string | null; file_url?: string | null; type?: string; created_at?: string };
        Update: { id?: string; student_id?: string; subject_code?: string; title?: string; content?: string | null; file_url?: string | null; type?: string; created_at?: string };
      };
      au_notifications: {
        Row: { id: string; title: string; url: string | null; category: string; published_at: string | null; scraped_at: string };
        Insert: { id?: string; title: string; url?: string | null; category?: string; published_at?: string | null; scraped_at?: string };
        Update: { id?: string; title?: string; url?: string | null; category?: string; published_at?: string | null; scraped_at?: string };
      };
    };
  };
}
