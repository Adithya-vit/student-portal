-- =========================================================
-- STUDENT PORTAL - DATABASE STRUCTURE
-- Safe to keep as your single master database file.
-- Uses IF NOT EXISTS where possible so it can be run again.
-- =========================================================

-- -------------------------
-- STUDENTS
-- -------------------------
create table if not exists public.students (
  id bigint generated always as identity primary key,
  student_id text unique not null,
  full_name text not null,
  nic_or_passport text,
  email text,
  phone text,
  address text,
  guardian_name text,
  guardian_contact text,
  course_or_program text,
  intake text,
  enrollment_status text default 'Active',
  payment_status text default 'Pending',
  auth_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.students
  add column if not exists auth_user_id uuid references auth.users(id) on delete set null;

create unique index if not exists students_auth_user_id_unique
on public.students(auth_user_id)
where auth_user_id is not null;

alter table public.students enable row level security;


-- -------------------------
-- PROFILES / ROLES
-- -------------------------
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'finance', 'student')),
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;


-- -------------------------
-- PAYMENTS
-- -------------------------
create table if not exists public.payments (
  id bigint generated always as identity primary key,
  student_id text not null,
  invoice_number text unique not null,
  description text,
  amount numeric(12,2) not null,
  payment_method text default 'WeChat QR',
  transaction_reference text,
  payment_proof_url text,
  verification_status text default 'Pending'
    check (
      verification_status in (
        'Pending',
        'Under Review',
        'Verified',
        'Rejected'
      )
    ),
  payment_date timestamptz,
  verified_at timestamptz,
  verified_by uuid references auth.users(id),
  receipt_reference text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.payments enable row level security;


-- -------------------------
-- DOCUMENTS
-- -------------------------
create table if not exists public.documents (
  id bigint generated always as identity primary key,
  student_id text not null,
  document_name text not null,
  document_type text,
  file_path text not null,
  uploaded_by uuid references auth.users(id),
  uploaded_at timestamptz default now(),
  is_active boolean default true
);

alter table public.documents enable row level security;


-- =========================================================
-- NOTES
-- =========================================================
-- Storage buckets are created in Supabase Storage UI:
-- 1. student-documents  (PRIVATE)
-- 2. payment-proofs     (PRIVATE)
--
-- Do not place Supabase service_role / secret keys in frontend code.
