const fs = require('fs');
const path = require('path');
const Web3 = require("web3");
const crypto = require('crypto');
const moment = require('moment');
const multer = require('multer');

if (!fs.existsSync("./uploads")) {
    fs.mkdirSync('./uploads');
}

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        let dir = `./uploads/${req.body["numero-unico"]}`;
        let nomeDoArquivo = criaNomeDoArquivo(file.originalname);
        
        if (fs.existsSync(`${dir}/${nomeDoArquivo}`)) {
            cb(new Error('Arquivo já existe'));
        }

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        cb(null, `./uploads/${req.body["numero-unico"]}`);
    },
    filename: function(req, file, cb) {
        let data = moment().format('YYYY-MM-DD');
        console.log('resolvendo nome do arquivo', file);
        cb(null, `${data}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

const contratoDePecasProcessuais = require(path.resolve("../dapp/build/contracts/PecasProcessuais.json"));
const httpEndpoint = 'http://localhost:8540';
let contractAddress = require('../../utils/parityRequests').pecasProcessuais.endereco;

const OPTIONS = {
    defaultBlock: "latest",
    transactionConfirmationBlocks: 1,
    transactionBlockTimeout: 5
};

let web3 = new Web3(httpEndpoint, null, OPTIONS);

let MyContract = new web3.eth.Contract(contratoDePecasProcessuais.abi, contractAddress);

function criaNomeDoArquivo(nomeOriginal) {
    let data = moment().format('YYYY-MM-DD');
    return `${data}-${nomeOriginal}`;
}

async function fileHash(filename) {
    return new Promise((resolve, reject) => {
        let shasum = crypto.createHash('sha512');

        try {
            let s = fs.ReadStream(filename)
            s.on('data', function (data) {
                shasum.update(data)
            })

            s.on('end', function () {
                const hash = shasum.digest('hex')
                return resolve(hash);
            })
        } catch (error) {
            return reject('calc fail');
        }
    });
}

const exibeProcessos = (req, resp) => resp.render('processos.html');

const formularioNovaPeca = (req, resp) => resp.render('nova.html');

const cadastraNovaPeca = async (req, res) => {

    console.log('Cadastrando nova peça...');
    let userAddr = req.session.address;
    let pass     = req.session.password;

    console.log('Arquivo', req.file);
    
    try {
        let accountUnlocked = await web3.eth.personal.unlockAccount(userAddr, pass, null)

        if (accountUnlocked) {
            let hash = await fileHash(req.file.path);

            await MyContract.methods.cadastraPeca(req.body['numero-unico'], req.file.originalname, hash, moment().format('YYYY-MM-DD'))
                .send({ from: userAddr, gas: 3000000 })
                .then(function(result) {
                    console.log(result);
                    return res.send({ msg: 'Peca cadastrada!' });  
                })
                .catch(function(err) {
                    console.log(err);
                    return res.status(500).send({ msg: 'Erro salvar peça no Blockchain! ' + err.message });
                })
        } 
    } catch (err) {
        console.log('erro ao salvar', err.stack);
        return res.status(500).send({ msg: 'Erro ao desbloquear sua conta. Por favor, tente novamente mais tarde.' });
    }

};

const listaProcessos = async (req, res) => {
    let userAddr = req.session.address;
    console.log("*** Listando processos ***", userAddr);

    await MyContract.methods.listaProcessos()
        .call({ from: userAddr, gas: 3000000 })
        .then(function (registros) {
            console.log("*** Obteve processos do blockchain ***");

            let processos = [];
            if (registros !== null) {
                for (i = 0; i < registros[0].length; i++) {
                    processos.push({ numeroUnico: registros[0][i], quantidadeDePecas: registros[1][i] });
                }
            }

            console.log("*** processos ***", processos);

            res.send(processos);
            return true;
        })
        .catch(error => {
            console.log("*** PecasAPI -> listaProcessos -> error ***", error);
            res.status(500).send({ msg: error});
        })
};

let listaPecas = async (req, res) => {
    let userAddr = req.session.address;
    console.log("*** Recuperando peças ***", userAddr);

    await MyContract.methods.listaPecas(req.params.numeroUnico)
        .call({ from: userAddr, gas: 3000000 })
        .then(function (registros) {
            console.log("*** Obteve peças do blockchain ***");

            let pecas = [];
            if (registros !== null) {
                for (i = 0; i < registros[0].length; i++) {
                    pecas.push({ id: registros['0'][i], nome: registros['1'][i], hash: registros['2'][i], dataDeCadastro: registros['3'][i] });
                }
            }

            console.log("pecas", pecas);

            res.send({ pecas });
            return true;
        })
        .catch(error => {
            console.log("*** PecasAPI -> listaPeças -> ERRO ***", error);
            res.status(500).send({ msg: error});
        })
};

const recuperaPeca = async (req, res) => {
    let userAddr = req.session.address;
    console.log(`*** Recuperando peca: Processo ${req.params.numeroUnico}, peça ${req.params.idDaPeca} ***`, userAddr);

    await MyContract.methods.recuperaPeca(req.params.numeroUnico, req.params.idDaPeca)
        .call({ from: userAddr, gas: 3000000 })
        .then(function (peca) {
            let dataDeCadastro = peca[3];
            let nome = peca[1];

            fs.readFile(`./uploads/${req.params.numeroUnico}/${dataDeCadastro}-${nome}`, (err, dados) => {
                res.contentType('application/pdf');
                res.send(dados);

                return true;
            });
            
        })
        .catch(error => {
            console.log("*** PecasAPI -> recuperaPeca -> ERRO ***", error);
            res.status(500).send({ msg: error});
        });
};

module.exports = function(app) {
    app.get('/processos', exibeProcessos);
    app.get('/pecas-processuais/cadastrar', formularioNovaPeca);
    app.get('/processos/:numeroUnico/pecas/:idDaPeca', recuperaPeca);

    app.get('/api/processos', listaProcessos);
    app.get('/api/processos/:numeroUnico/pecas', listaPecas);
    app.post('/api/pecas-processuais', upload.single('arquivo'), cadastraNovaPeca);
};