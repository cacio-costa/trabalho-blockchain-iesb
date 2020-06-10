document.getElementById('menu-cadastrar-peca').classList.add('active');
$.get('/api/auth/username', resposta => document.getElementById('nome-usuario').innerText = resposta.username);

let form = document.getElementById("peca");
form.addEventListener('submit', cadastraPeca);

$('#arquivo').aceFileInput({
    btnChooseText: 'Escolher',
    btnChangeText: 'Mudar', 
    placeholderText: 'Nenhum arquivo escolhido',
    allowExt: 'pdf'
});

function cadastraPeca() {

    // previne a página de ser recarregada
    event.preventDefault();

    let botaoAdicionar = $('#load');
    botaoAdicionar.attr('disabled', 'disabled');
    // resgata os dados do formulário
    let campoNumeroUnico = document.getElementById('numero-unico');
    let campoArquivo = document.getElementById('arquivo');

    

    console.log('Arquivo', campoArquivo.files);
    console.log('Primeiro', campoArquivo.files[0]);

    let dados = new FormData(document.getElementById("peca"));

    $.ajax({
        url: '/api/pecas-processuais',
        data: dados,
        processData: false,
        contentType: false,
        type: 'POST',
        success: function(data){
            console.log('resposta', data);
            campoNumeroUnico.value = '';
            campoArquivo.value = '';
            $('#arquivo').aceFileInput('resetInput');
            $('#numero-unico').blur();
            alert("Peça Processual cadastrada!");
        },
        error: function(xhr, status, erro) {
            let resposta = JSON.parse(xhr.responseText);
            console.log('Erro ao cadastrar peça!', resposta);

            alert(resposta.msg);
        },
        complete: function() {
            botaoAdicionar.attr('disabled', false);
        }
    });
    
}