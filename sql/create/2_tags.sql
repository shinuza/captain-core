CREATE TABLE IF NOT EXISTS tags (
  id SERIAL UNIQUE,
  title character varying(255) NOT NULL,
  slug character varying(255) NOT NULL UNIQUE,
  CONSTRAINT tags_pkey PRIMARY KEY (id)
);