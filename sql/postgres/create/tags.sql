CREATE TABLE tags (
  id SERIAL,
  title character varying(255) NOT NULL,
  slug character varying(255) NOT NULL,
  CONSTRAINT tags_pkey PRIMARY KEY (id),
  CONSTRAINT tags_slug_key UNIQUE (slug)
)