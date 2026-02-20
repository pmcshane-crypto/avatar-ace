ALTER TABLE public.profiles DROP CONSTRAINT profiles_avatar_type_check;

ALTER TABLE public.profiles ADD CONSTRAINT profiles_avatar_type_check CHECK (avatar_type IN ('fire', 'water', 'nature', 'chungloid', 'chicken-nugget', 'flarion', 'auarlis', 'teddy'));