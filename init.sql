CREATE TABLE api_key
(
    id serial PRIMARY KEY,
    api_key uuid NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now ()
);

CREATE TABLE question
(
    id serial PRIMARY KEY,
    question TEXT NOT NULL,
    topic SMALLINT NOT NULL,
    tokens TEXT NOT NULL,
    created_by INTEGER REFERENCES api_key (id)
);

INSERT INTO api_key (api_key) VALUES ('dbaeae2a-c663-4359-ae22-6496eafa1679');