-- USERS
CREATE TABLE users (
    id TEXT PRIMARY KEY NOT NULL,
    username TEXT NOT NULL UNIQUE DEFAULT "",
    email TEXT NOT NULL UNIQUE DEFAULT "" 
) WITHOUT ROWID;

-- TODO LISTS
CREATE TABLE todo_lists (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL DEFAULT "",
    description TEXT DEFAULT NULL,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) WITHOUT ROWID;
		
-- PERMISSIONS
CREATE TABLE permissions (
    user_id TEXT NOT NULL,
    list_id TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'editor', 'viewer')),
    granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, list_id),
    FOREIGN KEY (list_id) REFERENCES todo_lists(id)
) WITHOUT ROWID;
    
-- TODOS
CREATE TABLE todos (
    id TEXT PRIMARY KEY NOT NULL,
    list_id TEXT,
    title TEXT,
    is_done INTEGER NOT NULL DEFAULT 0 CHECK (is_done IN (0, 1)),
    due_date DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (list_id) REFERENCES todo_lists(id)
) WITHOUT ROWID;