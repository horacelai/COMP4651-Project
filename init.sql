CREATE TABLE account
(
    id serial PRIMARY KEY,
    username VARCHAR (50) UNIQUE NOT NULL,
    password VARCHAR (200) NOT NULL
);

CREATE TABLE question
(
    id serial PRIMARY KEY,
    question TEXT NOT NULL,
    topic SMALLINT NOT NULL
);

CREATE TABLE vote
(
    id serial PRIMARY KEY,
    created_by integer NOT NULL REFERENCES account (id) ON DELETE CASCADE,
    question_id integer NOT NULL REFERENCES question (id) ON DELETE CASCADE
);

INSERT INTO account (username, password) VALUES ('admin', '$2y$12$21x2epIAPEkeEqgWdNPARerIifsNv0UIdbHH6vYp
/Uk/osvP4ZzJq');