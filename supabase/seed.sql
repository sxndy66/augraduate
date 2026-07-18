-- ============================================================================
-- AU Track — Seed Data
-- ============================================================================

-- ============================================================================
-- Regulations
-- ============================================================================

insert into public.regulations (code, name, active) values
    ('R2017', 'Anna University Regulation 2017', true),
    ('R2021', 'Anna University Regulation 2021', true)
on conflict (code) do nothing;

-- ============================================================================
-- Degrees
-- ============================================================================

insert into public.degrees (name, level) values
    ('B.E.', 'UG'),
    ('B.Tech', 'UG'),
    ('M.E.', 'PG'),
    ('M.Tech', 'PG')
on conflict do nothing;

-- ============================================================================
-- Branches
-- Using subqueries to resolve degree_id by name
-- ============================================================================

insert into public.branches (degree_id, code, name, active)
select d.id, x.code, x.name, true
from public.degrees d
join (
    values
        ('B.E.',   'CSE',         'Computer Science and Engineering'),
        ('B.E.',   'IT',          'Information Technology'),
        ('B.E.',   'ECE',         'Electronics and Communication Engineering'),
        ('B.E.',   'EEE',         'Electrical and Electronics Engineering'),
        ('B.E.',   'Mechanical',  'Mechanical Engineering'),
        ('B.E.',   'Civil',       'Civil Engineering'),
        ('B.E.',   'AIDS',        'Artificial Intelligence and Data Science'),
        ('B.E.',   'Biomedical',  'Biomedical Engineering'),
        ('B.E.',   'Aeronautical','Aeronautical Engineering'),
        ('B.E.',   'Chemical',    'Chemical Engineering')
) as x(degree_name, code, name)
on d.name = x.degree_name
on conflict do nothing;

-- ============================================================================
-- Subjects — AIDS R2021 across 8 semesters
-- Realistic Anna University R2021 curriculum for AI & Data Science
-- ============================================================================

-- Resolve regulation and branch IDs once
do $$
declare
    v_reg_id   uuid;
    v_branch_id uuid;
begin
    select id into v_reg_id    from public.regulations where code = 'R2021';
    select id into v_branch_id from public.branches    where code = 'AIDS';

    -- ------------------------------------------------------------------
    -- Semester 1
    -- ------------------------------------------------------------------
    insert into public.subjects (regulation_id, branch_id, semester_number, subject_code, subject_name, credits, category, is_elective, verified)
    values
        (v_reg_id, v_branch_id, 1, 'HS3151',          'Professional English - I',                  3, 'HS',     false, true),
        (v_reg_id, v_branch_id, 1, 'MA3151',          'Matrices and Calculus',                      4, 'BS',     false, true),
        (v_reg_id, v_branch_id, 1, 'PH3151',          'Engineering Physics',                        3, 'BS',     false, true),
        (v_reg_id, v_branch_id, 1, 'CY3151',          'Engineering Chemistry',                      3, 'BS',     false, true),
        (v_reg_id, v_branch_id, 1, 'GE3151',          'Problem Solving and Python Programming',     3, 'ES',     false, true),
        (v_reg_id, v_branch_id, 1, 'GE3171',          'Problem Solving and Python Programming Lab', 2, 'ES',     false, true),
        (v_reg_id, v_branch_id, 1, 'BS3171',          'Physics and Chemistry Laboratory',           2, 'BS',     false, true),
        (v_reg_id, v_branch_id, 1, 'GE3152',          'Heritage of Tamils',                         1, 'HS',     false, true),
        (v_reg_id, v_branch_id, 1, 'GE3172',          'Tamils and Technology',                      1, 'HS',     false, true)
    on conflict do nothing;

    -- ------------------------------------------------------------------
    -- Semester 2
    -- ------------------------------------------------------------------
    insert into public.subjects (regulation_id, branch_id, semester_number, subject_code, subject_name, credits, category, is_elective, verified)
    values
        (v_reg_id, v_branch_id, 2, 'HS3251',          'Professional English - II',                  3, 'HS',     false, true),
        (v_reg_id, v_branch_id, 2, 'MA3251',          'Statistics and Numerical Mathematics',       4, 'BS',     false, true),
        (v_reg_id, v_branch_id, 2, 'PH3251',          'Physics for Information Science',            3, 'BS',     false, true),
        (v_reg_id, v_branch_id, 2, 'BE3251',          'Basic Electrical and Electronics Engineering', 3, 'ES',   false, true),
        (v_reg_id, v_branch_id, 2, 'GE3251',          'Engineering Graphics',                       4, 'ES',     false, true),
        (v_reg_id, v_branch_id, 2, 'GE3271',          'Engineering Practices Laboratory',           2, 'ES',     false, true),
        (v_reg_id, v_branch_id, 2, 'CS3271',          'Programming in C Laboratory',                2, 'ES',     false, true),
        (v_reg_id, v_branch_id, 2, 'GE3252',          'Tamils and Technology',                      1, 'HS',     false, true)
    on conflict do nothing;

    -- ------------------------------------------------------------------
    -- Semester 3
    -- ------------------------------------------------------------------
    insert into public.subjects (regulation_id, branch_id, semester_number, subject_code, subject_name, credits, category, is_elective, verified)
    values
        (v_reg_id, v_branch_id, 3, 'MA3351',          'Discrete Mathematics',                       4, 'BS',     false, true),
        (v_reg_id, v_branch_id, 3, 'CS3351',          'Digital Principles and Computer Organization', 3, 'ES',   false, true),
        (v_reg_id, v_branch_id, 3, 'CS3491',          'Theory of Computation',                      3, 'PC',     false, true),
        (v_reg_id, v_branch_id, 3, 'AI3301',          'Foundations of Artificial Intelligence',     3, 'PC',     false, true),
        (v_reg_id, v_branch_id, 3, 'AI3302',          'Intelligent Systems',                        3, 'PC',     false, true),
        (v_reg_id, v_branch_id, 3, 'DS3301',          'Data Structures and Algorithms',             3, 'PC',     false, true),
        (v_reg_id, v_branch_id, 3, 'DS3311',          'Data Structures and Algorithms Laboratory',  2, 'PC',     false, true),
        (v_reg_id, v_branch_id, 3, 'AI3311',          'Intelligent Systems Laboratory',             2, 'PC',     false, true)
    on conflict do nothing;

    -- ------------------------------------------------------------------
    -- Semester 4
    -- ------------------------------------------------------------------
    insert into public.subjects (regulation_id, branch_id, semester_number, subject_code, subject_name, credits, category, is_elective, verified)
    values
        (v_reg_id, v_branch_id, 4, 'MA3451',          'Probability and Queueing Models',            4, 'BS',     false, true),
        (v_reg_id, v_branch_id, 4, 'AI3401',          'Machine Learning Techniques',                3, 'PC',     false, true),
        (v_reg_id, v_branch_id, 4, 'AI3402',          'Deep Learning',                              3, 'PC',     false, true),
        (v_reg_id, v_branch_id, 4, 'DS3401',          'Database Management Systems',                3, 'PC',     false, true),
        (v_reg_id, v_branch_id, 4, 'DS3402',          'Object Oriented Programming',                3, 'PC',     false, true),
        (v_reg_id, v_branch_id, 4, 'DS3411',          'Database Management Systems Laboratory',     2, 'PC',     false, true),
        (v_reg_id, v_branch_id, 4, 'AI3411',          'Machine Learning Laboratory',                2, 'PC',     false, true),
        (v_reg_id, v_branch_id, 4, 'AI3412',          'Deep Learning Laboratory',                   2, 'PC',     false, true)
    on conflict do nothing;

    -- ------------------------------------------------------------------
    -- Semester 5
    -- ------------------------------------------------------------------
    insert into public.subjects (regulation_id, branch_id, semester_number, subject_code, subject_name, credits, category, is_elective, verified)
    values
        (v_reg_id, v_branch_id, 5, 'AI3501',          'Natural Language Processing',                3, 'PC',     false, true),
        (v_reg_id, v_branch_id, 5, 'AI3502',          'Computer Vision',                            3, 'PC',     false, true),
        (v_reg_id, v_branch_id, 5, 'DS3501',          'Big Data Analytics',                         3, 'PC',     false, true),
        (v_reg_id, v_branch_id, 5, 'DS3502',          'Data Warehousing and Data Mining',           3, 'PC',     false, true),
        (v_reg_id, v_branch_id, 5, 'AI3503',          'Reinforcement Learning',                     3, 'PE',     true,  true),
        (v_reg_id, v_branch_id, 5, 'AI3511',          'Natural Language Processing Laboratory',     2, 'PC',     false, true),
        (v_reg_id, v_branch_id, 5, 'AI3512',          'Computer Vision Laboratory',                 2, 'PC',     false, true),
        (v_reg_id, v_branch_id, 5, 'GE3451',          'Environmental Sciences and Sustainability',  2, 'HS',     false, true)
    on conflict do nothing;

    -- ------------------------------------------------------------------
    -- Semester 6
    -- ------------------------------------------------------------------
    insert into public.subjects (regulation_id, branch_id, semester_number, subject_code, subject_name, credits, category, is_elective, verified)
    values
        (v_reg_id, v_branch_id, 6, 'AI3601',          'Robotics and Automation',                    3, 'PC',     false, true),
        (v_reg_id, v_branch_id, 6, 'DS3601',          'Cloud Computing',                            3, 'PC',     false, true),
        (v_reg_id, v_branch_id, 6, 'DS3602',          'Information Retrieval and Web Search',       3, 'PC',     false, true),
        (v_reg_id, v_branch_id, 6, 'AI3602',          'Fuzzy Logic and Neural Networks',            3, 'PE',     true,  true),
        (v_reg_id, v_branch_id, 6, 'DS3603',          'Time Series Analysis and Forecasting',       3, 'PE',     true,  true),
        (v_reg_id, v_branch_id, 6, 'AI3611',          'Robotics Laboratory',                        2, 'PC',     false, true),
        (v_reg_id, v_branch_id, 6, 'DS3611',          'Cloud Computing Laboratory',                 2, 'PC',     false, true),
        (v_reg_id, v_branch_id, 6, 'GE3452',          'Universal Human Values',                     2, 'HS',     false, true)
    on conflict do nothing;

    -- ------------------------------------------------------------------
    -- Semester 7
    -- ------------------------------------------------------------------
    insert into public.subjects (regulation_id, branch_id, semester_number, subject_code, subject_name, credits, category, is_elective, verified)
    values
        (v_reg_id, v_branch_id, 7, 'AI3701',          'Generative AI',                              3, 'PC',     false, true),
        (v_reg_id, v_branch_id, 7, 'DS3701',          'DevOps and MLOps',                           3, 'PC',     false, true),
        (v_reg_id, v_branch_id, 7, 'AI3702',          'Explainable AI',                             3, 'PE',     true,  true),
        (v_reg_id, v_branch_id, 7, 'DS3702',          'Blockchain Technologies',                    3, 'PE',     true,  true),
        (v_reg_id, v_branch_id, 7, 'AI3711',          'Generative AI Laboratory',                   2, 'PC',     false, true),
        (v_reg_id, v_branch_id, 7, 'DS3711',          'MLOps Laboratory',                           2, 'PC',     false, true),
        (v_reg_id, v_branch_id, 7, 'GE3791',          'Internship / Industry Project',              3, 'HS',     false, true)
    on conflict do nothing;

    -- ------------------------------------------------------------------
    -- Semester 8
    -- ------------------------------------------------------------------
    insert into public.subjects (regulation_id, branch_id, semester_number, subject_code, subject_name, credits, category, is_elective, verified)
    values
        (v_reg_id, v_branch_id, 8, 'AI3801',          'Autonomous Systems',                         3, 'PE',     true,  true),
        (v_reg_id, v_branch_id, 8, 'DS3801',          'Quantum Computing Foundations',              3, 'PE',     true,  true),
        (v_reg_id, v_branch_id, 8, 'AI3802',          'Edge AI and IoT',                            3, 'PE',     true,  true),
        (v_reg_id, v_branch_id, 8, 'GE3811',          'Project Work / Capstone Project',           10, 'HS',     false, true),
        (v_reg_id, v_branch_id, 8, 'GE3821',          'Professional Ethics and Engineering Economics', 2, 'HS',  false, true)
    on conflict do nothing;

    -- ------------------------------------------------------------------
    -- Semesters table — 8 semesters for AIDS R2021
    -- ------------------------------------------------------------------
    insert into public.semesters (regulation_id, branch_id, semester_number, total_credits)
    values
        (v_reg_id, v_branch_id, 1, 22),
        (v_reg_id, v_branch_id, 2, 22),
        (v_reg_id, v_branch_id, 3, 23),
        (v_reg_id, v_branch_id, 4, 22),
        (v_reg_id, v_branch_id, 5, 21),
        (v_reg_id, v_branch_id, 6, 21),
        (v_reg_id, v_branch_id, 7, 19),
        (v_reg_id, v_branch_id, 8, 21)
    on conflict do nothing;

end $$;

-- ============================================================================
-- Notification Sources
-- ============================================================================

insert into public.notification_sources (name, url, type, active) values
    ('Anna University Official Website', 'https://www.annauniv.edu', 'university', true),
    ('Anna University COE Portal', 'https://coe1.annauniv.edu', 'examination', true),
    ('Anna University News Portal', 'https://news.annauniv.edu', 'news', true)
on conflict do nothing;

-- ============================================================================
-- Sample Notifications
-- ============================================================================

insert into public.notifications (title, body, source_url, category, degree_filter, branch_filter, published_at, fetched_at, verified)
values
    (
        'Anna University Semester Examination Time Table Released',
        'The Anna University Controller of Examinations has released the end-semester examination time table for all UG and PG programs under R2021 regulation. Students are advised to check the COE portal for their respective schedules.',
        'https://coe1.annauniv.edu',
        'examination',
        null,
        null,
        now() - interval '2 days',
        now() - interval '2 days',
        true
    ),
    (
        'Revaluation Results Published for November 2025 Examinations',
        'Revaluation results for the November 2025 end-semester examinations have been published. Students can check their results on the COE portal using their register number.',
        'https://coe1.annauniv.edu',
        'results',
        null,
        null,
        now() - interval '5 days',
        now() - interval '5 days',
        true
    ),
    (
        'Anna University Campus Placement Drive - TCS, Infosys, and Cognizant',
        'Anna University is organizing a mega campus placement drive with TCS, Infosys, and Cognizant for final year B.E. and B.Tech students. Eligible students must register on the placement portal before the deadline.',
        'https://www.annauniv.edu',
        'placement',
        'B.E.',
        null,
        now() - interval '1 day',
        now() - interval '1 day',
        true
    ),
    (
        'Supplementary Examination Registration Open for Arrear Subjects',
        'Registration for supplementary examinations (arrear exams) is now open. Students with arrears in any semester can register through the COE portal. The last date for registration is 15 days from today.',
        'https://coe1.annauniv.edu',
        'examination',
        null,
        null,
        now() - interval '3 hours',
        now() - interval '3 hours',
        true
    ),
    (
        'New AI & Data Science Elective Courses Announced for R2021',
        'Anna University has announced new elective courses for the AI & Data Science branch under R2021 regulation, including Generative AI, Edge AI, and Quantum Computing Foundations for Semester 7 and 8.',
        'https://www.annauniv.edu',
        'academic',
        'B.E.',
        'AIDS',
        now() - interval '1 week',
        now() - interval '1 week',
        true
    )
on conflict do nothing;

-- ============================================================================
-- Done
-- ============================================================================