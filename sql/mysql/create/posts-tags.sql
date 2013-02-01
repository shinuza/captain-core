CREATE TABLE `posts_tags` (
  `tag_id` INTEGER NOT NULL,
  `post_id` INTEGER NOT NULL,
  PRIMARY KEY (`tag_id`, `post_id`)
);
