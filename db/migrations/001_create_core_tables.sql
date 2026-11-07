CREATE TABLE IF NOT EXISTS organisations (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY,
    organisation_id UUID NOT NULL REFERENCES organisations(id),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY,
    department_id UUID REFERENCES departments(id),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    experience_years INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    owner_id UUID REFERENCES employees(id),
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sprints (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id),
    name VARCHAR(255) NOT NULL,
    start_date DATE,
    end_date DATE,
    status VARCHAR(50),
    summary TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS issues (
    id UUID PRIMARY KEY,
    project_id UUID REFERENCES projects(id),
    key_ref VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(100),
    assignee_id UUID REFERENCES employees(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS source_records (
    id UUID PRIMARY KEY,
    project_id UUID REFERENCES projects(id),
    source_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    uri TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS knowledge_items (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    knowledge_type VARCHAR(100) NOT NULL,
    description TEXT,
    confidence_score DECIMAL(5,2),
    validation_status VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS knowledge_relations (
    id UUID PRIMARY KEY,
    source_item_id UUID REFERENCES knowledge_items(id),
    target_item_id UUID REFERENCES knowledge_items(id),
    relation_type VARCHAR(100) NOT NULL,
    confidence_score DECIMAL(5,2),
    is_confirmed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
