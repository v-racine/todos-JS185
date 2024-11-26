CREATE TABLE todolists (
  id serial PRIMARY KEY,
  title text NOT NULL UNIQUE,
  username_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
);

CREATE TABLE todos (
  id serial PRIMARY KEY,
  title text NOT NULL,
  done boolean NOT NULL DEFAULT false,
  username_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  todolist_id integer
    NOT NULL
    REFERENCES todolists (id)
    ON DELETE CASCADE
);

CREATE TABLE users (
  id serial PRIMARY KEY, 
  username text NOT NULL,
  password text NOT NULL
);
