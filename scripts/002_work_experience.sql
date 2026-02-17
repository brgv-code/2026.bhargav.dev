-- Work experience master records
CREATE TABLE IF NOT EXISTS work_experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  period TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT work_experiences_unique_role UNIQUE (title, company, period)
);

-- Bullet points for each work experience, with optional links
CREATE TABLE IF NOT EXISTS work_experience_bullets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID NOT NULL REFERENCES work_experiences(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  href TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT work_experience_bullets_unique_bullet UNIQUE (experience_id, sort_order)
);

-- Seed data copied from https://bhargav.dev/about (Work Experience)

-- App Developer — Foundamental gmBh
INSERT INTO work_experiences (title, company, period, sort_order)
VALUES ('App Developer', 'Foundamental gmBh', 'March 2023 - March 2025', 1)
ON CONFLICT (title, company, period) DO NOTHING;

INSERT INTO work_experience_bullets (experience_id, label, sort_order)
SELECT id, 'My work mainly involves around Loura, internal CRM tool. I work on the frontend with Nextjs, Typescript, GraphQL, NestJS. Backend with Edgedb. For automation I use n8n hosted on onsite server. Loura is deployed on GCP with Kubernetes.', 1
FROM work_experiences
WHERE title = 'App Developer'
  AND company = 'Foundamental gmBh'
  AND period = 'March 2023 - March 2025'
ON CONFLICT (experience_id, sort_order) DO NOTHING;

INSERT INTO work_experience_bullets (experience_id, label, sort_order)
SELECT id, 'I use Python for data science related projects which help scrape data for startups and feed into our existing applications.', 2
FROM work_experiences
WHERE title = 'App Developer'
  AND company = 'Foundamental gmBh'
  AND period = 'March 2023 - March 2025'
ON CONFLICT (experience_id, sort_order) DO NOTHING;

-- Fullstack Dev(student) — Fraunhofer IOSB
INSERT INTO work_experiences (title, company, period, sort_order)
VALUES ('Fullstack Dev(student)', 'Fraunhofer IOSB', 'March 2022 - March 2023', 2)
ON CONFLICT (title, company, period) DO NOTHING;

INSERT INTO work_experience_bullets (experience_id, label, sort_order)
SELECT id, 'I worked on the frontend for state gas pipeline data using VueJs with Vite, dynamically rendering drawio diagrams. Created a headless service to process diagrams and map data to SVG parts, and deployed it in a Docker container. Using InfluxDB and Graphana, enabling real-time data visualization as part of a larger project to monitor and adjust heat consumption from the pipelines.', 1
FROM work_experiences
WHERE title = 'Fullstack Dev(student)'
  AND company = 'Fraunhofer IOSB'
  AND period = 'March 2022 - March 2023'
ON CONFLICT (experience_id, sort_order) DO NOTHING;

-- Software Engineer — Accenture, India
INSERT INTO work_experiences (title, company, period, sort_order)
VALUES ('Software Engineer', 'Accenture, India', 'June 2017 - October 2021', 3)
ON CONFLICT (title, company, period) DO NOTHING;

INSERT INTO work_experience_bullets (experience_id, label, sort_order)
SELECT id, 'I joined Accenture as a fresher out of college. I graduated with an Electronics degree and had just five days to join the company. I worked for over 4.5 years with technologies like Angular, SQL, Katalon, Shellscript and a few more.', 1
FROM work_experiences
WHERE title = 'Software Engineer'
  AND company = 'Accenture, India'
  AND period = 'June 2017 - October 2021'
ON CONFLICT (experience_id, sort_order) DO NOTHING;

