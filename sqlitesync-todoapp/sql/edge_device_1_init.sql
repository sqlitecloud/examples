INSERT INTO users (id, username, email) VALUES
  ('018ecfc2-b2b0-7cc2-a9f0-987cef6b49f1', 'alice', 'alice@example.com');

INSERT INTO todo_lists (id, title, description, created_by) VALUES
  ('018ecfc3-c101-7cc5-a9f0-987cef6b49f4', 'Groceries', 'Weekly shopping list', '018ecfc2-b2b0-7cc2-a9f0-987cef6b49f1');
  
INSERT INTO todos (id, list_id, title, is_done) VALUES
  ('018ecfc4-d201-7cc7-a9f0-987cef6b49f6', '018ecfc3-c101-7cc5-a9f0-987cef6b49f4', 'Buy milk', 0),
  ('018ecfc4-d202-7cc8-a9f0-987cef6b49f7', '018ecfc3-c101-7cc5-a9f0-987cef6b49f4', 'Buy eggs', 0);
  
-- Alice owns Groceries list
INSERT INTO permissions (user_id, list_id, role) VALUES
  ('018ecfc2-b2b0-7cc2-a9f0-987cef6b49f1', '018ecfc3-c101-7cc5-a9f0-987cef6b49f4', 'owner');
-- Bob can view Groceries list
INSERT INTO permissions (user_id, list_id, role) VALUES
  ('018ecfc2-b2b1-7cc3-a9f0-987cef6b49f2', '018ecfc3-c101-7cc5-a9f0-987cef6b49f4', 'viewer');