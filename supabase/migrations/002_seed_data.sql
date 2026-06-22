-- ===========================================================
-- ECS — Election Campaign System
-- Migration 002: Seed Data
-- ===========================================================
-- Run AFTER 001_initial_schema.sql.
-- Creates sample members for development / UI testing.
-- Safe to run multiple times (ON CONFLICT DO NOTHING).
-- ===========================================================

-- NOTE: The first Admin profile is created automatically when
-- you sign up via Supabase Auth. After signing up, run this
-- one-time update to promote that user to Admin:
--
--   UPDATE public.profiles
--   SET role = 'Admin'
--   WHERE email = 'your-admin@email.com';

-- ===========================================================
-- Sample Members (10 records)
-- ===========================================================
INSERT INTO public.members (
  serial_number,
  name,
  father_name,
  gender,
  dob,
  address,
  area,
  city,
  phone_number,
  request_member_bar,
  registration_date,
  remarks
) VALUES
  (1,  'Muhammad Ali',       'Abdul Razzaq',    'Male',   '2001-03-15',
       'House 12, Street 4, Firdoos Pura',   'Firdoos Pura',  'Sialkot', '03001234501', 'B', '2024-01-10', NULL),

  (2,  'Ayesha Bibi',        'Muhammad Akram',  'Female', '1998-07-22',
       'House 5, Street 8, Gulshan Colony',  'Gulshan Colony','Sialkot', '03111234502', 'A', '2024-01-12', NULL),

  (3,  'Usman Tariq',        'Tariq Mehmood',   'Male',   '2000-11-05',
       'House 33, Street 2, Model Town',     'Model Town',    'Sialkot', '03211234503', 'A', '2024-01-14', NULL),

  (4,  'Sana Fatima',        'Ghulam Rasool',   'Female', '1995-05-30',
       'House 7, Street 15, Sadar Bazar',    'Sadar Bazar',   'Sialkot', '03331234504', 'C', '2024-01-15', NULL),

  (5,  'Bilal Hussain',      'Hussain Ahmed',   'Male',   '2003-01-18',
       'House 20, Street 6, Cantt Area',     'Cantt Area',    'Sialkot', '03451234505', 'B', '2024-02-01', NULL),

  (6,  'Nazia Parveen',      'Allah Ditta',     'Female', '1997-09-12',
       'House 9, Street 1, Paris Road',      'Paris Road',    'Sialkot', '03011234506', 'A', '2024-02-05', NULL),

  (7,  'Imran Sardar',       'Sardar Khan',     'Male',   '1999-04-25',
       'House 45, Street 3, Iqbal Town',     'Iqbal Town',    'Sialkot', '03111234507', 'B', '2024-02-08', NULL),

  (8,  'Rabia Akhtar',       'Akhtar Hussain',  'Female', '2002-12-10',
       'House 18, Street 7, Kashmir Road',   'Kashmir Road',  'Sialkot', '03211234508', 'C', '2024-02-10', NULL),

  (9,  'Hassan Raza',        'Raza Ahmad',      'Male',   '1996-06-14',
       'House 3, Street 9, Ghallah Mandi',   'Ghallah Mandi', 'Sialkot', '03331234509', 'A', '2024-03-01', NULL),

  (10, 'Zainab Malik',       'Malik Aslam',     'Female', '2001-08-20',
       'House 22, Street 11, Firdoos Pura',  'Firdoos Pura',  'Sialkot', '03451234510', 'B', '2024-03-05', NULL),

  (11, 'Farhan Qadir',       'Abdul Qadir',     'Male',   '2004-02-28',
       'House 8, Street 5, Allama Iqbal',    'Allama Iqbal',  'Sialkot', '03011234511', 'A', '2024-03-10', NULL),

  (12, 'Hina Naveed',        'Naveed Akhtar',   'Female', '1993-10-03',
       'House 14, Street 2, Defence Road',   'Defence Road',  'Sialkot', '03111234512', 'C', '2024-03-12', NULL),

  (13, 'Adnan Shahid',       'Shahid Mehmood',  'Male',   '1990-12-19',
       'House 6, Street 10, Firdoos Pura',   'Firdoos Pura',  'Sialkot', '03211234513', 'B', '2024-04-01', NULL),

  (14, 'Madiha Yousaf',      'Yousaf Ali',      'Female', '2005-06-07',
       'House 30, Street 4, Gulshan Colony', 'Gulshan Colony','Sialkot', '03331234514', 'A', '2024-04-03', NULL),

  (15, 'Kamran Bashir',      'Bashir Ahmad',    'Male',   '1988-03-22',
       'House 11, Street 8, Model Town',     'Model Town',    'Sialkot', '03451234515', 'B', '2024-04-07', NULL)

ON CONFLICT (serial_number) DO NOTHING;


-- ===========================================================
-- Dashboard stats cache — initial values
-- ===========================================================
INSERT INTO public.dashboard_stats_cache (stat_key, stat_value, last_updated)
VALUES
  ('total_members',           '{"count": 0}',       NOW()),
  ('areas_count',             '{"count": 0}',       NOW()),
  ('last_import_date',        '{"date": null}',      NOW()),
  ('current_month_imports',   '{"count": 0}',       NOW())
ON CONFLICT (stat_key) DO NOTHING;
