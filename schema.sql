-- =============================================
-- Chiyembekezo Database Schema (Clean Install)
-- =============================================

SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables (reverse dependency order)
DROP TABLE IF EXISTS admin_logs;
DROP TABLE IF EXISTS notification_logs;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS course_progress;
DROP TABLE IF EXISTS quiz_attempts;
DROP TABLE IF EXISTS quizzes;
DROP TABLE IF EXISTS user_achievements;
DROP TABLE IF EXISTS achievements;
DROP TABLE IF EXISTS reported_content;
DROP TABLE IF EXISTS post_bookmarks;
DROP TABLE IF EXISTS post_reactions;
DROP TABLE IF EXISTS forum_comments;
DROP TABLE IF EXISTS forum_posts;
DROP TABLE IF EXISTS forum_categories;
DROP TABLE IF EXISTS professional_availability;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS professionals;
DROP TABLE IF EXISTS resources;
DROP TABLE IF EXISTS articles;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS wellness_sessions;
DROP TABLE IF EXISTS relaxation_sounds;
DROP TABLE IF EXISTS meditations;
DROP TABLE IF EXISTS user_organizations;
DROP TABLE IF EXISTS organizations;
DROP TABLE IF EXISTS peer_support_requests;
DROP TABLE IF EXISTS volunteer_listeners;
DROP TABLE IF EXISTS safety_plans;
DROP TABLE IF EXISTS goals;
DROP TABLE IF EXISTS habit_logs;
DROP TABLE IF EXISTS sleep_logs;
DROP TABLE IF EXISTS gratitude_entries;
DROP TABLE IF EXISTS meditation_sessions; -- legacy table
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS assessment_results;
DROP TABLE IF EXISTS assessment_types;
DROP TABLE IF EXISTS journal_entries;
DROP TABLE IF EXISTS mood_entries;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS invitations;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS emergency_contacts;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================
-- Create database if not exists
-- =============================================
CREATE DATABASE IF NOT EXISTS chiyembekezo
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE chiyembekezo;

-- =============================================
-- Core Tables
-- =============================================

-- Users
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    is_professional BOOLEAN DEFAULT FALSE,
    role ENUM('user','admin','professional','volunteer','org_admin','listener') DEFAULT 'user',
    organization_id INT NULL,
    reset_token VARCHAR(255),
    reset_token_expires DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User profiles
CREATE TABLE profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    bio TEXT,
    location VARCHAR(255),
    district VARCHAR(100),
    city VARCHAR(100),
    occupation VARCHAR(100),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    preferred_language VARCHAR(20) DEFAULT 'en',
    preferences JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Mood entries
CREATE TABLE mood_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    mood_score INT CHECK (mood_score BETWEEN 1 AND 5),
    energy_level INT CHECK (energy_level BETWEEN 1 AND 5),
    sleep_hours DECIMAL(3,1),
    stress_level INT CHECK (stress_level BETWEEN 1 AND 5),
    water_intake INT,
    exercise_minutes INT,
    notes TEXT,
    recorded_at DATE DEFAULT (CURRENT_DATE),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY (user_id, recorded_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Journal entries
CREATE TABLE journal_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255),
    content TEXT,
    mood_at_entry INT CHECK (mood_at_entry BETWEEN 1 AND 5),
    is_private BOOLEAN DEFAULT TRUE,
    entry_date DATE DEFAULT (CURRENT_DATE),
    entry_type ENUM('free','guided','gratitude') DEFAULT 'free',
    word_count INT DEFAULT 0,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Goals
CREATE TABLE goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_date DATE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active','completed','archived')),
    progress INT DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Safety plans
CREATE TABLE safety_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    trusted_people TEXT,
    reasons_to_live TEXT,
    calming_things TEXT,
    emergency_contacts TEXT,
    safe_places TEXT,
    coping_skills TEXT,
    warning_signs TEXT,
    emergency_numbers TEXT,
    reasons_to_keep_going TEXT,
    calming_activities TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Habit logs
CREATE TABLE habit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    habit_type VARCHAR(50) CHECK (habit_type IN ('water','exercise','medication','reading','prayer','walk','journal','meditate')),
    value INT,
    logged_date DATE DEFAULT (CURRENT_DATE),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY (user_id, habit_type, logged_date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sleep logs
CREATE TABLE sleep_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    hours_slept DECIMAL(3,1),
    quality INT CHECK (quality BETWEEN 1 AND 5),
    notes TEXT,
    logged_date DATE DEFAULT (CURRENT_DATE),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY (user_id, logged_date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Gratitude entries
CREATE TABLE gratitude_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    entry_text TEXT NOT NULL,
    entry_date DATE DEFAULT (CURRENT_DATE),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Wellness sessions (breathing, meditation, grounding, timers)
CREATE TABLE wellness_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_type ENUM('breathing','meditation','grounding','timer') NOT NULL,
    session_name VARCHAR(100) NOT NULL,
    duration_seconds INT DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    mood_before INT CHECK (mood_before BETWEEN 1 AND 5),
    mood_after INT CHECK (mood_after BETWEEN 1 AND 5),
    details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Assessments
-- =============================================

CREATE TABLE assessment_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    scoring_guide JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE assessment_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    assessment_type_id INT NOT NULL,
    score INT NOT NULL,
    severity_level VARCHAR(50),
    recommendations TEXT,
    taken_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assessment_type_id) REFERENCES assessment_types(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Resources & Learning
-- =============================================

CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL, 
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT,
    excerpt TEXT,
    cover_image_url TEXT,
    author VARCHAR(255),
    category_id INT,
    is_published BOOLEAN DEFAULT FALSE,
    view_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    type VARCHAR(50) CHECK (type IN ('video','podcast','infographic','pdf','worksheet','course','interactive-lesson','article')),
    url TEXT,
    description TEXT,
    content TEXT,
    category_id INT,
    author VARCHAR(255),
    tags JSON,
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INT DEFAULT 0,
    like_count INT DEFAULT 0,
    duration_minutes INT,
    file_size VARCHAR(20),
    organization_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE quizzes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category_id INT,
    questions JSON NOT NULL,
    passing_score INT DEFAULT 70,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE quiz_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    quiz_id INT NOT NULL,
    score INT,
    passed BOOLEAN DEFAULT FALSE,
    answers JSON,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE course_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    resource_id INT NOT NULL,
    progress_percent INT DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    UNIQUE KEY (user_id, resource_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Gamification
-- =============================================

CREATE TABLE achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    category VARCHAR(50),
    criteria JSON NOT NULL,
    points INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    achievement_id INT NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
    UNIQUE KEY (user_id, achievement_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Professionals & Appointments
-- =============================================

CREATE TABLE professionals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    license_number VARCHAR(100),
    specialization VARCHAR(255),
    years_experience INT,
    clinic_name VARCHAR(255),
    clinic_address TEXT,
    district VARCHAR(100),
    city VARCHAR(100),
    is_verified BOOLEAN DEFAULT FALSE,
    consultation_fee DECIMAL(10,2),
    bio TEXT,
    languages JSON,
    available_days JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE professional_availability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    professional_id INT NOT NULL,
    day_of_week ENUM('monday','tuesday','wednesday','thursday','friday','saturday','sunday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_recurring BOOLEAN DEFAULT TRUE,
    specific_date DATE DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    professional_id INT NOT NULL,
    scheduled_time TIMESTAMP NOT NULL,
    duration_minutes INT DEFAULT 60,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending','confirmed','completed','cancelled','no_show')),
    meeting_type ENUM('video','audio','physical','chat') DEFAULT 'video',
    meeting_link TEXT,
    notes TEXT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    review TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Community Forum
-- =============================================

CREATE TABLE forum_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    slug VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE forum_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    category_id INT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    anonymous_display_name VARCHAR(100),
    is_pinned BOOLEAN DEFAULT FALSE,
    view_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES forum_categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE forum_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT,
    content TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    anonymous_display_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE post_reactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    reaction_type ENUM('like','love','support','insightful','helpful') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY (user_id, post_id, reaction_type),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE post_bookmarks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY (user_id, post_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE reported_content (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reporter_user_id INT NOT NULL,
    target_type ENUM('post','comment') NOT NULL,
    target_id INT NOT NULL,
    reason VARCHAR(255) NOT NULL,
    status ENUM('pending','reviewed','dismissed','action_taken') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    reviewed_by INT NULL,
    FOREIGN KEY (reporter_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Peer Support
-- =============================================

CREATE TABLE volunteer_listeners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    available_languages JSON,
    bio TEXT,
    is_online BOOLEAN DEFAULT FALSE,
    last_active TIMESTAMP,
    is_listener BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE peer_support_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    listener_id INT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending','accepted','completed','cancelled')),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (listener_id) REFERENCES volunteer_listeners(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Organizations
-- =============================================

CREATE TABLE organizations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    logo_url VARCHAR(500),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    address TEXT,
    type ENUM('ngo','school','university','company','hospital') DEFAULT 'ngo',
    domain VARCHAR(255) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT NOT NULL,
    org_admin_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (org_admin_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_organizations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    organization_id INT NOT NULL,
    role ENUM('member','admin') DEFAULT 'member',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    UNIQUE KEY (user_id, organization_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Messaging
-- =============================================

CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    professional_id INT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Applications & Invitations
-- =============================================

CREATE TABLE applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('professional','volunteer') NOT NULL,
    status ENUM('pending','approved','rejected') DEFAULT 'pending',
    message TEXT,
    qualifications TEXT,
    experience TEXT,
    specialization VARCHAR(255),
    license_number VARCHAR(100),
    languages JSON,
    availability TEXT,
    reviewed_by INT NULL,
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE invitations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    role ENUM('professional','volunteer','org_admin') NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    invited_by INT NOT NULL,
    status ENUM('pending','accepted','expired') DEFAULT 'pending',
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Wellness Content (Admin-managed)
-- =============================================

CREATE TABLE meditations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    duration INT NOT NULL,
    description TEXT,
    audio_url VARCHAR(500),
    image_url VARCHAR(500),
    narrator VARCHAR(100),
    background_sound VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE relaxation_sounds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(10),
    color VARCHAR(20),
    audio_url VARCHAR(500),
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Emergency Contacts
-- =============================================

CREATE TABLE emergency_contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    organization VARCHAR(255),
    district VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    contact_type VARCHAR(50) CHECK (contact_type IN ('hospital','police','helpline','counselor','ngo')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Notifications & Logs
-- =============================================

CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE notification_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    type ENUM('email','sms','push'),
    subject VARCHAR(255),
    message TEXT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE admin_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_user_id INT,
    actor_type ENUM('user','admin','professional','org_admin') DEFAULT 'user',
    actor_email VARCHAR(255),
    action TEXT,
    target_type VARCHAR(50),
    target_id INT,
    details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Sample Data
-- =============================================

INSERT INTO categories (name, slug, description) VALUES
('Anxiety', 'anxiety', 'Resources for managing anxiety and worry.'),
('Depression', 'depression', 'Resources for understanding and coping with depression.'),
('Sleep', 'sleep', 'Improve your sleep hygiene and rest.'),
('Stress', 'stress', 'Techniques to reduce and manage stress.'),
('Parenting', 'parenting', 'Support for parents and caregivers.'),
('Students', 'students', 'Mental wellness for students and exam stress.'),
('Self Care', 'self-care', 'Practices for self-care and wellbeing.'),
('Workplace', 'workplace', 'Mental health at work and burnout prevention.'),
('Financial Stress', 'financial-stress', 'Managing financial anxiety and pressure.'),
('Videos', 'videos', 'Mental health video content'),
('Podcasts', 'podcasts', 'Audio content for mental wellness'),
('PDFs', 'pdfs', 'Downloadable guides and worksheets'),
('Worksheets', 'worksheets', 'Interactive mental health exercises'),
('Courses', 'courses', 'Structured learning paths'),
('Interactive Lessons', 'interactive-lessons', 'Step-by-step guided learning'),
('Quizzes', 'quizzes', 'Mental health knowledge checks')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO resources (title, slug, type, description, category_id, is_published, view_count) VALUES
('Managing Anxiety', 'managing-anxiety', 'article', 'Learn practical techniques to reduce anxiety and regain calm.', (SELECT id FROM categories WHERE slug='anxiety' LIMIT 1), 1, 0),
('Understanding Depression', 'understanding-depression', 'article', 'What depression looks like and how to get help.', (SELECT id FROM categories WHERE slug='depression' LIMIT 1), 1, 0),
('Better Sleep Habits', 'better-sleep-habits', 'video', 'A guided meditation for restful sleep.', (SELECT id FROM categories WHERE slug='sleep' LIMIT 1), 1, 0),
('Stress Management Workbook', 'stress-management-workbook', 'pdf', 'Downloadable PDF with exercises to manage stress.', (SELECT id FROM categories WHERE slug='stress' LIMIT 1), 1, 0),
('Parenting Teens with Anxiety', 'parenting-teens-anxiety', 'article', 'Tips for supporting your teenager through anxiety.', (SELECT id FROM categories WHERE slug='parenting' LIMIT 1), 1, 0),
('Exam Stress Relief', 'exam-stress-relief', 'video', 'Quick breathing exercise for students during exams.', (SELECT id FROM categories WHERE slug='students' LIMIT 1), 1, 0)
ON DUPLICATE KEY UPDATE title = VALUES(title);

INSERT INTO achievements (name, description, icon, category, criteria, points) VALUES
('First Check-in', 'Completed your first mood check-in', '🌱', 'Mood', '{"action":"mood_checkin","count":1}', 10),
('Mood Tracker', 'Completed 7 mood check-ins', '📊', 'Mood', '{"action":"mood_checkin","count":7}', 20),
('Mood Master', 'Completed 30 mood check-ins', '📈', 'Mood', '{"action":"mood_checkin","count":30}', 50),
('First Journal', 'Wrote your first journal entry', '📖', 'Journal', '{"action":"journal","count":1}', 10),
('Journal Keeper', 'Wrote 10 journal entries', '📚', 'Journal', '{"action":"journal","count":10}', 30),
('Journal Master', 'Wrote 50 journal entries', '📕', 'Journal', '{"action":"journal","count":50}', 75),
('7-Day Streak', 'Maintained a 7-day mood streak', '🔥', 'Streak', '{"action":"streak","days":7}', 25),
('30-Day Streak', 'Maintained a 30-day mood streak', '💪', 'Streak', '{"action":"streak","days":30}', 50),
('100-Day Streak', 'Maintained a 100-day mood streak', '🏆', 'Streak', '{"action":"streak","days":100}', 100),
('Wellness Explorer', 'Completed your first wellness session', '🧘', 'Wellness', '{"action":"wellness","count":1}', 10),
('Wellness Enthusiast', 'Completed 10 wellness sessions', '🌟', 'Wellness', '{"action":"wellness","count":10}', 30),
('Wellness Champion', 'Completed 50 wellness sessions', '🏅', 'Wellness', '{"action":"wellness","count":50}', 75),
('Quiz Taker', 'Passed your first quiz', '📝', 'Learning', '{"action":"quiz_pass","count":1}', 15),
('Quiz Master', 'Passed 5 quizzes', '🎓', 'Learning', '{"action":"quiz_pass","count":5}', 40),
('Course Starter', 'Started your first course', '📚', 'Learning', '{"action":"course_start","count":1}', 10),
('Course Finisher', 'Completed your first course', '🎉', 'Learning', '{"action":"course_complete","count":1}', 30),
('Goal Setter', 'Created your first goal', '🎯', 'Goals', '{"action":"goal","count":1}', 10),
('Goal Achiever', 'Completed your first goal', '✅', 'Goals', '{"action":"goal_complete","count":1}', 25);

INSERT INTO meditations (title, category, duration, description, narrator) VALUES
('Quick Calm', 'Quick', 2, 'A fast reset for when you need immediate calm.', 'Female'),
('Relax', 'Relax', 5, 'Gentle guidance to release tension.', 'Male'),
('Sleep', 'Sleep', 10, 'Wind down for deep, restful sleep.', 'Female'),
('Stress Relief', 'Stress Relief', 15, 'Release stress and find your centre.', 'Male'),
('Anxiety Release', 'Anxiety', 15, 'Calm anxious thoughts with soothing guidance.', 'Female'),
('Gratitude', 'Gratitude', 10, 'Cultivate appreciation and positivity.', 'Male');

INSERT INTO relaxation_sounds (name, icon, color) VALUES
('Rain', '🌧', '#4a90d9'),
('Forest', '🌲', '#2d7d2d'),
('Ocean', '🌊', '#1e6f8f'),
('Fireplace', '🔥', '#b85a1a'),
('Night', '🌙', '#2c3e50'),
('Birds', '🐦', '#6a9fb5'),
('Piano', '🎹', '#8b6b4d'),
('White Noise', '🤍', '#a0a0a0');

-- =============================================
-- End of script
-- =============================================

-- Helper procedure to add column only if it doesn't exist
DELIMITER //
CREATE PROCEDURE AddColumnIfNotExists(
  IN tbl VARCHAR(64),
  IN col VARCHAR(64),
  IN colDef TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT * FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = tbl
      AND COLUMN_NAME = col
  ) THEN
    SET @sql = CONCAT('ALTER TABLE ', tbl, ' ADD COLUMN ', col, ' ', colDef);
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END//
DELIMITER ;

-- Now add each column safely
CALL AddColumnIfNotExists('applications', 'documents', 'JSON');
CALL AddColumnIfNotExists('applications', 'profession', 'VARCHAR(100)');
CALL AddColumnIfNotExists('applications', 'registration_body', 'VARCHAR(255)');
CALL AddColumnIfNotExists('applications', 'registration_number', 'VARCHAR(100)');
CALL AddColumnIfNotExists('applications', 'registration_expiry', 'DATE');
CALL AddColumnIfNotExists('applications', 'employer', 'VARCHAR(255)');
CALL AddColumnIfNotExists('applications', 'motivation', 'TEXT');
CALL AddColumnIfNotExists('applications', 'role_preference', 'VARCHAR(100)');

-- Clean up (optional)
DROP PROCEDURE IF EXISTS AddColumnIfNotExists;