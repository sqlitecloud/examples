-- TABLE: permissions 
-- select:
list_id IN (
  SELECT list_id
  FROM permissions
  WHERE user_id = auth_userid()
)

-- insert:
NEW.list_id IN (
  SELECT list_id
  FROM permissions
  WHERE user_id = auth_userid()
    AND role IN ('owner')
) 
OR 
auth_userid() = (
    SELECT created_by 
    FROM todo_lists
    WHERE id = NEW.list_id
)

-- update:
NEW.list_id IN (
  SELECT list_id
  FROM permissions
  WHERE user_id = auth_userid()
    AND role IN ('owner')
) 
AND 
OLD.list_id IN (
  SELECT list_id
  FROM permissions
  WHERE user_id = auth_userid()
    AND role IN ('owner')
)

-- delete:
OLD.list_id IN (
  SELECT list_id
  FROM permissions
  WHERE user_id = auth_userid()
    AND role IN ('owner')
) 
OR OLD.user_id = auth_userid()