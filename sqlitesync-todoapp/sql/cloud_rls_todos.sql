-- TABLE: todos
-- select:
todos.list_id IN (
  SELECT list_id
  FROM permissions
  WHERE user_id = auth_userid()
    AND role IN ('owner', 'editor', 'viewer')
  UNION 
  SELECT id AS list_id
  FROM todo_lists 
  WHERE created_by = auth_userid()
)

-- insert:
NEW.list_id IN (
  SELECT list_id
  FROM permissions
  WHERE user_id = auth_userid()
    AND role IN ('owner', 'editor')
  UNION 
  SELECT id AS list_id
  FROM todo_lists 
  WHERE created_by = auth_userid()
)

-- update:
NEW.list_id IN (
  SELECT list_id
  FROM permissions
  WHERE user_id = auth_userid()
    AND role IN ('owner', 'editor')
  UNION 
  SELECT id AS list_id
  FROM todo_lists 
  WHERE created_by = auth_userid()
) 
AND 
OLD.list_id IN (
  SELECT list_id
  FROM permissions
  WHERE user_id = auth_userid()
    AND role IN ('owner', 'editor')
  UNION 
  SELECT id AS list_id
  FROM todo_lists 
  WHERE created_by = auth_userid()
)

-- delete:
OLD.list_id IN (
  SELECT list_id
  FROM permissions
  WHERE user_id = auth_userid()
    AND role IN ('owner', 'editor')
  UNION 
  SELECT id AS list_id
  FROM todo_lists 
  WHERE created_by = auth_userid()
)