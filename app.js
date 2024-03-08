const cors = require('cors');
const express = require('express');
const multer = require('multer');
const path = require('path');
const pool = require('./db'); // Conexão com o banco de dados
const { resizeImage } = require('./utils/imageUtils'); // Função auxiliar para processamento de imagens
const fs = require('fs');

// Verifica se a pasta 'uploads' existe
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true }); // Cria a pasta se não existir
}

// Configuração do armazenamento de arquivos com Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Define o diretório de destino dos arquivos antes de serem processados
  },
  filename: function (req, file, cb) {
    // Gera um nome de arquivo único com a extensão original (Por padrão vem sem a extensão)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

const upload = multer({ storage: storage });

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Habilita o CORS para todas as rotas (Sem isso ocorre erro no navegador do cliente)
app.use(cors());

// Rota para criar um novo perfil de usuário
app.post('/profile', cors(), upload.single('profile_pic'), async (req, res) => {

  try {
    const { name, email, aboutMe, socialLinks } = req.body;

    if (!req.file) {
      throw new Error("Nenhum arquivo de imagem fornecido.");
    }

    // Processa a imagem e obtém o caminho da nova imagem
    const filePath = await resizeImage(req.file.path, 300, 300);

    // Função para inserir um perfil de usuário no banco de dados, agora dentro do escopo da rota
    async function insertUserProfile(name, email, aboutMe, profilePicPath, socialLinks) {
      const result = await pool.query(
        'INSERT INTO users (name, email, about_me, profile_pic, social_links) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, email, aboutMe, profilePicPath, socialLinks]
      );
      return result.rows[0];
    }

    // Insere o novo usuário no banco de dados utilizando a função definida dentro do escopo da rota
    const newUser = await insertUserProfile(name, email, aboutMe, filePath, JSON.stringify(socialLinks));

    // Retorna sucesso e os dados do novo usuário
    res.status(201).json({ message: "Perfil criado com sucesso!", user: newUser });
  } catch (error) {
    console.error("Erro ao criar perfil:", error.message);

    // Verifica se o erro é devido ao formato de imagem não suportado
    if (error.message.includes('unsupported image format')) {
      res.status(400).json({ error: "Formato de imagem não suportado." });
    } else {
      // Para outros erros, retorna uma mensagem genérica
      res.status(500).json({ error: "Erro ao criar perfil" });
    }
  }
});

// Rota para verificar a existência de um perfil pelo email
app.get('/profile/:email', cors(), async (req, res) => {
  try {
    const email = req.params.email;
    // Consulta o banco de dados para verificar a existência do email
    const queryResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    // Verifica se o email existe baseado na contagem de linhas
    const exists = queryResult.rowCount > 0;
    res.json({ exists });
  } catch (error) {
    console.error('Erro ao verificar o email', error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// Rota para buscar informações detalhadas de um perfil pelo email
app.get('/profile/info/:email', cors(), async (req, res) => {
  try {
    const email = req.params.email;
    // Executa a consulta no banco de dados
    const queryResult = await pool.query('SELECT name, email, about_me, profile_pic, social_links FROM users WHERE email = $1', [email]);
    if (queryResult.rowCount > 0) {
      // Se encontrou o usuário, retorna os dados
      const user = queryResult.rows[0];
      res.json(user);
    } else {
      res.status(404).json({ message: "Usuário não encontrado." });
    }
  } catch (error) {
    // Trata erros na busca por informações do usuário
    console.error('Erro ao buscar informações do usuário', error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// Rota para atualizar um perfil de usuário
app.put('/profile/update/:email', cors(), upload.single('profile_pic'), async (req, res) => {
  try {
    const userEmail = req.params.email;
    const { name, aboutMe, socialLinks } = req.body;
    let filePath;

    if (req.file) {
      try {
        // Processa a nova imagem, se fornecida
        filePath = await resizeImage(req.file.path, 300, 300);
      } catch (error) {
        // Verifica se o erro é específico para o formato da imagem
        if (error.message.includes('unsupported image format')) {
          return res.status(400).json({ error: "Formato de imagem não suportado." });
        } else {
          throw error;
        }
      }
    }

    const queryResult = await pool.query('SELECT profile_pic FROM users WHERE email = $1', [userEmail]);
    if (queryResult.rowCount === 0) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }
    const currentUserProfilePic = queryResult.rows[0].profile_pic;

    const updateQuery = `
      UPDATE users 
      SET 
        name = $1, 
        about_me = $2, 
        social_links = $3,
        profile_pic = $4
      WHERE email = $5
      RETURNING *;
    `;
    const values = [
      name,
      aboutMe,
      JSON.stringify(socialLinks),
      filePath || currentUserProfilePic,
      userEmail
    ];

    const updateResult = await pool.query(updateQuery, values);
    if (updateResult.rowCount > 0) {
      res.json({ message: "Perfil atualizado com sucesso!", user: updateResult.rows[0] });
    } else {
      res.status(404).json({ message: "Não foi possível atualizar o perfil." });
    }
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error.message);
    res.status(500).json({ message: "Erro ao atualizar perfil" });
  }
});

// Inicializa o servidor na porta especificada
app.listen(3001, () => console.log('Servidor rodando na porta 3001'));