const express = require('express');
const { Pool } = require('pg');
const app = express();
require('dotenv').config();
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

// Configuração do Swagger
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Produtos',
      version: '1.0.0',
      description: 'API para gerenciar produtos'
    },
    servers: [
      {
        url: 'https://api-node-sd7z.onrender.com'
      }
    ]
  },
  // Define os arquivos que conterão as anotações Swagger (no nosso caso, este arquivo)
  apis: ['./index.js']
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Middlewares para fazer o parse do corpo da requisição
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração de CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  next();
});

// Função para obter a conexão com o banco de dados
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
  });


/**
 * @swagger
 * /api/produto:
 *   get:
 *     summary: Lista todos os produtos
 *     description: Retorna uma lista de todos os produtos.
 *     responses:
 *       200:
 *         description: Lista de produtos.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Erro ao buscar os dados.
 */
app.get('/api/produto', (req, res) => {
  const connection = getDbConnection();
  connection.query('SELECT * FROM produto', (error, results) => {
    if (error) {
      console.error('Erro ao buscar dados:', error);
      res.status(500).send({ message: 'Erro ao buscar dados' });
    } else {
      res.send(results);
    }
    connection.end();
  });
});

/**
 * @swagger
 * /api/produto/{id}:
 *   get:
 *     summary: Busca um produto pelo ID
 *     description: Retorna um produto específico pelo ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do produto a ser buscado.
 *     responses:
 *       200:
 *         description: Produto encontrado.
 *       500:
 *         description: Erro ao buscar os dados.
 */
app.get('/api/produto/:id', (req, res) => {
  const connection = getDbConnection();
  connection.query('SELECT * FROM produto WHERE id = ?', [req.params.id], (error, results) => {
    if (error) {
      console.error('Erro ao buscar dados:', error);
      res.status(500).send({ message: 'Erro ao buscar dados' });
    } else {
      res.send(results);
    }
    connection.end();
  });
});

/**
 * @swagger
 * /api/produto:
 *   post:
 *     summary: Cria um novo produto
 *     description: Cria um novo produto com nome, quantidade, preço e imagem.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - quantidade
 *               - preco
 *               - imagem
 *             properties:
 *               nome:
 *                 type: string
 *                 description: Nome do produto.
 *               quantidade:
 *                 type: number
 *                 description: Quantidade do produto.
 *               preco:
 *                 type: number
 *                 description: Preço do produto.
 *               imagem:
 *                 type: string
 *                 description: URL da imagem do produto.
 *     responses:
 *       201:
 *         description: Produto criado com sucesso.
 *       400:
 *         description: Dados incompletos.
 *       500:
 *         description: Erro ao inserir os dados.
 */
app.post('/api/produto', (req, res) => {
  const { nome, quantidade, preco, imagem } = req.body;
  
  // Validação básica dos dados recebidos
  if (!nome || !quantidade || !preco || !imagem) {
    return res.status(400).json({ message: 'Dados incompletos. Informe nome, quantidade, preco e imagem.' });
  }
  
  const connection = getDbConnection();
  connection.query(
    'INSERT INTO produto (nome, quantidade, preco, imagem) VALUES (?, ?, ?, ?)',
    [nome, quantidade, preco, imagem],
    (error, results) => {
      connection.end();
      if (error) {
        console.error('Erro ao inserir dados:', error);
        return res.status(500).json({ message: 'Erro ao inserir dados' });
      }
      return res.status(201).json({ message: 'Dados inseridos com sucesso' });
    }
  );
});

/**
 * @swagger
 * /api/produto/{id}:
 *   put:
 *     summary: Atualiza um produto
 *     description: Atualiza um produto com nome, quantidade, preço e imagem.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do produto a ser atualizado.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - quantidade
 *               - preco
 *               - imagem
 *             properties:
 *               nome:
 *                 type: string
 *               quantidade:
 *                 type: number
 *               preco:
 *                 type: number
 *               imagem:
 *                 type: string
 *     responses:
 *       200:
 *         description: Produto atualizado com sucesso.
 *       400:
 *         description: Dados incompletos.
 *       500:
 *         description: Erro ao atualizar os dados.
 */
app.put('/api/produto/:id', (req, res) => {
  const { nome, quantidade, preco, imagem } = req.body;
  const connection = getDbConnection();
  connection.query(
    'UPDATE produto SET nome = ?, quantidade = ?, preco = ?, imagem = ? WHERE id = ?',
    [nome, quantidade, preco, imagem, req.params.id],
    (error, results) => {
      connection.end();
      if (error) {
        console.error('Erro ao atualizar dados:', error);
        return res.status(500).json({ message: 'Erro ao atualizar dados' });
      }
      return res.status(200).json({ message: 'Dados atualizados com sucesso' });
    }
  );
});

/**
 * @swagger
 * /api/produto/{id}:
 *   delete:
 *     summary: Exclui um produto
 *     description: Exclui um produto pelo ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do produto a ser excluído.
 *     responses:
 *       200:
 *         description: Produto excluído com sucesso.
 *       500:
 *         description: Erro ao excluir os dados.
 */
app.delete('/api/produto/:id', (req, res) => {
  const connection = getDbConnection();
  connection.query('DELETE FROM produto WHERE id = ?', [req.params.id], (error, results) => {
    connection.end();
    if (error) {
      console.error('Erro ao excluir dados:', error);
      return res.status(500).json({ message: 'Erro ao excluir dados' });
    }
    return res.status(200).json({ message: 'Dados excluídos com sucesso' });
  });
});

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
