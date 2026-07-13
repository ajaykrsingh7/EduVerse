/**
  run:  node config/migrate.js
  Creates (or re-creates) every table needed by Eduverse.
 */
require("dotenv").config();
const mysql = require("mysql2/promise");

const DB_NAME = process.env.DB_NAME || "eduvi";

const tables = [
  //  users 
  `CREATE TABLE IF NOT EXISTS users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    full_name   VARCHAR(150) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    role        ENUM('student','mentor','admin') NOT NULL DEFAULT 'student',
    avatar      VARCHAR(500) DEFAULT NULL,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  //  mentors 
  `CREATE TABLE IF NOT EXISTS mentors (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    user_id        INT NOT NULL UNIQUE,
    title          VARCHAR(200) DEFAULT 'Founder & Mentor',
    bio            TEXT,
    certification  TEXT,
    experience     INT DEFAULT 0,
    graduated      TINYINT(1) DEFAULT 0,
    category       ENUM('Kindergarten','High School','College','Technology','All') DEFAULT 'All',
    rating         DECIMAL(3,2) DEFAULT 0.00,
    total_reviews  INT DEFAULT 0,
    total_courses  INT DEFAULT 0,
    is_approved    TINYINT(1) DEFAULT 0,
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  //  mentor_languages 
  `CREATE TABLE IF NOT EXISTS mentor_languages (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    mentor_id  INT NOT NULL,
    language   VARCHAR(100) NOT NULL,
    FOREIGN KEY (mentor_id) REFERENCES mentors(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  //  mentor_socials 
  `CREATE TABLE IF NOT EXISTS mentor_socials (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    mentor_id  INT NOT NULL UNIQUE,
    facebook   VARCHAR(300) DEFAULT NULL,
    instagram  VARCHAR(300) DEFAULT NULL,
    twitter    VARCHAR(300) DEFAULT NULL,
    linkedin   VARCHAR(300) DEFAULT NULL,
    FOREIGN KEY (mentor_id) REFERENCES mentors(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  //  courses 
  `CREATE TABLE IF NOT EXISTS courses (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    title        VARCHAR(300) NOT NULL,
    description  TEXT,
    category     ENUM('Kindergarten','High School','College','Computer','Science','Engineering') NOT NULL,
    standard     VARCHAR(100) DEFAULT NULL,
    price        DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    thumbnail    VARCHAR(500) DEFAULT NULL,
    mentor_id    INT NOT NULL,
    duration     VARCHAR(100) DEFAULT NULL,
    lessons      INT DEFAULT 0,
    quizzes      INT DEFAULT 0,
    has_cert     TINYINT(1) DEFAULT 0,
    language     VARCHAR(100) DEFAULT 'English',
    access       ENUM('Lifetime','Limited') DEFAULT 'Lifetime',
    rating       DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    is_published  TINYINT(1) DEFAULT 0,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (mentor_id) REFERENCES mentors(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  //  course_playlist 
  `CREATE TABLE IF NOT EXISTS course_playlist (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    course_id   INT NOT NULL,
    title       VARCHAR(300) NOT NULL,
    duration    VARCHAR(20) DEFAULT '0:00',
    sort_order  INT DEFAULT 0,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  // ── course_learnings ────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS course_learnings (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    course_id  INT NOT NULL,
    point      TEXT NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  // ── enrollments ─────────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS enrollments (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    user_id      INT NOT NULL,
    course_id    INT NOT NULL,
    enrolled_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_enrollment (user_id, course_id),
    FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  // ── reviews ─────────────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS reviews (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    course_id   INT,
    mentor_id   INT,
    rating      TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment     TEXT,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (mentor_id) REFERENCES mentors(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  // ── books ───────────────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS books (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(300) NOT NULL,
    author      VARCHAR(200) DEFAULT NULL,
    category    ENUM('Kindergarten','High School','College','All') DEFAULT 'All',
    price       DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    cover_image VARCHAR(500) DEFAULT NULL,
    rating      DECIMAL(3,2) DEFAULT 0.00,
    is_new      TINYINT(1) DEFAULT 0,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  // ── pricing_plans ───────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS pricing_plans (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    name             ENUM('basic','standard','premium') NOT NULL UNIQUE,
    price            DECIMAL(10,2) NOT NULL,
    hd_lessons       INT DEFAULT 0,
    official_exams   INT DEFAULT 0,
    practice_questions INT DEFAULT 0,
    subscriptions    INT DEFAULT 1,
    free_books       INT DEFAULT 0,
    has_quizzes      TINYINT(1) DEFAULT 0,
    has_explanations TINYINT(1) DEFAULT 0,
    has_instructor   TINYINT(1) DEFAULT 0
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  // ── subscriptions ───────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS subscriptions (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    plan_id     INT NOT NULL,
    starts_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at  DATETIME NOT NULL,
    is_active   TINYINT(1) DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES pricing_plans(id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  // ── newsletter ───────────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS newsletter (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    email       VARCHAR(255) NOT NULL UNIQUE,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  // ── instructor_applications ──────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS instructor_applications (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    status      ENUM('pending','approved','rejected') DEFAULT 'pending',
    applied_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    reviewed_at DATETIME DEFAULT NULL,
    notes       TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  //Cart table
  `CREATE TABLE IF NOT EXISTS orders (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  total_amount  DECIMAL(10,2) NOT NULL,
  status        ENUM('pending','paid','failed') DEFAULT 'pending',
  payment_ref   VARCHAR(100) DEFAULT NULL,
  paid_at       DATETIME DEFAULT NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  `CREATE TABLE IF NOT EXISTS order_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  order_id    INT NOT NULL,
  item_type   ENUM('course','book','plan') NOT NULL,
  item_id     INT NOT NULL,
  title       VARCHAR(300) NOT NULL,
  price       DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  // ── course_chapters (free readable content) ──────────────────────────────────
  `CREATE TABLE IF NOT EXISTS course_chapters (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  course_id   INT NOT NULL,
  title       VARCHAR(300) NOT NULL,
  sort_order  INT DEFAULT 0,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  // ── chapter_lessons (each lesson inside a chapter) ────────────────────────────
  `CREATE TABLE IF NOT EXISTS chapter_lessons (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  chapter_id   INT NOT NULL,
  title        VARCHAR(300) NOT NULL,
  content      LONGTEXT,
  code_example LONGTEXT,
  code_lang    VARCHAR(50) DEFAULT 'javascript',
  sort_order   INT DEFAULT 0,
  FOREIGN KEY (chapter_id) REFERENCES course_chapters(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  // ── chapter_quizzes ───────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS chapter_quizzes (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  chapter_id   INT NOT NULL,
  question     TEXT NOT NULL,
  option_a     VARCHAR(300) NOT NULL,
  option_b     VARCHAR(300) NOT NULL,
  option_c     VARCHAR(300) DEFAULT NULL,
  option_d     VARCHAR(300) DEFAULT NULL,
  correct      ENUM('a','b','c','d') NOT NULL,
  explanation  TEXT,
  FOREIGN KEY (chapter_id) REFERENCES course_chapters(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  // ── lesson_progress ───────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS lesson_progress (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  lesson_id   INT NOT NULL,
  completed   TINYINT(1) DEFAULT 1,
  completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_progress (user_id, lesson_id),
  FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES chapter_lessons(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  `ALTER TABLE courses ADD COLUMN  is_free TINYINT(1) DEFAULT 0`,
];

(async () => {
  try {
    console.log("Running migrations …");

    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
    });

    // 2️⃣ Create DB
    await conn.query(
      `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
    );
    console.log(`✔ Database '${DB_NAME}' ready`);

    await conn.end();

    // 3️⃣ Reconnect WITH DB
    const db = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: DB_NAME,
    });

    // 4️⃣ Run tables
    for (const sql of tables) {
      const tableName = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1];
      await db.query(sql);
      console.log(`✔ ${tableName}`);
    }

    console.log("All migrations completed.");
    await db.end();
  } catch (err) {
    console.error("Migration failed:", err.message);
  }
})();
