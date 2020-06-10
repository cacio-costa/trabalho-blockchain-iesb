const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();

const pecasProcessuais = require("./apis/pecas-processuais");

// set default views folder
app.set('views', __dirname + "/views");
app.engine('html', require('ejs').renderFile);
app.use(express.static('public'));
app.use('/node_modules', express.static('node_modules'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// registra a sessão do usuário
app.use(session({
    secret: 'mysecret',
    saveUninitialized: false,
    resave: false
}));

const authRoutes = require('./apis/routes/auth.js');

app.get('/', (req, res) => {
    res.redirect('/api/auth');
});

// * Auth pages * //
app.use("/api/auth", authRoutes);

const autenticacaoInterceptor = function(req, res, next) {
    if (!req.session.username) {
        res.redirect('/api/auth');
        res.end();
    } else {
        next();
    }
};

app.use(autenticacaoInterceptor);
pecasProcessuais(app);

app.use(function(err, req, res, next) {
    console.log('Erro aconteceu: ', err.stack);
    res.status(500).send({ msg: err.message });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, function() {
    console.log(`App listening on port ${PORT}`);
})