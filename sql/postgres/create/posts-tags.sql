CREATE TABLE posts_tags (
  tag_id integer NOT NULL,
  post_id integer NOT NULL,
  CONSTRAINT posts_tags_pkey PRIMARY KEY (tag_id, post_id)
)
