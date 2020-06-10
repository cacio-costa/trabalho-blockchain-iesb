window.addEventListener("load", function() {

    console.log('hello from login')
    let formLogin = document.getElementById("loginForm");

    // adiciona uma função para
    // fazer o login quando o 
    // formulário for submetido
    formLogin.addEventListener('submit', login);

    // restaga formulário de login
    let formRegister = document.getElementById("registerForm");

    // adiciona uma função para
    // fazer o login quando o 
    // formulário for submetido
    formRegister.addEventListener('submit', register);
})

function login(event) {

    // previne a página de ser recarregada
    event.preventDefault();

    // resgata os dados do formulário
    let username = $("#username").val();
    let password = $("#password").val();

    // envia a requisição para o servidor
    $.post("/api/auth/login", {username: username, password: password}, function(res) {
        
        // verifica resposta do servidor
        // redireciona para tela de login
        // caso a conta seja criada com sucesso
        if (!res.error) {
            window.location.href="/api/auth/dashboard";
        } else {
            console.log(res.msg);
            alert("Erro ao fazer login. " + res.msg);
        }

    })
}

function register(event) {

    // previne a página de ser recarregada
    event.preventDefault();

    $('#botao-cadastrar').attr('disabled', 'disabled');

    // resgata os dados do formulário
    let username = $("#username-registrar").val();
    let password = $("#password-registrar").val();

    // envia a requisição para o servidor
    $.post("/api/auth/register", {username: username, password: password}, function(res) {
        console.log(res);
        // verifica resposta do servidor
        // redireciona para tela de login
        // caso a conta seja criada com sucesso
        alert(res.msg);
        if (!res.error) {
            window.location.href="/api/auth/dashboard";
            $('#entre-aqui').click();
        } else {
            alert("Erro ao criar sua conta. Por favor, tente novamente mais tarde. " + res.msg);
        }

    })
}