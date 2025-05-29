-- TABLE: todo_lists
-- select:
todo_lists.id IN (
  SELECT list_id
  FROM permissions
  WHERE user_id = auth_userid()
    AND role IN ('owner', 'editor', 'viewer')
)
OR todo_lists.created_by = auth_userid()

-- insert:
NEW.created_by = auth_userid()

-- update:
OLD.id IN (
  SELECT list_id
  FROM permissions
  WHERE user_id = auth_userid()
    AND role IN ('owner')
)
OR OLD.created_by = auth_userid()

-- delete:
OLD.id IN (
  SELECT list_id
  FROM permissions
  WHERE user_id = auth_userid()
    AND role IN ('owner')
)
OR OLD.created_by = auth_userid()