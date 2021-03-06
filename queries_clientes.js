//Pegar conexão com o banco
var db = require('./conexao').getDb();

// add query functions
function recuperarClientes(req, res, next) {
    db.any('select * from clientes')
        .then(function (data) {
            data.forEach(function(value) {
                var items = Object.keys(value);
                items.forEach(function(item) {
                    /*if(value[item] == null){
                       value[item] = '';
                    }*/

                    //Deve retornar o limcred como double, ou seja, com ponto flutuante.
                    if(item.includes("limcred") && !value[item].toString().includes(".")){
                        value[item] = Number.parseFloat(value[item]).toFixed(2);
                    }
                });
            });  
            res.status(200)
                .json({
                    status: 'success',
                    data_clients: data,
                    message: 'Retrieved ALL clientes'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_clients: 'Houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function recuperarClientePorVendedor(req, res, next) {
    var cdvendedor = parseInt(req.body.cdvendedor);
    
    db.any('SELECT * FROM clientes WHERE cdvendedor = $1', [cdvendedor])
        .then(function (data) {
            var items = Object.keys(data);
            items.forEach(function(item) {
                if(data[item] == null){
                   data[item] = '';
                }
            });
            res.status(200)
                .json({
                    status: 'success',
                    data_clients: data,
                    message: 'Retrieved ONE cliente'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_clients: 'Houve algum problema',
                    message: 'Erro: '+err
                });
    });
}

function recuperarClientePorCodigoEVendedor(req, res, next) {
    var cdvendedor = parseInt(req.body.cdvendedor);
    var codigo = parseInt(req.body.codigo);

    db.one('SELECT * FROM clientes WHERE codigo = $1 AND cdvendedor = $2', [codigo,cdvendedor])
        .then(function (data) {
            var items = Object.keys(data);
            items.forEach(function(item) {
                if(data[item] == null){
                   data[item] = '';
                }
            });
            res.status(200)
                .json({
                    status: 'success',
                    data_clients: data,
                    message: 'Retrieved ONE cliente'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_clients: 'Houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function recuperarClientePorCnpjEVendedor(req, res, next) {
    var cdvendedor = parseInt(req.body.cdvendedor);
    var cnpj = req.body.cnpj;

    if(cdvendedor == undefined || cdvendedor == 0){
        return res.status(401).json({error: '(cdvendedor) obrigatorio no corpo da requisicao para carregar o cliente'});
    }else if(cnpj == undefined || cnpj == ''){
        return res.status(401).json({error: '(cnpj) obrigatorio no corpo da requisicao para carregar o cliente'});
    }

    db.any("SELECT * FROM clientes WHERE cnpj = '"+cnpj+"' AND cdvendedor = "+cdvendedor)
        .then(function (data) {
            var items = Object.keys(data);
            res.status(200)
                .json({
                    status: 'success',
                    data_clients: data,
                    message: 'Retrieved ONE cliente'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_clients: 'Nao existe o cliente ou houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function recuperarCidadesPorPedidosPorCliente(req, res, next) {
    var cdvendedor = req.body.cdvendedor;
    var uf = req.body.uf;
    
    if(cdvendedor == undefined || cdvendedor == null || cdvendedor == "" ||
        uf == undefined || uf == null || uf == ""){
        res.status(400)
                .json({
                    status: 'Warning',
                    data_cidades: null,
                    message: 'Campo cdvendedor e uf obrigatorio.'
                });
        return;
    }

    var sql = "select c.cidade from pedidos p "+
                "inner join vendedores v on v.codigo = p.cdvendedor "+
                "inner join clientes c on c.codigo = p.cdcliente "+
                "where p.cdvendedor = "+cdvendedor+" and c.uf = '"+uf+"' "+
                "group by c.cidade";

    db.any(sql)
        .then(function (data) {
            var items = Object.keys(data);
            res.status(200)
                .json({
                    status: 'success',
                    data_cidades: data,
                    message: 'Retrieved cidades'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_cidades: 'Nao existe cidades ou houve algum problema: '+err,
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function retornaTabelaParaValidacao(nomeTabela){
    var p1 = new Promise(
        function(resolve, reject) {         
            db.query('select * from ' + nomeTabela)
                .then(function (data) {
                    resolve(data);
                })
            .catch(function (err) {
                return next(err);
            });
    });
    return p1;
}

function inserirClientes(req, res, next) {
    var cliente;
    //var problema;
    var error = 0;

    var vendedor = retornaTabelaParaValidacao('vendedores');   
    vendedor.then(resVendedor => {

        var localFaturamento = retornaTabelaParaValidacao('local_faturamento');   
        localFaturamento.then(resLocalFaturamento => {
    
            var query_insert = "";

            /*var query_insert = "INSERT INTO clientes("
                                        +"cdvendedor,idfilial,codigo,codigointerno,nome,fantasia,endereco,numeroendereco,complementoendereco,"
                                        +"bairro,cidade,uf,cep,cnpj,inscrestadual,fone,celular,fax,contato,contato2,email,tipopessoa,regapuracao,"
                                        +"limcred,situacao,possuiie,liminarst,idtipotabela,suframa,email2,email3,dtultimavisita,regimest,enviadoftp) VALUES  ";*/

            //Percorre os clientes para salvar
            for (i in req.body) {
                cliente = req.body[i];
                
                //console.log("resVendedor: ", resVendedor);
                    /*for(var a=0; a < resVendedor.length; a++){
                        console.log("resVendedor[a].codigo: ", resVendedor[a].codigo);
                        console.log("cliente.cdvendedor: ", cliente.cdvendedor);
                        if(cliente.cdvendedor.localeCompare(resVendedor[a].codigo, undefined, {numeric: true}) == 0){
                            query_insert += "("+(cliente.cdvendedor.localeCompare('') == 0 ? null : cliente.cdvendedor);
                            error -= a;
                            break;
                        }else{ 
                            if(error <= 0)
                                errorMsg = "Vendedor '" + cliente.cdvendedor + "' não cadastrado.";
                            error += 1;
                        } 
                    }
                    
                    for(var b=0; b < resLocalFaturamento.length; b++){
                        if(cliente.idfilial.localeCompare(resLocalFaturamento[b].codigo, undefined, {numeric: true}) == 0){
                            query_insert += ","+(cliente.idfilial.localeCompare('') == 0 ? null : cliente.idfilial); 
                            error -= b;
                            break;
                        }else{ 
                            if(error <= 0)
                                errorMsg = "Local de faturamento '" + cliente.idfilial + "' não cadastrado.";
                            error += 1;
                        } 
                    }*/
                    
                    //console.log("contato2: ", cliente.contato2);
                    //console.log("dtultimavisita: ", cliente.dtultimavisita);
                    //console.log("codigointerno: ", cliente.codigointerno);

                    query_insert += "INSERT INTO clientes("
                    +"cdvendedor,idfilial,codigo,codigointerno,nome,fantasia,endereco,numeroendereco,complementoendereco,"
                    +"bairro,cidade,uf,cep,cnpj,inscrestadual,fone,celular,fax,contato,contato2,email,tipopessoa,regapuracao,"
                    +"limcred,situacao,possuiie,liminarst,idtipotabela,suframa,email2,email3,dtultimavisita,regimest,enviadoftp) VALUES  ";

                    query_insert += 
                                "("+(cliente.cdvendedor == undefined || cliente.cdvendedor.toString().localeCompare('') == 0 ? null : cliente.cdvendedor)
                                +","+(cliente.idfilial == undefined || cliente.idfilial.toString().localeCompare('') == 0 ? null : cliente.idfilial)
                                +","+(cliente.codigo == undefined || cliente.codigo.toString().localeCompare('') == 0 ? null : cliente.codigo)
                                +","+(cliente.codigointerno == undefined || cliente.codigointerno.toString().localeCompare('') == 0 ? null : cliente.codigointerno)
                                +","+(cliente.nome == undefined || cliente.nome.toString().localeCompare('') == 0 ? null : "'"+cliente.nome+"'") 
                                +","+(cliente.fantasia == undefined || cliente.fantasia.toString().localeCompare('') == 0 ? null : "'"+cliente.fantasia+"'")
                                +","+(cliente.endereco == undefined || cliente.endereco.toString().localeCompare('') == 0 ? null : "'"+cliente.endereco+"'")
                                +","+(cliente.numeroendereco == undefined || cliente.numeroendereco.toString().localeCompare('') == 0 ? null : "'"+cliente.numeroendereco+"'")
                                +","+(cliente.complementoendereco == undefined || cliente.complementoendereco.toString().localeCompare('') == 0 ? null : "'"+cliente.complementoendereco+"'")
                                +","+(cliente.bairro == undefined || cliente.bairro.toString().localeCompare('') == 0 ? null : "'"+cliente.bairro+"'")
                                +","+(cliente.cidade == undefined || cliente.cidade.toString().localeCompare('') == 0 ? null : "'"+cliente.cidade+"'")
                                +","+(cliente.uf == undefined || cliente.uf.toString().localeCompare('') == 0 ? null : "'"+cliente.uf+"'")
                                +","+(cliente.cep == undefined || cliente.cep.toString().localeCompare('') == 0 ? null : cliente.cep)
                                +","+(cliente.cnpj == undefined || cliente.cnpj.toString().localeCompare('') == 0 ? null : "'"+cliente.cnpj+"'")
                                +","+(cliente.inscrestadual == undefined || cliente.inscrestadual.toString().localeCompare('') == 0 ? null : "'"+cliente.inscrestadual+"'")
                                +","+(cliente.fone == undefined || cliente.fone.toString().localeCompare('') == 0 ? null : "'"+cliente.fone+"'")
                                +","+(cliente.celular == undefined || cliente.celular.toString().localeCompare('') == 0 ? null : "'"+cliente.celular+"'")
                                +","+(cliente.fax == undefined || cliente.fax.toString().localeCompare('') == 0 ? null : "'"+cliente.fax+"'")
                                +","+(cliente.contato == undefined || cliente.contato.toString().localeCompare('') == 0 ? null : "'"+cliente.contato+"'")
                                +","+(cliente.contato2 == undefined || cliente.contato2.toString().localeCompare('') == 0 ? null : "'"+cliente.contato2+"'")
                                +","+(cliente.email == undefined || cliente.email.toString().localeCompare('') == 0 ? null : "'"+cliente.email+"'")
                                +","+(cliente.tipopessoa == undefined || cliente.tipopessoa.toString().localeCompare('') == 0 ? null : "'"+cliente.tipopessoa+"'")
                                +","+(cliente.regapuracao == undefined || cliente.regapuracao.toString().localeCompare('') == 0 ? null : cliente.regapuracao)
                                +","+(cliente.limcred == undefined || cliente.limcred.toString().localeCompare('') == 0 ? 0 : cliente.limcred.toString().split(',')[0])
                                +","+(cliente.situacao == undefined || cliente.situacao.toString().localeCompare('') == 0 ? null : cliente.situacao)
                                +","+(cliente.possuiie == undefined || cliente.possuiie.toString().localeCompare('') == 0 ? null : "'"+cliente.possuiie+"'")
                                +","+(cliente.liminarst == undefined || cliente.liminarst.toString().localeCompare('') == 0 ? null : "'"+cliente.liminarst+"'")
                                +","+(cliente.idtipotabela == undefined || cliente.idtipotabela.toString().localeCompare('') == 0 ? null : cliente.idtipotabela)
                                +","+(cliente.suframa == undefined || cliente.suframa.toString().localeCompare('') == 0 ? null : "'"+cliente.suframa+"'")
                                +","+(cliente.email2 == undefined || cliente.email2.toString().localeCompare('') == 0 ? null : "'"+cliente.email2+"'")
                                +","+(cliente.email3 == undefined || cliente.email3.toString().localeCompare('') == 0 ? null : "'"+cliente.email3+"'")
                                +","+(cliente.dtultimavisita == undefined || cliente.dtultimavisita.toString().localeCompare('') == 0 ? null : "'"+cliente.dtultimavisita+"'") 
                                +","+(cliente.regimest == undefined || cliente.regimest.toString().localeCompare('') == 0 ? null : cliente.regimest)
                                +",false" //Sempre false pois há um serviço que envia os clientes não enviados para o FTP a partir desta flag
                                +") ON CONFLICT ON CONSTRAINT clientes_pkey DO UPDATE SET "
                                +(cliente.cdvendedor == undefined || cliente.cdvendedor.toString().localeCompare('') == 0 ? '' : "cdvendedor = " + cliente.cdvendedor+",")
                                +(cliente.idfilial == undefined || cliente.idfilial.toString().localeCompare('') == 0 ? '' : "idfilial = "+cliente.idfilial+",")
                                +(cliente.codigo == undefined || cliente.codigo.toString().localeCompare('') == 0 ? '' : "codigointerno = "+cliente.codigo+",")
                                +(cliente.codigointerno == undefined || cliente.codigointerno.toString().localeCompare('') == 0 ? '' : "codigo = "+cliente.codigointerno+",")
                                +(cliente.nome == undefined || cliente.nome.toString().localeCompare('') == 0 ? '' : "nome = '"+cliente.nome+"',") 
                                +(cliente.fantasia == undefined || cliente.fantasia.toString().localeCompare('') == 0 ? '' : "fantasia = '"+cliente.fantasia+"',")
                                +(cliente.endereco == undefined || cliente.endereco.toString().localeCompare('') == 0 ? '' : "endereco = '"+cliente.endereco+"',")
                                +(cliente.numeroendereco == undefined || cliente.numeroendereco.toString().localeCompare('') == 0 ? '' : "numeroendereco = '"+cliente.numeroendereco+"',")
                                +(cliente.complementoendereco == undefined || cliente.complementoendereco.toString().localeCompare('') == 0 ? '' : "complementoendereco = '"+cliente.complementoendereco+"',")
                                +(cliente.bairro == undefined || cliente.bairro.toString().localeCompare('') == 0 ? '' : "bairro = '"+cliente.bairro+"',")
                                +(cliente.cidade == undefined || cliente.cidade.toString().localeCompare('') == 0 ? '' : "cidade = '"+cliente.cidade+"',")
                                +(cliente.uf == undefined || cliente.uf.toString().localeCompare('') == 0 ? '' : "uf = '"+cliente.uf+"',")
                                +(cliente.cep == undefined || cliente.cep.toString().localeCompare('') == 0 ? '' : "cep = "+cliente.cep+",")
                                +(cliente.cnpj == undefined || cliente.cnpj.toString().localeCompare('') == 0 ? '' : "cnpj = '"+cliente.cnpj+"',")
                                +(cliente.inscrestadual == undefined || cliente.inscrestadual.toString().localeCompare('') == 0 ? '' : "inscrestadual = '"+cliente.inscrestadual+"',")
                                +(cliente.fone == undefined || cliente.fone.toString().localeCompare('') == 0 ? '' : "fone = '"+cliente.fone+"',")
                                +(cliente.celular == undefined || cliente.celular.toString().localeCompare('') == 0 ? '' : "celular = '"+cliente.celular+"',")
                                +(cliente.fax == undefined || cliente.fax.toString().localeCompare('') == 0 ? '' : "fax = '"+cliente.fax+"',")
                                +(cliente.contato == undefined || cliente.contato.toString().localeCompare('') == 0 ? '' : "contato = '"+cliente.contato+"',")
                                +(cliente.contato2 == undefined || cliente.contato2.toString().localeCompare('') == 0 ? '' : "contato2 = '"+cliente.contato2+"',")
                                +(cliente.email == undefined || cliente.email.toString().localeCompare('') == 0 ? '' : "email = '"+cliente.email+"',")
                                +(cliente.tipopessoa == undefined || cliente.tipopessoa.toString().localeCompare('') == 0 ? '' : "tipopessoa = '"+cliente.tipopessoa+"',")
                                +(cliente.regapuracao == undefined || cliente.regapuracao.toString().localeCompare('') == 0 ? '' : "regapuracao = "+cliente.regapuracao+",")
                                +(cliente.limcred == undefined || cliente.limcred.toString().localeCompare('') == 0 ? 0 : "limcred = "+cliente.limcred.toString().split(',')[0]+",")
                                +(cliente.situacao == undefined || cliente.situacao.toString().localeCompare('') == 0 ? '' : "situacao = "+cliente.situacao+",")
                                +(cliente.possuiie == undefined || cliente.possuiie.toString().localeCompare('') == 0 ? '' : "possuiie = '"+cliente.possuiie+"',")
                                +(cliente.liminarst == undefined || cliente.liminarst.toString().localeCompare('') == 0 ? '' : "liminarst = '"+cliente.liminarst+"',")
                                +(cliente.idtipotabela == undefined || cliente.idtipotabela.toString().localeCompare('') == 0 ? '' : "idtipotabela = "+cliente.idtipotabela+",")
                                +(cliente.suframa == undefined || cliente.suframa.toString().localeCompare('') == 0 ? '' : "suframa = '"+cliente.suframa+"',")
                                +(cliente.email2 == undefined || cliente.email2.toString().localeCompare('') == 0 ? '' : "email2 = '"+cliente.email2+"',")
                                +(cliente.email3 == undefined || cliente.email3.toString().localeCompare('') == 0 ? '' : "email3 = '"+cliente.email3+"',")
                                +(cliente.dtultimavisita == undefined || cliente.dtultimavisita.toString().localeCompare('') == 0 ? '' : "dtultimavisita = '"+cliente.dtultimavisita+"',") 
                                +(cliente.regimest == undefined || cliente.regimest.toString().localeCompare('') == 0 ? '' : "regimest = "+cliente.regimest+",");
                                //+"enviadoftp = false"
                                //+";";
                                query_insert = query_insert.substring(0, query_insert.length-1)+";";
                if(error > 0){
                    break;
                }
            }
            if(error > 0){
                res.status(400)
                        .json({
                            status: 'Warning',
                            data_clients: errorMsg,
                            message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                        });
            }else{
                //query_insert = query_insert.substring(0, query_insert.length-2)+";";
                //console.log("Query: " + query_insert);

                db.none(query_insert)
                    .then(function () {
                        res.status(200)
                            .json({
                                status: 'success',
                                message: 'Inserted all clientes'
                            });
                    })
                .catch(function (err) {
                    //return next(err);
                    res.status(400)
                        .json({
                            status: 'Warning',
                            data_clients: 'Err: '+err,
                            message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                        });
                });
            }
        }, function(err){
            console.log("Erro no local de faturamento: " + err);
        });
    });

}

function deletarClientes(req, res, next) {
    db.any('delete from clientes')
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data_clients: data,
                    message: 'Deleted ALL clientes'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_clients: 'Houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function deletarClientePorCodigo(req, res, next) {
    var cdvendedor = parseInt(req.body.cdvendedor);
    var codigo = parseInt(req.body.codigo);

    db.any('DELETE FROM clientes WHERE codigo = $1 AND cdvendedor = $2', [codigo,cdvendedor])
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Deleted ONE cliente'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_clients: 'Houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}


//Exporta modulos
module.exports = {
    recuperarClientes: recuperarClientes,
    recuperarClientePorVendedor: recuperarClientePorVendedor,
    recuperarClientePorCodigoEVendedor: recuperarClientePorCodigoEVendedor,
    recuperarClientePorCnpjEVendedor: recuperarClientePorCnpjEVendedor,
    recuperarCidadesPorPedidosPorCliente: recuperarCidadesPorPedidosPorCliente,
    deletarClientes: deletarClientes,
    deletarClientePorCodigo: deletarClientePorCodigo,
    inserirClientes: inserirClientes
};
