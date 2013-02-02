CREATE TABLE tokens (
  id SERIAL,
  token VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP,
  user_id INTEGER NOT NULL,
  CONSTRAINT tokens_pkey PRIMARY KEY (id)
);