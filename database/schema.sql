-- PharmaDNA Database Schema
-- PostgreSQL Database Setup

-- Create users table for role management
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    address VARCHAR(42) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'MANUFACTURER', 'DISTRIBUTOR', 'PHARMACY')),
    assigned_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index on address for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_address ON users(address);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Create drug_batches table for NFT/drug batch information
CREATE TABLE IF NOT EXISTS drug_batches (
    id SERIAL PRIMARY KEY,
    token_id BIGINT UNIQUE NOT NULL,
    batch_number VARCHAR(100) UNIQUE NOT NULL,
    drug_name VARCHAR(255) NOT NULL,
    manufacturer_address VARCHAR(42) NOT NULL,
    manufacture_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    quantity INTEGER NOT NULL,
    unit VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'MANUFACTURED' CHECK (status IN ('MANUFACTURED', 'IN_TRANSIT', 'IN_PHARMACY', 'SOLD')),
    ipfs_hash VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (manufacturer_address) REFERENCES users(address) ON DELETE CASCADE
);

-- Create index on token_id and batch_number
CREATE INDEX IF NOT EXISTS idx_drug_batches_token_id ON drug_batches(token_id);
CREATE INDEX IF NOT EXISTS idx_drug_batches_batch_number ON drug_batches(batch_number);
CREATE INDEX IF NOT EXISTS idx_drug_batches_status ON drug_batches(status);
CREATE INDEX IF NOT EXISTS idx_drug_batches_manufacturer ON drug_batches(manufacturer_address);

-- Create supply_chain_events table for tracking movement
CREATE TABLE IF NOT EXISTS supply_chain_events (
    id SERIAL PRIMARY KEY,
    batch_id INTEGER NOT NULL,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('MANUFACTURED', 'SHIPPED', 'RECEIVED', 'SOLD')),
    from_address VARCHAR(42),
    to_address VARCHAR(42),
    location VARCHAR(255),
    notes TEXT,
    transaction_hash VARCHAR(66),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (batch_id) REFERENCES drug_batches(id) ON DELETE CASCADE
);

-- Create index on batch_id for faster event lookups
CREATE INDEX IF NOT EXISTS idx_supply_chain_events_batch_id ON supply_chain_events(batch_id);
CREATE INDEX IF NOT EXISTS idx_supply_chain_events_type ON supply_chain_events(event_type);
CREATE INDEX IF NOT EXISTS idx_supply_chain_events_created_at ON supply_chain_events(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drug_batches_updated_at BEFORE UPDATE ON drug_batches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample admin user (optional, for testing)
-- INSERT INTO users (address, role) VALUES ('0x0000000000000000000000000000000000000000', 'ADMIN')
-- ON CONFLICT (address) DO NOTHING;
