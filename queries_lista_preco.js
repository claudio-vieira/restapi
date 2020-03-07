var db = require('./conexao').getDb();
var utils = require('./utils');

function recuperarListaPreco(req, res, next) {
    db.any('select * from lista_preco')
        .then(function (data) {
            data.forEach(function(value) {
                var items = Object.keys(value);
                items.forEach(function(item) {
                    if(value[item] == null){
                       value[item] = '';
                    }
                });
            });  
            res.status(200)
                .json({
                    status: 'success',
                    data_precos: data,
                    message: 'Retrieved ALL lista Preco'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_precos: 'Houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function recuperarListaPrecoPorVendedor(req, res, next) {
    var cdvendedor = parseInt(req.body.cdvendedor);

    db.any('SELECT * FROM lista_preco WHERE cdvendedor = $1', cdvendedor)
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
                    data_precos: data,
                    message: 'Retrieved ONE lista Preco'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_precos: 'Não existe a lista Preco ou houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}


function recuperarListaPrecoPorCodigo(req, res, next) {
    var codigo = parseInt(req.body.idlistapreco);

    db.one('SELECT * FROM lista_preco WHERE idlistapreco = $1', codigo)
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
                    data_precos: data,
                    message: 'Retrieved ONE lista Preco'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_precos: 'Não existe a lista Preco ou houve algum problema',
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

function inserirListaPreco(req, res, next) {
    var listaPreco;
    var error = 0;


    var vendedor = retornaTabelaParaValidacao('vendedores');   
    vendedor.then(resVendedor => {

        var query_insert = "INSERT INTO lista_preco (cdvendedor,cdproduto,cdtabelapreco,cdlocalfaturamento,estadotabpreco,tipotabelapreco,"
                            +"precobruto,descminimoentrega,descmaximoentrega,descminimoretira,descmaximoretira,situacao) VALUES ";

        //Percorre os lista de Preco para salvar
        for (i in req.body) {
            listaPreco = req.body[i];

            /*for(var a=0; a < resVendedor.length; a++){
                if(listaPreco.cdvendedor.localeCompare(resVendedor[a].codigo, undefined, {numeric: true}) == 0){
                    query_insert += "("+ (listaPreco.cdvendedor.localeCompare('') == 0 ? null : listaPreco.cdvendedor);
                    error -= a;
                    break;
                }else{
                    if(error <= 0)
                        errorMsg = "Vendedor '" + listaPreco.cdvendedor + "' não cadastrado.";
                    error += 1;
                } 
            }*/

            query_insert += "("+ (listaPreco.cdvendedor.localeCompare('') == 0 ? null : listaPreco.cdvendedor) 
                            +","+ (listaPreco.cdproduto.localeCompare('') == 0 ? null : listaPreco.cdproduto) 
                            +","+ (listaPreco.cdtabelapreco.localeCompare('') == 0 ? null : listaPreco.cdtabelapreco)
                            +","+ (listaPreco.cdlocalfaturamento.localeCompare('') == 0 ? null : listaPreco.cdlocalfaturamento)
                            +","+ (listaPreco.estadotabpreco.localeCompare('') == 0 ? null : "'"+listaPreco.estadotabpreco+"'")
                            +","+ (listaPreco.tipotabelapreco.localeCompare('') == 0 ? null : listaPreco.tipotabelapreco)
                            +","+ (listaPreco.precobruto.localeCompare('') == 0 ? null : listaPreco.precobruto.replace(/,/, '.'))
                            +","+ (listaPreco.descminimoentrega.localeCompare('') == 0 ? null : listaPreco.descminimoentrega.replace(/,/, '.'))
                            +","+ (listaPreco.descmaximoentrega.localeCompare('') == 0 ? null : listaPreco.descmaximoentrega.replace(/,/, '.'))
                            +","+ (listaPreco.descminimoretira.localeCompare('') == 0 ? null : listaPreco.descminimoretira.replace(/,/, '.'))
                            +","+ (listaPreco.descmaximoretira.localeCompare('') == 0 ? null : listaPreco.descmaximoretira.replace(/,/, '.'))
                            +","+ (listaPreco.situacao.localeCompare('') == 0 ? null : listaPreco.situacao)
                            +"), ";
            if(error > 0){
                break;
            }
        }
        if(error > 0){
            res.status(400)
                    .json({
                        status: 'Warning',
                        data_precos: errorMsg,
                        message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                    });
        }else{
            query_insert = query_insert.substring(0, query_insert.length-2)+";";
            //console.log("query: " + query_insert);

            db.none(query_insert)
                .then(function () {
                    res.status(200)
                        .json({
                            status: 'success',
                            message: 'Inserted all lista Preco'
                        });
                })
            .catch(function (err) {
                return next(err);
                res.status(400)
                        .json({
                            status: 'Warning',
                            data_precos: 'Erro: '+err,
                            message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                        });
            });
        }
    }); 
}

function deletarListaPreco(req, res, next) {
    db.any('DELETE FROM lista_preco')
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Deleted ALL lista Preco'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_precos: 'Houve algum problema.',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function deletarListaPrecoPorCodigo(req, res, next) {
    var codigo = parseInt(req.body.idlistapreco);
    
    db.any('DELETE FROM lista_preco WHERE idlistapreco = $1', codigo)
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Deleted ONE lista Preco'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_precos: 'Id inexistente ou houve algum problema.',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

module.exports = {
    recuperarListaPreco: recuperarListaPreco,
    recuperarListaPrecoPorCodigo: recuperarListaPrecoPorCodigo,
    recuperarListaPrecoPorVendedor: recuperarListaPrecoPorVendedor,
    inserirListaPreco: inserirListaPreco,
    deletarListaPrecoPorCodigo: deletarListaPrecoPorCodigo,
    deletarListaPreco: deletarListaPreco
};