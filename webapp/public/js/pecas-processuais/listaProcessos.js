$.get('/api/auth/username', resposta => document.getElementById('nome-usuario').innerText = resposta.username);
document.getElementById('menu-processos').classList.add('active');

console.log("*** Recuperando processos ***");
$.get("/api/processos", function(res) {
    console.log("*** Views -> js -> pecas-processuais -> listaProcessos.js ***", res);

    if (res.length == 0) {
        document.getElementById('nenhum-processo').classList.remove("d-none");
    } else {
        exibeProcessos(res);
    }
});

function exibeProcessos(processos) {
    let lista = $('#lista-de-processos');
    processos.map(processo => {
            return `<div class="col-12 col-sm-6 mt-3 mt-sm-0 cards-container mb-3" id="processo-${processo.numeroUnico}">
                        <div class="card bgc-success radius-0">
                            <div class="card-header">
                                <h5 class="card-title text-110 text-white">Processo ${processo.numeroUnico}</h5>
                                <div class="card-toolbar align-self-center">
                                    <span class="badge badge-danger badge-lg">
                                        <span id="processo-${processo.numeroUnico}-quantidade">${processo.quantidadeDePecas}</span> peça(s)
                                    </span>
                                </div>
                                <div class="card-toolbar" id="carregar-pecas-${processo.numeroUnico}">
                                    <button type="button" class="btn btn-sm border-0 radius-0 text-100 btn-light" onclick="carregaPecas(${processo.numeroUnico})">
                                        Carregar peças
                                    </button>
                                </div>
                            </div>

                            <div class="card-body show bg-white py-0 px-2" ace-scroll='{"height": 300, "smooth":true}'>
                                <div class="p-2">
                                    <dl id="processo-${processo.numeroUnico}-pecas"></dl>
                                </div>
                            </div>
                        </div>
                    </div>`;
        })
        .forEach(card => lista.append(card));
}

function carregaPecas(numeroUnico) {

    $.ajax({
        url: `/api/processos/${numeroUnico}/pecas`,
        type: 'GET',
        success: function(resposta){
            console.log('resposta', resposta);
            let lista = $(`#processo-${numeroUnico}-pecas`);
            lista.children().remove();
            resposta.pecas.map(peca => {
                    return `<dt class="text-600"><a href="/processos/${numeroUnico}/pecas/${peca.id}" target="_blank">${peca.nome}</a></dt>
                            <dd class="text-70">DONO: ${peca.dono}</dd>
                            <dd class="text-70">SHA-512: ${peca.hash}</dd>`;
                })
                .forEach(dados => lista.append(dados));
                
            $(`#processo-${numeroUnico}-quantidade`).text(resposta.pecas.length);
        },
        error: function(xhr, status, erro) {
            let resposta = JSON.parse(xhr.responseText);
            console.log('Erro ao cadastrar peça!', resposta);

            alert(resposta.msg);
        },
        complete: function() {
            console.log('completou');
        }
    });

}