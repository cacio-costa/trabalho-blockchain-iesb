console.log("*** Recuperando processos ***");

// $.get("/api/processos", function(res) {
//     console.log("*** Views -> js -> pecas-processuais -> listaProcessos.js ***", res);

//     let tabela = $('#tabela-de-processos');
//     res.map(processo => {
//             return `<tr>
//                         <td>
//                             <a href="/processos/${processo.numeroUnico}/pecas">${processo.numeroUnico}</a>
//                         </td>
//                         <td>${processo.quantidadeDePecas} peça(s)</td>
//                     </tr>`;
//         })
//         .forEach(linha => tabela.append(linha));
// });