-- Allow single user to submit both perspectives by removing the different_partners constraint
ALTER TABLE public.situations DROP CONSTRAINT IF EXISTS different_partners;