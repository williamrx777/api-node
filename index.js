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

// Middlewares para parse do corpo da requisição
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

// Configuração do Pool do PostgreSQL utilizando a connection string fornecida
const pool = new Pool({
  connectionString: "postgresql://api_2yip_user:f86s57kEqc7XE7fyE6HJm9KitNBC7edZ@dpg-cujuq0bv2p9s7387506g-a.oregon-postgres.render.com/api_2yip",
  ssl: {
    rejectUnauthorized: false  // Permite conexão mesmo sem certificado verificado
  }
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
app.get('/api/produto', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM produto');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).json({ message: 'Erro ao buscar dados' });
  }
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
app.get('/api/produto/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM produto WHERE id = $1', [req.params.id]);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).json({ message: 'Erro ao buscar dados' });
  }
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
 *               quantidade:
 *                 type: number
 *               preco:
 *                 type: number
 *               imagem:
 *                 type: string
 *     responses:
 *       201:
 *         description: Produto criado com sucesso.
 *       400:
 *         description: Dados incompletos.
 *       500:
 *         description: Erro ao inserir os dados.
 */
app.post('/api/produto', async (req, res) => {
  const { nome, quantidade, preco, imagem } = req.body;
  
  if (!nome || !quantidade || !preco || !imagem) {
    return res.status(400).json({ message: 'Dados incompletos. Informe nome, quantidade, preco e imagem.' });
  }
  
  try {
    await pool.query(
      'INSERT INTO produto (nome, quantidade, preco, imagem) VALUES ($1, $2, $3, $4)',
      [nome, quantidade, preco, imagem]
    );
    res.status(201).json({ message: 'Produto criado com sucesso' });
  } catch (error) {
    console.error('Erro ao inserir dados:', error);
    res.status(500).json({ message: 'Erro ao inserir dados' });
  }
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
app.put('/api/produto/:id', async (req, res) => {
  const { nome, quantidade, preco, imagem } = req.body;
  try {
    await pool.query(
      'UPDATE produto SET nome = $1, quantidade = $2, preco = $3, imagem = $4 WHERE id = $5',
      [nome, quantidade, preco, imagem, req.params.id]
    );
    res.status(200).json({ message: 'Produto atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar dados:', error);
    res.status(500).json({ message: 'Erro ao atualizar dados' });
  }
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
app.delete('/api/produto/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM produto WHERE id = $1', [req.params.id]);
    res.status(200).json({ message: 'Produto excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir dados:', error);
    res.status(500).json({ message: 'Erro ao excluir dados' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
