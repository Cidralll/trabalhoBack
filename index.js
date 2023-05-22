const express = require("express");
const app = express();
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const db = mysql.createPool({
    host: "localhost",
    port:30306,
    user: "root",
    password: "SenhaDoRoot",
    database: "listaCompras"
});

app.use(express.json());
app.use(cors());

app.post('/register', (req, res) => { // Registro de usuário
    const nome = req.body.nome;
    const email = req.body.email;
    const usuario = req.body.usuario;
    const senha = req.body.senha;
    db.query('SELECT * FROM usuario WHERE email = ?', [email],
        (err, result) => {
            if (err) {
                res.send(err);
            }
            if(result.length == 0) {
                db.query('SELECT * FROM usuario WHERE usuario = ?', [usuario],
                (err, result) => {
                    if (err) {
                        res.send(err);
                    }
                    if (result.length == 0) {
                       
                            db.query("INSERT INTO usuario (nome, email, usuario, senha) VALUES (?, ?, ?, ?)", [nome, email, usuario, senha], 
                                (err, response) => {
                                    if(err) {
                                        res.send(err);
                                    }
    
                                    res.send({msg: 'Usuário cadastrado com sucesso'});
                            });
                        
                    }else {
                        res.send({ msg: 'Erro ao cadastratar usuário!'});
                    }
                });
            };
        })
} )

app.post('/login', (req, res) => { // Login
    const usuario = req.body.usuario;
    const senha = req.body.senha;

    db.query(
        'SELECT * FROM usuario WHERE usuario = ? AND senha = ?', [usuario, senha], (err, result) => {
            if (err) {
                req.send(err);
            }
            res.send(result);
        }
    )
})

app.post('/register/product', (req, res) => { // Registro de produto
    const nome = req.body.nome;
    const marca = req.body.marca;
    const preco = req.body.preco;
    const data_validade = req.body.data_validade;
    const descricao = req.body.descricao;
    db.query('SELECT * FROM produtos WHERE nome = ?', [nome],
        (err, result) => {
            if (err) {
                res.send(err);
            }else {
                db.query("INSERT INTO produtos (nome, marca, preco, data_valIdade, descricao) VALUES (?, ?, ?, ?, ?)", [nome, marca, preco, data_validade, descricao], 
                    (err, response) => {
                        if(err) {
                            res.send(err);
                        }

                        res.send({msg: 'Produto cadastrado com sucesso'});
                });
            }
        })
} )

app.get('/product', (req, res) => { // retorna os produtos
    db.query(
        'SELECT * FROM produtos', (err, result) => {
            if (err) {
                req.send(err);
            }
            res.send(result);
        }
    )
})

app.post('/create/cart', (req, res) => {
    const valor_total = req.body.valor_total;
    const usuario_id = req.body.usuario_id;
    const data_criacao = req.body.data_criacao;
    const data_alteracao = req.body.data_alteracao;
    const status = req.body.status;
    
    // Consulta para verificar se o carrinho já existe
    db.query('SELECT * FROM carrinho WHERE usuario_id = ?', [usuario_id], (err, rows) => {
        if (err) {
            res.send(err);
        } else {
            if (rows.length > 0) {
                // Já existe um carrinho para o usuário
                res.send({ msg: 'Carrinho já existe para o usuário' });
            } else {
                // Criar um novo carrinho
                db.query('INSERT INTO carrinho (valor_total, usuario_id, data_criacao, data_alteracao, status) VALUES (?, ?, ?, ?, ?)', [valor_total, usuario_id, data_criacao, data_alteracao, status],
                    (err, response) => {
                        if (err) {
                            res.send(err);
                        } else {
                            res.send({ 
                                msg: 'Carrinho criado com sucesso', 
                            });
                        }
                    });
            }
        }
    });
});


app.post('/update/cart', (req, res) => {
    const valor_total = req.body.valor_total;
    const usuario_id = req.body.usuario_id;
    const data_criacao = req.body.data_criacao;
    const data_alteracao = req.body.data_alteracao;
    const status = req.body.status;
    
    db.query('UPDATE carrinho SET valor_total = ?, data_criacao = ?, data_alteracao = ?, status = ? WHERE usuario_id = ?', [valor_total, data_criacao, data_alteracao, status, usuario_id],
        (err, response) => {
            if (err) {
                res.send(err);
            } else {
                res.send({ msg: 'Carrinho atualizado com sucesso' });
            }
        });
});

app.post('/add/item/cart', (req, res) => {
    const carrinho_id = req.body.carrinho_id;
    const produtos_id = req.body.produtos_id;
    const quantidade = req.body.quantidade;
    const data_inclusao = req.body.data_inclusao;
    const valor_total = req.body.valor_total;
    const valor_unitario = req.body.valor_unitario;
    db.query('INSERT INTO carrinho_produto (carrinho_id, produtos_id, quantidade, data_inclusao, valor_total, valor_unitario) VALUES (?, ?, ?, ?, ?, ?)', [carrinho_id, produtos_id, quantidade, data_inclusao, valor_total, valor_unitario],
        (err, response) => {
            if(err) {
                res.send(err);
            }

            res.send({msg: 'Item adicionado ao carrinho com sucesso'});
        });   
});

app.get('/cart/items/:carrinho_id', (req, res) => {
    const carrinho_id = req.params.carrinho_id;
    
    db.query('SELECT * FROM carrinho_produto WHERE carrinho_id = ?', [carrinho_id], (err, rows) => {
        if (err) {
            res.send(err);
        } else {
            res.send(rows);
        }
    });
});

app.post('/update/item/cart', (req, res) => {
    const carrinho_id = req.body.carrinho_id;
    const produtos_id = req.body.produtos_id;
    const quantidade = req.body.quantidade;
    const data_inclusao = req.body.data_inclusao;
    const valor_total = req.body.valor_total;
    const valor_unitario = req.body.valor_unitario;
    
    db.query('UPDATE carrinho_produto SET quantidade = ?, data_inclusao = ?, valor_total = ?, valor_unitario = ? WHERE carrinho_id = ? AND produtos_id = ?', [quantidade, data_inclusao, valor_total, valor_unitario, carrinho_id, produtos_id],
        (err, response) => {
            if (err) {
                res.send(err);
            } else {
                res.send({ msg: 'Item atualizado no carrinho com sucesso' });
            }
        });
});




app.listen(3000, () => {
    console.log('Servidor rodando na porta 3001')
});