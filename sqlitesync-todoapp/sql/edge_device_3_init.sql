INSERT INTO todo_lists (id, title, description, created_by) VALUES
  ('018ecfc3-c102-7cc6-a9f0-987cef6b49f5', 'Work Tasks', 'Project deadlines and notes', '018ecfc2-b2b2-7cc4-a9f0-987cef6b49f3');
INSERT INTO permissions (user_id, list_id, role) VALUES
  ('018ecfc2-b2b2-7cc4-a9f0-987cef6b49f3', '018ecfc3-c102-7cc6-a9f0-987cef6b49f5', 'owner');
INSERT INTO todos (id, list_id, title, is_done) VALUES
  ('018ecfc4-d203-7cc9-a9f0-987cef6b49f8', '018ecfc3-c102-7cc6-a9f0-987cef6b49f5', 'Finish Q1 report', 1),
  ('018ecfc4-d204-7cca-a9f0-987cef6b49f9', '018ecfc3-c102-7cc6-a9f0-987cef6b49f5', 'Prepare slides for meeting', 0);