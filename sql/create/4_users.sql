CREATE TABLE IF NOT EXISTS users (
  id SERIAL UNIQUE,
  username VARCHAR(255) NOT NULL UNIQUE,
  password TEXT NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  email VARCHAR(255),
  image_url VARCHAR(255),
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);