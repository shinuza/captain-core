CREATE TABLE users (
  id SERIAL,
  username VARCHAR(255) NOT NULL UNIQUE,
  password TEXT NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  email VARCHAR(255),
  image_url VARCHAR(255),
  is_staff BOOLEAN NOT NULL DEFAULT false,
  last_login TIMESTAMP,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);