-- Create replication user (if not exists)
DO
$$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles WHERE rolname = 'replicator'
   ) THEN
      CREATE ROLE replicator WITH REPLICATION LOGIN ENCRYPTED PASSWORD 'replicator_password';
   END IF;
END
$$;

-- Create replication slots
-- These must be created ONLY on primary and only once
SELECT * FROM pg_create_physical_replication_slot('replication_slot_1');
SELECT * FROM pg_create_physical_replication_slot('replication_slot_2');


-- Create application table
CREATE TABLE IF NOT EXISTS test_table (
    id SERIAL PRIMARY KEY,
    data TEXT
);

-- Insert dummy data
INSERT INTO test_table (data) VALUES
('Hello from primary!'),
('PostgreSQL is awesome'),
('Read replica testing'),
('Load balancing in action'),
('This is dummy row #5');

