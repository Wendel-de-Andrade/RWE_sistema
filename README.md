# RWE_sistema

## Banco de Dados

Nesse projeto utilizei o banco de dados postgreSQL e criei a seguinte tabela:

```postgreSQL
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    about_me TEXT,
    profile_pic VARCHAR(255),
    social_links JSONB
);
```

Para configurar o banco é preciso criar na pasta raiz o arquivo ".env.local" e colocar as informações do banco da seguinte forma:

```.env.local
DB_HOST=localhost
DB_USER=seu_usuario
DB_PASS=sua_senha
DB_NAME=seu_banco_de_dados
DB_PORT=543
```

## Backend

O projeto foi feito em Node então tenha certeza de ter o mesmo instalado em sua máquina

Após isso abra o CMD na raiz da pasta e instale as dependências necessárias usando

```bash
npm install
```
Para executar o server, rode o app.js

```bash
node .\app.js
```

Se tudo der certo a seguinte mensagem irá ser exibida
```bash
Servidor rodando na porta 3001
```

## Frontend

Acesse a pasta "frontend" e instale as dependências
```bash
npm install
```
Após isso inicie o server
```bash
start npm server
```
Tudo dando certo o projeto deve abrir na porta 3000
