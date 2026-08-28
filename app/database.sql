-- public.achievements definition

-- Drop table

-- DROP TABLE public.achievements;

CREATE TABLE public.achievements ( id uuid DEFAULT gen_random_uuid() NOT NULL, code varchar(100) NOT NULL, "name" varchar(255) NOT NULL, description text NULL, icon_url varchar(1000) NULL, achievement_type varchar(100) NULL, target_value int4 NULL, active bool DEFAULT true NOT NULL, CONSTRAINT achievements_code_key UNIQUE (code), CONSTRAINT achievements_pkey PRIMARY KEY (id));
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Table Policies

CREATE POLICY achievements_select ON public.achievements
 AS PERMISSIVE
 FOR SELECT
 TO anon
 USING ((active = true));


-- public.categories definition

-- Drop table

-- DROP TABLE public.categories;

CREATE TABLE public.categories ( id uuid DEFAULT gen_random_uuid() NOT NULL, "name" varchar(255) NOT NULL, code varchar(100) NOT NULL, description text NULL, icon varchar(500) NULL, active bool DEFAULT true NOT NULL, CONSTRAINT categories_code_key UNIQUE (code), CONSTRAINT categories_pkey PRIMARY KEY (id));
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Table Policies

CREATE POLICY categories_select ON public.categories
 AS PERMISSIVE
 FOR SELECT
 TO anon
 USING ((active = true));


-- public.users definition

-- Drop table

-- DROP TABLE public.users;

CREATE TABLE public.users ( id uuid DEFAULT gen_random_uuid() NOT NULL, email varchar(255) NOT NULL, password_hash varchar(255) NULL, status varchar(30) DEFAULT 'active'::character varying NOT NULL, last_login_at timestamptz NULL, created_at timestamptz DEFAULT now() NOT NULL, updated_at timestamptz DEFAULT now() NOT NULL, CONSTRAINT users_email_key UNIQUE (email), CONSTRAINT users_pkey PRIMARY KEY (id));

-- Table Triggers

create trigger trg_users_updated_at before
update
    on
    public.users for each row execute function set_updated_at();
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Table Policies

CREATE POLICY users_select_own ON public.users
 AS PERMISSIVE
 FOR SELECT
 TO authenticated
 USING ((id = auth.uid()));


-- public.media_files definition

-- Drop table

-- DROP TABLE public.media_files;

CREATE TABLE public.media_files ( id uuid DEFAULT gen_random_uuid() NOT NULL, user_id uuid NOT NULL, file_name varchar(255) NOT NULL, file_url varchar(1000) NULL, mime_type varchar(100) NULL, file_size int8 NULL, storage_path varchar(1000) NOT NULL, created_at timestamptz DEFAULT now() NOT NULL, CONSTRAINT chk_media_files_size CHECK (((file_size IS NULL) OR (file_size >= 0))), CONSTRAINT media_files_pkey PRIMARY KEY (id), CONSTRAINT fk_media_files_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE);
CREATE INDEX idx_media_files_user ON public.media_files USING btree (user_id);
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;

-- Table Policies

CREATE POLICY media_all_own ON public.media_files
 AS PERMISSIVE
 FOR ALL
 TO authenticated
 USING ((user_id = auth.uid()))
 WITH CHECK ((user_id = auth.uid()));


-- public.places definition

-- Drop table

-- DROP TABLE public.places;

CREATE TABLE public.places ( id uuid DEFAULT gen_random_uuid() NOT NULL, category_id uuid NOT NULL, "name" varchar(255) NOT NULL, description text NULL, province varchar(255) NULL, country varchar(255) NULL, latitude numeric(10, 7) NULL, longitude numeric(10, 7) NULL, address varchar(500) NULL, created_at timestamptz DEFAULT now() NOT NULL, updated_at timestamptz DEFAULT now() NOT NULL, CONSTRAINT chk_places_latitude CHECK (((latitude IS NULL) OR ((latitude >= ('-90'::integer)::numeric) AND (latitude <= (90)::numeric)))), CONSTRAINT chk_places_longitude CHECK (((longitude IS NULL) OR ((longitude >= ('-180'::integer)::numeric) AND (longitude <= (180)::numeric)))), CONSTRAINT places_pkey PRIMARY KEY (id), CONSTRAINT fk_places_category FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE RESTRICT ON UPDATE CASCADE);
CREATE INDEX idx_places_category ON public.places USING btree (category_id);
CREATE INDEX idx_places_location ON public.places USING btree (latitude, longitude);
CREATE INDEX idx_places_name ON public.places USING btree (name);

-- Table Triggers

create trigger trg_places_updated_at before
update
    on
    public.places for each row execute function set_updated_at();
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;

-- Table Policies

CREATE POLICY places_select ON public.places
 AS PERMISSIVE
 FOR SELECT
 TO anon
 USING (true);


-- public.search_histories definition

-- Drop table

-- DROP TABLE public.search_histories;

CREATE TABLE public.search_histories ( id uuid DEFAULT gen_random_uuid() NOT NULL, user_id uuid NOT NULL, input_media_id uuid NULL, place_id uuid NULL, confidence numeric(6, 5) NULL, search_type varchar(50) NULL, searched_at timestamptz DEFAULT now() NOT NULL, CONSTRAINT chk_search_confidence CHECK (((confidence IS NULL) OR ((confidence >= (0)::numeric) AND (confidence <= (1)::numeric)))), CONSTRAINT search_histories_pkey PRIMARY KEY (id), CONSTRAINT fk_search_history_media FOREIGN KEY (input_media_id) REFERENCES public.media_files(id) ON DELETE SET NULL ON UPDATE CASCADE, CONSTRAINT fk_search_history_place FOREIGN KEY (place_id) REFERENCES public.places(id) ON DELETE SET NULL ON UPDATE CASCADE, CONSTRAINT fk_search_history_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE);
CREATE INDEX idx_search_history_user ON public.search_histories USING btree (user_id);
ALTER TABLE public.search_histories ENABLE ROW LEVEL SECURITY;

-- Table Policies

CREATE POLICY search_history_all_own ON public.search_histories
 AS PERMISSIVE
 FOR ALL
 TO authenticated
 USING ((user_id = auth.uid()))
 WITH CHECK ((user_id = auth.uid()));


-- public.trips definition

-- Drop table

-- DROP TABLE public.trips;

CREATE TABLE public.trips ( id uuid DEFAULT gen_random_uuid() NOT NULL, user_id uuid NOT NULL, "name" varchar(255) NOT NULL, description text NULL, start_date date NULL, end_date date NULL, status varchar(50) NULL, created_at timestamptz DEFAULT now() NOT NULL, updated_at timestamptz DEFAULT now() NOT NULL, CONSTRAINT chk_trip_dates CHECK (((start_date IS NULL) OR (end_date IS NULL) OR (end_date >= start_date))), CONSTRAINT trips_pkey PRIMARY KEY (id), CONSTRAINT fk_trips_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE);

-- Table Triggers

create trigger trg_trips_updated_at before
update
    on
    public.trips for each row execute function set_updated_at();
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

-- Table Policies

CREATE POLICY trips_all_own ON public.trips
 AS PERMISSIVE
 FOR ALL
 TO authenticated
 USING ((user_id = auth.uid()))
 WITH CHECK ((user_id = auth.uid()));


-- public.user_achievements definition

-- Drop table

-- DROP TABLE public.user_achievements;

CREATE TABLE public.user_achievements ( id uuid DEFAULT gen_random_uuid() NOT NULL, user_id uuid NOT NULL, achievement_id uuid NOT NULL, unlocked_at timestamptz NULL, progress int4 DEFAULT 0 NOT NULL, CONSTRAINT uq_user_achievement UNIQUE (user_id, achievement_id), CONSTRAINT user_achievements_pkey PRIMARY KEY (id), CONSTRAINT fk_user_achievements_achievement FOREIGN KEY (achievement_id) REFERENCES public.achievements(id) ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT fk_user_achievements_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE);
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Table Policies

CREATE POLICY user_achievements_select_own ON public.user_achievements
 AS PERMISSIVE
 FOR SELECT
 TO authenticated
 USING ((user_id = auth.uid()));


-- public.user_favorites definition

-- Drop table

-- DROP TABLE public.user_favorites;

CREATE TABLE public.user_favorites ( id uuid DEFAULT gen_random_uuid() NOT NULL, user_id uuid NOT NULL, place_id uuid NOT NULL, display_order int4 DEFAULT 0 NOT NULL, created_at timestamptz DEFAULT now() NOT NULL, CONSTRAINT uq_user_favorites UNIQUE (user_id, place_id), CONSTRAINT user_favorites_pkey PRIMARY KEY (id), CONSTRAINT fk_favorites_place FOREIGN KEY (place_id) REFERENCES public.places(id) ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT fk_favorites_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE);
CREATE INDEX idx_favorites_place ON public.user_favorites USING btree (place_id);
CREATE INDEX idx_favorites_user ON public.user_favorites USING btree (user_id);
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Table Policies

CREATE POLICY favorites_all_own ON public.user_favorites
 AS PERMISSIVE
 FOR ALL
 TO authenticated
 USING ((user_id = auth.uid()))
 WITH CHECK ((user_id = auth.uid()));


-- public.user_notifications definition

-- Drop table

-- DROP TABLE public.user_notifications;

CREATE TABLE public.user_notifications ( id uuid DEFAULT gen_random_uuid() NOT NULL, user_id uuid NOT NULL, "type" varchar(100) NOT NULL, title varchar(255) NOT NULL, "content" text NULL, is_read bool DEFAULT false NOT NULL, read_at timestamptz NULL, created_at timestamptz DEFAULT now() NOT NULL, CONSTRAINT user_notifications_pkey PRIMARY KEY (id), CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE);
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

-- Table Policies

CREATE POLICY notifications_all_own ON public.user_notifications
 AS PERMISSIVE
 FOR ALL
 TO authenticated
 USING ((user_id = auth.uid()))
 WITH CHECK ((user_id = auth.uid()));


-- public.user_profiles definition

-- Drop table

-- DROP TABLE public.user_profiles;

CREATE TABLE public.user_profiles ( id uuid DEFAULT gen_random_uuid() NOT NULL, user_id uuid NOT NULL, full_name varchar(255) NULL, avatar_media_id uuid NULL, created_at timestamptz DEFAULT now() NOT NULL, updated_at timestamptz DEFAULT now() NOT NULL, CONSTRAINT user_profiles_pkey PRIMARY KEY (id), CONSTRAINT user_profiles_user_id_key UNIQUE (user_id), CONSTRAINT fk_user_profiles_avatar FOREIGN KEY (avatar_media_id) REFERENCES public.media_files(id) ON DELETE SET NULL ON UPDATE CASCADE, CONSTRAINT fk_user_profiles_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE);

-- Table Triggers

create trigger trg_user_profiles_updated_at before
update
    on
    public.user_profiles for each row execute function set_updated_at();
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Table Policies

CREATE POLICY profile_all_own ON public.user_profiles
 AS PERMISSIVE
 FOR ALL
 TO authenticated
 USING ((user_id = auth.uid()))
 WITH CHECK ((user_id = auth.uid()));


-- public.check_ins definition

-- Drop table

-- DROP TABLE public.check_ins;

CREATE TABLE public.check_ins ( id uuid DEFAULT gen_random_uuid() NOT NULL, user_id uuid NOT NULL, place_id uuid NOT NULL, latitude numeric(10, 7) NULL, longitude numeric(10, 7) NULL, checked_in_at timestamptz DEFAULT now() NOT NULL, CONSTRAINT check_ins_pkey PRIMARY KEY (id), CONSTRAINT chk_checkins_latitude CHECK (((latitude IS NULL) OR ((latitude >= ('-90'::integer)::numeric) AND (latitude <= (90)::numeric)))), CONSTRAINT chk_checkins_longitude CHECK (((longitude IS NULL) OR ((longitude >= ('-180'::integer)::numeric) AND (longitude <= (180)::numeric)))), CONSTRAINT fk_checkins_place FOREIGN KEY (place_id) REFERENCES public.places(id) ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT fk_checkins_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE);
CREATE INDEX idx_checkins_place ON public.check_ins USING btree (place_id);
CREATE INDEX idx_checkins_user ON public.check_ins USING btree (user_id);
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;

-- Table Policies

CREATE POLICY checkins_all_own ON public.check_ins
 AS PERMISSIVE
 FOR ALL
 TO authenticated
 USING ((user_id = auth.uid()))
 WITH CHECK ((user_id = auth.uid()));


-- public.gallery_items definition

-- Drop table

-- DROP TABLE public.gallery_items;

CREATE TABLE public.gallery_items ( id uuid DEFAULT gen_random_uuid() NOT NULL, user_id uuid NOT NULL, media_id uuid NOT NULL, place_id uuid NULL, note text NULL, taken_at timestamptz NULL, created_at timestamptz DEFAULT now() NOT NULL, updated_at timestamptz DEFAULT now() NOT NULL, CONSTRAINT gallery_items_pkey PRIMARY KEY (id), CONSTRAINT fk_gallery_media FOREIGN KEY (media_id) REFERENCES public.media_files(id) ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT fk_gallery_place FOREIGN KEY (place_id) REFERENCES public.places(id) ON DELETE SET NULL ON UPDATE CASCADE, CONSTRAINT fk_gallery_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE);
CREATE INDEX idx_gallery_place ON public.gallery_items USING btree (place_id);
CREATE INDEX idx_gallery_user ON public.gallery_items USING btree (user_id);

-- Table Triggers

create trigger trg_gallery_updated_at before
update
    on
    public.gallery_items for each row execute function set_updated_at();
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

-- Table Policies

CREATE POLICY gallery_all_own ON public.gallery_items
 AS PERMISSIVE
 FOR ALL
 TO authenticated
 USING ((user_id = auth.uid()))
 WITH CHECK ((user_id = auth.uid()));


-- public.place_images definition

-- Drop table

-- DROP TABLE public.place_images;

CREATE TABLE public.place_images ( id uuid DEFAULT gen_random_uuid() NOT NULL, place_id uuid NOT NULL, media_id uuid NOT NULL, is_primary bool DEFAULT false NOT NULL, display_order int4 DEFAULT 0 NOT NULL, created_at timestamptz DEFAULT now() NOT NULL, CONSTRAINT place_images_pkey PRIMARY KEY (id), CONSTRAINT fk_place_images_media FOREIGN KEY (media_id) REFERENCES public.media_files(id) ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT fk_place_images_place FOREIGN KEY (place_id) REFERENCES public.places(id) ON DELETE CASCADE ON UPDATE CASCADE);
CREATE INDEX idx_place_images_place ON public.place_images USING btree (place_id);
ALTER TABLE public.place_images ENABLE ROW LEVEL SECURITY;

-- Table Policies

CREATE POLICY place_images_select ON public.place_images
 AS PERMISSIVE
 FOR SELECT
 TO anon
 USING (true);


-- public.trip_places definition

-- Drop table

-- DROP TABLE public.trip_places;

CREATE TABLE public.trip_places ( id uuid DEFAULT gen_random_uuid() NOT NULL, trip_id uuid NOT NULL, place_id uuid NOT NULL, display_order int4 DEFAULT 0 NOT NULL, planned_at timestamptz NULL, note text NULL, CONSTRAINT trip_places_pkey PRIMARY KEY (id), CONSTRAINT uq_trip_place UNIQUE (trip_id, place_id), CONSTRAINT fk_trip_places_place FOREIGN KEY (place_id) REFERENCES public.places(id) ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT fk_trip_places_trip FOREIGN KEY (trip_id) REFERENCES public.trips(id) ON DELETE CASCADE ON UPDATE CASCADE);
CREATE INDEX idx_trip_places_place ON public.trip_places USING btree (place_id);
CREATE INDEX idx_trip_places_trip ON public.trip_places USING btree (trip_id);
ALTER TABLE public.trip_places ENABLE ROW LEVEL SECURITY;

-- Table Policies

CREATE POLICY trip_places_all_own ON public.trip_places
 AS PERMISSIVE
 FOR ALL
 TO authenticated
 USING ((EXISTS ( SELECT 1
   FROM trips
  WHERE ((trips.id = trip_places.trip_id) AND (trips.user_id = auth.uid())))))
 WITH CHECK ((EXISTS ( SELECT 1
   FROM trips
 WHERE ((trips.id = trip_places.trip_id) AND (trips.user_id = auth.uid())))));


-- Backend privileges required by Search History and prediction persistence.
-- The service-role key is backend-only and must never be exposed to clients.
GRANT USAGE ON SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.search_histories TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.media_files TO service_role;
GRANT SELECT ON TABLE public.places, public.place_images TO service_role;
