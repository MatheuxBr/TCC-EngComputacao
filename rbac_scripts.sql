CREATE TABLE niveis_acesso (
    id_nivel INT AUTO_INCREMENT PRIMARY KEY,
    nome_nivel VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO niveis_acesso (nome_nivel) VALUES ('Admin'), ('Comum');

ALTER TABLE usuarios ADD COLUMN id_nivel INT;

UPDATE usuarios SET id_nivel = 2 WHERE id_nivel IS NULL;

ALTER TABLE usuarios MODIFY COLUMN id_nivel INT NOT NULL;
ALTER TABLE usuarios ADD CONSTRAINT fk_usuario_nivel FOREIGN KEY (id_nivel) REFERENCES niveis_acesso(id_nivel);
