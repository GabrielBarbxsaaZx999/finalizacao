const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();



const db = mysql.createConnection({
  host: 'localhost',
  user: 'phpmyadmin',
  password: 'aluno',
  database: 'xrc',
});

db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    throw err;
  }
  console.log('Conexão com o banco de dados MySQL estabelecida.');
});

app.use(
  session({
    secret: 'aluno',
    resave: true,
    saveUninitialized: true,
  })
);

app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('inicio.ejs'); // Renderiza a tela de inicio
});


app.post('/login', (req, res) => {
  const { email, password } = req.body;
  console.log(`${email} - ${password}`);

  const query = 'SELECT * FROM users WHERE email = ? AND password = ?';

  db.query(query, [email, password], (err, results) => {
    if (err) throw err;

    if (results.length > 0) {
      req.session.loggedin = true;
      req.session.email = email;
      if (email.indexOf("@med") >= 0) {
        req.session.tipo = "medico";
        console.log("medico logado");
        res.redirect('/tmedico')
      } else if (email.indexOf("@adm") >= 0) {
        req.session.tipo = "adm";
        console.log("adm logado");

      } else {
        req.session.tipo = "paciente";
        console.log("paciente logado");
        res.redirect('/paciente')

      }


    } else {
      res.send('Credenciais incorretas. <a href="/">Tente novamente</a>');
    }
  });
});







app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});



app.get('/cadastro', (req, res) => {
  res.render('cadastro.ejs'); // Renderiza o formulário de cadastro
});

app.get('/login2', (req, res) => {
  res.render('login2.ejs'); // Renderiza o formulário de login
});

app.get('/historico', (req, res) => {
  db.query('SELECT * FROM Medicos', (err, result) => {
    if (err) throw err;
    res.render('historico-paciente.ejs', { Medicos: result });
  });
});

app.get('/quemsomos', (req, res) => {
  res.render('quemsomos.ejs'); // Renderiza o formulário de quemsomos
});

// READ
app.get('/tmedico', (req, res) => {
  db.query('SELECT * FROM Medicos', (err, result) => {
    if (err) throw err;
    res.render('tmedico', { Medicos: result });
  });
});

app.get('/delete/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM Medicos WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) throw err;
    res.redirect('/');
  });
});


// app.post('/paciente', (req, res) => {
//   const { id,nomeMedico,horário,especialidade,nomePaciente } = req.body;

//   const query = 'INSERT INTO Medicos(id,nomeMedico,horário,especialidade,nomePaciente ) VALUES (?, ?, ?, ?)';
// });

app.post('/paciente', (req, res) => {
  const { nomeMedico, horario, especialidade, nomePaciente } = req.body;
  // INSERT INTO `Medicos`(`id`, `nomeMedico`, `horário`, `especiliadade`, `nomePaciente`) VALUES ([value-1],[value-2],[value-3],[value-4],[value-5])
  const sql = 'INSERT INTO Medicos (nomeMedico, horário, especiliadade, nomePaciente) VALUES (?, ?, ?, ?)';
  db.query(sql, [nomeMedico, horario, especialidade, nomePaciente], (err, result) => {
    if (err) {
      console.error('Erro ao inserir usuário:', err);
    } else {
      // Cadastro bem-sucedido; você pode redirecionar para a página de login ou outra página.
      // res.redirect('/login2');
      console.log(`Registro Inserido: ${nomeMedico} - ${horario} - ${especialidade} - ${nomePaciente}`);

      res.redirect('/paciente'); // Redireciona de volta ao formulário de paciente em caso de erro

    }
  });
});


// Rota para processar o formulário de cadastro
app.post('/cadastro', (req, res) => {
  const { username, password, cpf, email } = req.body;
  const sql = 'INSERT INTO users (username, password, cpf, email) VALUES (?, ?, ?, ?)';
  db.query(sql, [username, password, cpf, email], (err, result) => {
    if (err) {
      console.error('Erro ao inserir usuário:', err);
      res.redirect('/cadastro'); // Redireciona de volta ao formulário de cadastro em caso de erro
    } else {
      // Cadastro bem-sucedido; você pode redirecionar para a página de login ou outra página.
      res.redirect('/login2');
    }
  });
});

// Rota para a página de dashboard
app.get('/paciente', (req, res) => {
  console.log(`Renderizando paciente ${req.session}`);
  if (req.session.loggedin) {
    if (req.session.tipo == "paciente") {
      res.render('paciente', { req: req, consultas: ['Consulta inserida com sucesso'] });
      console.log('Página de consulta do PACIENTE enviada');
    } else if (req.session.tipo == "medico") {
      res.render('tmedico', { req: req, consultas: ['teste 1 - consulta 1'] });
      console.log('Página de consulta do MÈDICO enviada');
    } else if (req.session.tipo == "admin") {
      // Inserir código se for admin
    }
  }
  else {
    res.send('Faça login para acessar esta página. <a href="/">Login</a>');
  }

});

// ...


const port = 3006;
app.listen(port, () => {
  console.log(`Servidor em execução na porta ${port}`);
});