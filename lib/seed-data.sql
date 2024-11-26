INSERT INTO todolists (id, title, username_id)
  VALUES (1, 'Work Todos', 1),
         (2, 'Home Todos', 1),
         (3, 'Additional Todos', 1),
         (4, 'social todos', 1);

-- Note: in the following statement, get the todo list IDs from
-- the todolists table. If the todo list IDs are 1, 2, 3, and 4, then our code
-- looks like this:
INSERT INTO todos (title, done, todolist_id, username_id)
  VALUES ('Get coffee', TRUE, 1, 1),
         ('Chat with co-workers', TRUE, 1, 1),
         ('Duck out of meeting', FALSE, 1, 1),
         ('Feed the cats', TRUE, 2, 1),
         ('Go to bed', TRUE, 2, 1),
         ('Buy milk', TRUE, 2, 1),
         ('Study for Launch School', TRUE, 2, 1),
         ('Go to Libby''s birthday party', FALSE, 4, 1);