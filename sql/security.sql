-- =========================================================
-- STUDENT PORTAL - RLS + STORAGE SECURITY POLICIES
-- Safe master policy file.
-- Existing policies are dropped first so this file can be rerun.
-- =========================================================


-- =========================================================
-- PROFILES
-- =========================================================

drop policy if exists "Users can read their own profile"
on public.profiles;

create policy "Users can read their own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = user_id);


-- =========================================================
-- STUDENTS
-- =========================================================

drop policy if exists "Authenticated users can read students"
on public.students;

drop policy if exists "Admins can read students"
on public.students;

drop policy if exists "Admins can add students"
on public.students;

drop policy if exists "Admins can update students"
on public.students;

drop policy if exists "Students can read own student record"
on public.students;


create policy "Admins can read students"
on public.students
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.user_id = auth.uid()
      and profiles.role = 'admin'
  )
);


create policy "Admins can add students"
on public.students
for insert
to authenticated
with check (
  exists (
    select 1
    from public.profiles
    where profiles.user_id = auth.uid()
      and profiles.role = 'admin'
  )
);


create policy "Admins can update students"
on public.students
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.user_id = auth.uid()
      and profiles.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.user_id = auth.uid()
      and profiles.role = 'admin'
  )
);


create policy "Students can read own student record"
on public.students
for select
to authenticated
using (
  auth_user_id = auth.uid()
);


-- =========================================================
-- PAYMENTS
-- =========================================================

drop policy if exists "Admins can read payments"
on public.payments;

drop policy if exists "Admins can add payments"
on public.payments;

drop policy if exists "Admins can update payments"
on public.payments;

drop policy if exists "Students can read own payments"
on public.payments;


create policy "Admins can read payments"
on public.payments
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.user_id = auth.uid()
      and profiles.role = 'admin'
  )
);


create policy "Admins can add payments"
on public.payments
for insert
to authenticated
with check (
  exists (
    select 1
    from public.profiles
    where profiles.user_id = auth.uid()
      and profiles.role = 'admin'
  )
);


create policy "Admins can update payments"
on public.payments
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.user_id = auth.uid()
      and profiles.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.user_id = auth.uid()
      and profiles.role = 'admin'
  )
);


create policy "Students can read own payments"
on public.payments
for select
to authenticated
using (
  student_id = (
    select s.student_id
    from public.students s
    where s.auth_user_id = auth.uid()
    limit 1
  )
);


-- =========================================================
-- DOCUMENTS TABLE
-- =========================================================

drop policy if exists "Admins can read documents"
on public.documents;

drop policy if exists "Admins can add documents"
on public.documents;

drop policy if exists "Admins can update documents"
on public.documents;

drop policy if exists "Students can read own documents"
on public.documents;


create policy "Admins can read documents"
on public.documents
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.user_id = auth.uid()
      and profiles.role = 'admin'
  )
);


create policy "Admins can add documents"
on public.documents
for insert
to authenticated
with check (
  exists (
    select 1
    from public.profiles
    where profiles.user_id = auth.uid()
      and profiles.role = 'admin'
  )
);


create policy "Admins can update documents"
on public.documents
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.user_id = auth.uid()
      and profiles.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.user_id = auth.uid()
      and profiles.role = 'admin'
  )
);


create policy "Students can read own documents"
on public.documents
for select
to authenticated
using (
  student_id = (
    select s.student_id
    from public.students s
    where s.auth_user_id = auth.uid()
    limit 1
  )
);


-- =========================================================
-- STORAGE: student-documents
-- =========================================================

drop policy if exists "Admins can read student documents"
on storage.objects;

drop policy if exists "Admins can upload student documents"
on storage.objects;

drop policy if exists "Admins can update student documents"
on storage.objects;

drop policy if exists "Admins can delete student documents"
on storage.objects;

drop policy if exists "Students can read own stored documents"
on storage.objects;


create policy "Admins can read student documents"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'student-documents'
  and exists (
    select 1
    from public.profiles
    where profiles.user_id = auth.uid()
      and profiles.role = 'admin'
  )
);


create policy "Admins can upload student documents"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'student-documents'
  and exists (
    select 1
    from public.profiles
    where profiles.user_id = auth.uid()
      and profiles.role = 'admin'
  )
);


create policy "Admins can update student documents"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'student-documents'
  and exists (
    select 1
    from public.profiles
    where profiles.user_id = auth.uid()
      and profiles.role = 'admin'
  )
)
with check (
  bucket_id = 'student-documents'
  and exists (
    select 1
    from public.profiles
    where profiles.user_id = auth.uid()
      and profiles.role = 'admin'
  )
);


create policy "Admins can delete student documents"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'student-documents'
  and exists (
    select 1
    from public.profiles
    where profiles.user_id = auth.uid()
      and profiles.role = 'admin'
  )
);


create policy "Students can read own stored documents"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'student-documents'
  and (storage.foldername(name))[1] = (
    select s.student_id
    from public.students s
    where s.auth_user_id = auth.uid()
    limit 1
  )
);


-- =========================================================
-- STORAGE: payment-proofs
-- =========================================================

drop policy if exists "Students can upload own payment proofs"
on storage.objects;

drop policy if exists "Students can read own payment proofs"
on storage.objects;

drop policy if exists "Admins can read payment proofs"
on storage.objects;

drop policy if exists "Admins can delete payment proofs"
on storage.objects;


create policy "Students can upload own payment proofs"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'payment-proofs'
  and (storage.foldername(name))[1] = (
    select s.student_id
    from public.students s
    where s.auth_user_id = auth.uid()
    limit 1
  )
);


create policy "Students can read own payment proofs"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'payment-proofs'
  and (storage.foldername(name))[1] = (
    select s.student_id
    from public.students s
    where s.auth_user_id = auth.uid()
    limit 1
  )
);


create policy "Admins can read payment proofs"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'payment-proofs'
  and exists (
    select 1
    from public.profiles
    where profiles.user_id = auth.uid()
      and profiles.role = 'admin'
  )
);


create policy "Admins can delete payment proofs"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'payment-proofs'
  and exists (
    select 1
    from public.profiles
    where profiles.user_id = auth.uid()
      and profiles.role = 'admin'
  )
);


-- =========================================================
-- IMPORTANT
-- =========================================================
-- Keep both Storage buckets PRIVATE.
-- Never store card numbers, CVVs, OTPs, passwords or banking credentials.

-- =========================================================
-- SECURE PAYMENT PROOF SUBMISSION RPC
-- Students do NOT receive direct UPDATE access to payments.
-- This function only permits updating proof-related fields
-- on the signed-in student's own non-verified payment.
-- =========================================================

create or replace function public.submit_payment_proof(
  p_payment_id bigint,
  p_transaction_reference text,
  p_payment_proof_url text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student_id text;
begin
  select s.student_id
  into v_student_id
  from public.students s
  where s.auth_user_id = auth.uid()
  limit 1;

  if v_student_id is null then
    raise exception 'Student account is not linked to a student record';
  end if;

  if p_transaction_reference is null
     or btrim(p_transaction_reference) = '' then
    raise exception 'Transaction reference is required';
  end if;

  if p_payment_proof_url is null
     or btrim(p_payment_proof_url) = '' then
    raise exception 'Payment proof path is required';
  end if;

  if p_payment_proof_url not like v_student_id || '/%' then
    raise exception 'Invalid payment proof path';
  end if;

  if not exists (
    select 1
    from public.payments p
    where p.id = p_payment_id
      and p.student_id = v_student_id
      and p.verification_status <> 'Verified'
  ) then
    raise exception 'Payment not found or cannot be modified';
  end if;

  update public.payments
  set
    transaction_reference = btrim(p_transaction_reference),
    payment_proof_url = p_payment_proof_url,
    verification_status = 'Under Review',
    payment_date = now(),
    verified_at = null,
    verified_by = null,
    updated_at = now()
  where id = p_payment_id
    and student_id = v_student_id;
end;
$$;

revoke all
on function public.submit_payment_proof(bigint, text, text)
from public;

grant execute
on function public.submit_payment_proof(bigint, text, text)
to authenticated;

