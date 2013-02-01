CREATE TABLE `posts` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `uuid` VARCHAR(50) NOT NULL UNIQUE,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `summary` TEXT,
  `body` TEXT NOT NULL,
  `published` BOOLEAN NOT NULL DEFAULT false,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME,
  `UserId` INTEGER
);
