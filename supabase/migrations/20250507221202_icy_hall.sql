/*
  # Initial CRM Schema

  1. New Tables
    - `entity_types` - Stores user-defined entity types
    - `entity_records` - Stores entity records data
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create entity_types table
CREATE TABLE IF NOT EXISTS entity_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  icon text,
  fields jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, slug)
);

-- Create entity_records table
CREATE TABLE IF NOT EXISTS entity_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type_id uuid NOT NULL REFERENCES entity_types(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Create indexes
CREATE INDEX entity_types_user_id_idx ON entity_types(user_id);
CREATE INDEX entity_records_entity_type_id_idx ON entity_records(entity_type_id);
CREATE INDEX entity_records_user_id_idx ON entity_records(user_id);

-- Enable RLS
ALTER TABLE entity_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_records ENABLE ROW LEVEL SECURITY;

-- RLS policies for entity_types
CREATE POLICY "Users can create their own entity types"
  ON entity_types
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own entity types"
  ON entity_types
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own entity types"
  ON entity_types
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own entity types"
  ON entity_types
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS policies for entity_records
CREATE POLICY "Users can create their own entity records"
  ON entity_records
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own entity records"
  ON entity_records
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own entity records"
  ON entity_records
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own entity records"
  ON entity_records
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to automatically set user_id on insert
CREATE OR REPLACE FUNCTION set_auth_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id := auth.uid();
  NEW.created_by := auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically set user_id
CREATE TRIGGER set_entity_types_user_id
BEFORE INSERT ON entity_types
FOR EACH ROW
EXECUTE FUNCTION set_auth_user_id();

CREATE TRIGGER set_entity_records_user_id
BEFORE INSERT ON entity_records
FOR EACH ROW
EXECUTE FUNCTION set_auth_user_id();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_entity_types_timestamp
BEFORE UPDATE ON entity_types
FOR EACH ROW
EXECUTE FUNCTION update_modified_timestamp();

CREATE TRIGGER update_entity_records_timestamp
BEFORE UPDATE ON entity_records
FOR EACH ROW
EXECUTE FUNCTION update_modified_timestamp();