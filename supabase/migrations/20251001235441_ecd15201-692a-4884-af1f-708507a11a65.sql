-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  partner_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR auth.uid() = partner_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create situations table for storing couple's POVs
CREATE TABLE public.situations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id_1 UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  couple_id_2 UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  person1_pov TEXT NOT NULL,
  person2_pov TEXT NOT NULL,
  ai_analysis TEXT,
  ai_verdict TEXT,
  ai_solution TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT different_partners CHECK (couple_id_1 != couple_id_2)
);

-- Enable RLS
ALTER TABLE public.situations ENABLE ROW LEVEL SECURITY;

-- Situations policies
CREATE POLICY "Couples can view their situations"
  ON public.situations FOR SELECT
  USING (auth.uid() = couple_id_1 OR auth.uid() = couple_id_2);

CREATE POLICY "Couples can create situations"
  ON public.situations FOR INSERT
  WITH CHECK (auth.uid() = couple_id_1 OR auth.uid() = couple_id_2);

CREATE POLICY "Couples can update their situations"
  ON public.situations FOR UPDATE
  USING (auth.uid() = couple_id_1 OR auth.uid() = couple_id_2);

-- Create analytics table for tracking behavior patterns
CREATE TABLE public.couple_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id_1 UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  couple_id_2 UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  period_type TEXT NOT NULL CHECK (period_type IN ('weekly', 'monthly')),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  total_situations INT DEFAULT 0,
  person1_right_count INT DEFAULT 0,
  person2_right_count INT DEFAULT 0,
  common_themes TEXT[],
  behavior_insights TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.couple_analytics ENABLE ROW LEVEL SECURITY;

-- Analytics policies
CREATE POLICY "Couples can view their analytics"
  ON public.couple_analytics FOR SELECT
  USING (auth.uid() = couple_id_1 OR auth.uid() = couple_id_2);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();