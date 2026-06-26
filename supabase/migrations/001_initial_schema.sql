-- =============================================
-- StuGraduate — Initial Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  college TEXT,
  department TEXT,
  regulation TEXT CHECK (regulation IN ('2019', '2021')),
  current_semester INT CHECK (current_semester BETWEEN 1 AND 8),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SEMESTERS
CREATE TABLE IF NOT EXISTS semesters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  semester_number INT NOT NULL CHECK (semester_number BETWEEN 1 AND 8),
  gpa NUMERIC(4,2) DEFAULT 0,
  total_credits INT DEFAULT 0,
  is_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUBJECTS
CREATE TABLE IF NOT EXISTS subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  semester_id UUID REFERENCES semesters(id) ON DELETE CASCADE NOT NULL,
  subject_code TEXT NOT NULL,
  subject_name TEXT NOT NULL,
  credits INT NOT NULL CHECK (credits BETWEEN 1 AND 6),
  grade TEXT,
  grade_points NUMERIC(4,2) DEFAULT 0,
  is_arrear BOOLEAN DEFAULT FALSE,
  arrear_cleared BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ATTENDANCE
CREATE TABLE IF NOT EXISTS attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  subject_name TEXT NOT NULL,
  total_classes INT DEFAULT 0 CHECK (total_classes >= 0),
  attended_classes INT DEFAULT 0 CHECK (attended_classes >= 0),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, subject_id)
);

-- NOTES
CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  subject_code TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  file_url TEXT,
  type TEXT CHECK (type IN ('note', 'pyq', 'lab', 'syllabus')) DEFAULT 'note',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AU NOTIFICATIONS (scraped — no RLS needed, public read)
CREATE TABLE IF NOT EXISTS au_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT,
  category TEXT CHECK (category IN ('result', 'timetable', 'practical', 'revaluation', 'general')) DEFAULT 'general',
  published_at TIMESTAMPTZ,
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(title, url)
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE au_notifications ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- SEMESTERS
CREATE POLICY "Users can manage own semesters" ON semesters FOR ALL USING (auth.uid() = student_id);

-- SUBJECTS (via semester join)
CREATE POLICY "Users can manage own subjects" ON subjects FOR ALL USING (
  auth.uid() = (SELECT student_id FROM semesters WHERE id = semester_id)
);

-- ATTENDANCE
CREATE POLICY "Users can manage own attendance" ON attendance FOR ALL USING (auth.uid() = student_id);

-- NOTES
CREATE POLICY "Users can manage own notes" ON notes FOR ALL USING (auth.uid() = student_id);

-- AU NOTIFICATIONS — public read, service role write only
CREATE POLICY "Anyone can read notifications" ON au_notifications FOR SELECT USING (true);

-- =============================================
-- AUTO-UPDATE TIMESTAMP TRIGGER
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_attendance_updated_at
  BEFORE UPDATE ON attendance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
