-- TABLE: users
-- select:
users.id = auth_userid()

-- insert:
NEW.id = auth_userid()

-- update:
NEW.id = auth_userid() AND OLD.id = auth_userid()

-- delete:
OLD.id = auth_userid()