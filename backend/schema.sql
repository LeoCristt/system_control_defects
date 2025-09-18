-- Create database
CREATE DATABASE defects_analysis;

-- Connect to the database
\c defects_analysis;

-- Create users table
CREATE TYPE user_role AS ENUM ('engineer', 'manager', 'leader');

CREATE TABLE "user" (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role user_role DEFAULT 'engineer'
);

-- Insert sample users with bcrypt hashed passwords
-- To generate a bcrypt hash for password 'admin123':
-- Use: node -e "const bcrypt = require('bcrypt'); bcrypt.hash('admin123', 10).then(console.log)"
-- Example hash for 'admin123': $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
INSERT INTO "user" (username, password, role) VALUES
('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'leader'),
('manager1', '$2a$10$example.hash.for.manager', 'manager'),
('engineer1', '$2a$10$example.hash.for.engineer', 'engineer');
