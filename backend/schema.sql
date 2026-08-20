-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS sent_sms_logs CASCADE;
DROP TABLE IF EXISTS hospital_requests CASCADE;
DROP TABLE IF EXISTS warehouse_stock CASCADE;
DROP TABLE IF EXISTS blood_samples CASCADE;
DROP TABLE IF EXISTS donors CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users Table (system accounts)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'station', 'laboratory', 'warehouse', 'hospital')),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    entity_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Donors Table (Mock FAYDA Registry & Registered Donors)
CREATE TABLE donors (
    fayda_id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) UNIQUE NOT NULL,
    dob DATE NOT NULL,
    gender VARCHAR(20) NOT NULL,
    address VARCHAR(255) NOT NULL,
    blood_type VARCHAR(10) NOT NULL CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    last_donation_date DATE DEFAULT NULL,
    health_status VARCHAR(50) NOT NULL DEFAULT 'unknown' CHECK (health_status IN ('unknown', 'healthy', 'defective'))
);

-- 3. Blood Samples Table
CREATE TABLE blood_samples (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fayda_id VARCHAR(100) NOT NULL REFERENCES donors(fayda_id) ON DELETE CASCADE,
    blood_type VARCHAR(10) NOT NULL CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    status VARCHAR(50) NOT NULL DEFAULT 'collected' CHECK (status IN ('collected', 'pending_lab', 'validated', 'discarded')),
    health_notes TEXT DEFAULT NULL,
    station_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lab_id UUID REFERENCES users(id) ON DELETE SET NULL,
    collected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Warehouse Stock Table
CREATE TABLE warehouse_stock (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    warehouse_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blood_type VARCHAR(10) NOT NULL CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    UNIQUE(warehouse_id, blood_type)
);

-- 5. Hospital Requests Table
CREATE TABLE hospital_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blood_type VARCHAR(10) NOT NULL CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    units_needed INTEGER NOT NULL CHECK (units_needed > 0),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Sent SMS Logs Table (ensures 1 SMS per donation)
CREATE TABLE sent_sms_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(50) NOT NULL,
    blood_sample_id UUID NOT NULL UNIQUE REFERENCES blood_samples(id) ON DELETE CASCADE,
    message_type VARCHAR(50) NOT NULL CHECK (message_type IN ('encouragement', 'warning')),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- SEED DATA
-- ==========================================

-- Seed Admin User (Password is 'admin123' bcrypt hashed)
-- Hash: $2a$10$g3p0ohHefUm8IRmh3qwf6.g6T4qMRdkmy2aHa0SWuO5s1vr8LWr7q
INSERT INTO users (email, password_hash, role, status, entity_name) VALUES
('admin@bloodbank.org', '$2a$10$g3p0ohHefUm8IRmh3qwf6.g6T4qMRdkmy2aHa0SWuO5s1vr8LWr7q', 'admin', 'approved', 'Central Administration');

-- Seed Mock FAYDA Registry in the donors table
-- Note: Setting last_donation_date to simulate different eligibilities
INSERT INTO donors (fayda_id, name, phone, dob, gender, address, blood_type, last_donation_date, health_status) VALUES
('ET-001', 'Yonas Abebe', '+251911223344', '1990-05-15', 'Male', 'Bole, Addis Ababa', 'A+', '2025-01-10', 'healthy'),
('ET-002', 'Marta Kebede', '+251912345678', '1995-08-20', 'Female', 'Kazanchis, Addis Ababa', 'O-', '2026-07-25', 'healthy'),
('ET-003', 'Almaz Tolosa', '+251913456789', '1988-12-02', 'Female', 'Hawassa', 'B+', NULL, 'unknown'),
('ET-004', 'Bekele Lemma', '+251914567890', '1982-03-30', 'Male', 'Adama', 'AB+', '2024-11-05', 'healthy'),
('ET-005', 'Tsion Haile', '+251915678901', '1997-10-12', 'Female', 'Bahir Dar', 'O+', '2026-03-01', 'healthy'),
('ET-006', 'Samuel Negash', '+251916789012', '1992-06-18', 'Male', 'Mekelle', 'A-', NULL, 'unknown');

