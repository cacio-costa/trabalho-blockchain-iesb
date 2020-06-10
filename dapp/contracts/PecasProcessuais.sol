pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

contract PecasProcessuais {

    mapping(uint256 => Peca[]) processos;
    uint256[] public listaDeProcessos;
    
    struct Peca {
        uint id;
        string nome;
        string hash;
        string dataDeCadastro;
    }

    function cadastraPeca(uint256 numeroUnico, string memory nomeDaPeca, string memory hash, string memory dataDeCadastro) public {
        require(numeroUnico > 0, "Número único do processo DEVE ser informado.");
        require(bytes(nomeDaPeca).length >= 1, "Nome da peça DEVE ser informado");
        require(bytes(hash).length >= 1, "Hash da peça DEVE ser informado");

        Peca[]storage pecasDoProcesso = processos[numeroUnico];
        uint idDaPeca = pecasDoProcesso.length;
        if (idDaPeca == 0) {
            listaDeProcessos.push(numeroUnico);
        }

        Peca memory novaPeca = Peca({ id: idDaPeca, nome: nomeDaPeca, hash: hash, dataDeCadastro: dataDeCadastro });
        pecasDoProcesso.push(novaPeca);
                
        emit PecaAdicionada(idDaPeca, hash);
    }

    function listaProcessos() public view returns (uint256[] memory, uint[] memory) {
        uint[] memory quantidadeDePecas = new uint[](listaDeProcessos.length);

        for (uint i = 0; i < listaDeProcessos.length; i++) {
            uint256 numeroDoProcesso = listaDeProcessos[i];
            quantidadeDePecas[i] = processos[numeroDoProcesso].length;
        }

        return (listaDeProcessos, quantidadeDePecas);
    }

    function listaPecas(uint256 numeroUnico) public view returns (uint[] memory, string[] memory, string[] memory, string[] memory) {
        Peca[] storage pecas = processos[numeroUnico];
        require(pecas.length > 0, "Nenhuma peca cadastrada para o processo informado.");

        uint[] memory ids = new uint[](pecas.length);
        string[] memory nomes = new string[](pecas.length);
        string[] memory hashes = new string[](pecas.length);
        string[] memory datas = new string[](pecas.length);

        for (uint i = 0; i < pecas.length; i++) {
            ids[i] = pecas[i].id;
            nomes[i] = pecas[i].nome;
            hashes[i] = pecas[i].hash;
            datas[i] = pecas[i].dataDeCadastro;
        }

        return (ids, nomes, hashes, datas);
    }

    function recuperaPeca(uint256 numeroUnico, uint idDaPeca) public view returns(Peca memory) {
        Peca[] storage pecas = processos[numeroUnico];
        require(pecas.length > 0, "Nenhuma peca cadastrada para o processo informado.");

        return pecas[idDaPeca];
    }

    event PecaAdicionada(uint id, string hash);

}