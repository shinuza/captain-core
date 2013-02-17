CREATE TABLE posts (
  id serial UNIQUE,
  uuid VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  summary TEXT,
  body TEXT NOT NULL,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP,
  user_id INTEGER NOT NULL,
  CONSTRAINT posts_pkey PRIMARY KEY (id)
);
