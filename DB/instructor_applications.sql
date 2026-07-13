CREATE TABLE IF NOT EXISTS instructor_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  user_id INT NOT NULL,
  
  status ENUM('pending','approved','rejected') 
    NOT NULL DEFAULT 'pending',

  -- Professional info
  profession VARCHAR(200),
  experience_years INT DEFAULT 0,
  education VARCHAR(300),
  specialization VARCHAR(300),
  bio TEXT,
  website VARCHAR(300),
  linkedin VARCHAR(300),
  youtube VARCHAR(300),

  -- Teaching info
  teach_categories VARCHAR(500),
  course_ideas TEXT,
  hours_per_week INT DEFAULT 0,
  languages VARCHAR(200),

  -- Agreement
  agreed_terms BOOLEAN DEFAULT FALSE,

  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP NULL DEFAULT NULL,
  admin_notes TEXT,

  -- Index for better performance
  INDEX idx_user_id (user_id),

  -- Foreign key constraint
  CONSTRAINT fk_instructor_user
    FOREIGN KEY (user_id) 
    REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ;