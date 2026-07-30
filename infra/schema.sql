CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE organizations (id uuid PRIMARY KEY, name text NOT NULL, sector text, annual_revenue numeric, created_at timestamptz DEFAULT now());
CREATE TABLE assessments (id uuid PRIMARY KEY, organization_id uuid REFERENCES organizations(id), score int NOT NULL, risk text NOT NULL, created_at timestamptz DEFAULT now());
CREATE TABLE findings (id uuid PRIMARY KEY, assessment_id uuid REFERENCES assessments(id), title text NOT NULL, severity text NOT NULL, status text NOT NULL);
CREATE TABLE documents (id uuid PRIMARY KEY, organization_id uuid REFERENCES organizations(id), type text NOT NULL, status text NOT NULL, content text, embedding vector(1536), updated_at timestamptz DEFAULT now());
CREATE TABLE tasks (id uuid PRIMARY KEY, organization_id uuid REFERENCES organizations(id), title text NOT NULL, priority text NOT NULL, status text NOT NULL, due_date date);
