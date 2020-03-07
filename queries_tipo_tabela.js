var db = require('./conexao').getDb();
var utils = require('./utils');

function recuperarTipoTabela(req, res, next) {
    db.any('select * from tipo_tabela')
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
                    data_tabelas: data,
                    message: 'Retrieved ALL tipo tabela'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_tabelas: 'Não existem tipo tabela cadastrados ou houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function recuperarTipoTabelaPorVendedor(req, res, next) {
    var cdvendedor = parseInt(req.body.cdvendedor);

    db.any('SELECT * FROM tipo_tabela WHERE cdvendedor = $1', [cdvendedor])
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
                    data_tabelas: data,
                    message: 'Retrieved ONE tipo tabela'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_tabelas: 'Não existe o tipo tabela ou houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function recuperarTipoTabelaPorCodigoEVendedor(req, res, next) {
    var codigo = parseInt(req.body.codigo);
    var cdvendedor = parseInt(req.body.cdvendedor);

    db.one('SELECT * FROM tipo_tabela WHERE codigo = $1 AND cdvendedor = $2', [codigo,cdvendedor])
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
                    data_tabelas: data,
                    message: 'Retrieved ONE tipo tabela'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_tabelas: 'Não existe o tipo tabela ou houve algum problema',
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

function inserirTipoTabela(req, res, next) {
    var tipotbl;
    var error = 0;

    var vendedor = retornaTabelaParaValidacao('vendedores');   
    vendedor.then(resVendedor => {

        var query_insert = "INSERT INTO tipo_tabela(cdvendedor,codigo,descricao,situacao) VALUES ";


        //Percorre os tipo tabela para salvar
        for (i in req.body) {
            tipotbl = req.body[i];

            /*for(var a=0; a < resVendedor.length; a++){
                if(tipotbl.cdvendedor.localeCompare(resVendedor[a].codigo, undefined, {numeric: true}) == 0){
                    query_insert += "(" + (tipotbl.cdvendedor.localeCompare('') == 0 ? null : tipotbl.cdvendedor);
                    error -= a;
                    break;
                }else{ 
                    if(error <= 0)
                        errorMsg = "Vendedor '" + tipotbl.cdvendedor + "' não cadastrado.";
                    error += 1;
                } 
            }*/

            query_insert +=  
                            "("+ (tipotbl.cdvendedor.localeCompare('') == 0 ? null : tipotbl.cdvendedor)
                            +","+ (tipotbl.codigo.localeCompare('') == 0 ? null : tipotbl.codigo)
                            +","+ (tipotbl.descricao.localeCompare('') == 0 ? null : "'"+tipotbl.descricao+"'")
                            +","+ (tipotbl.situacao.localeCompare('') == 0 ? null : "'"+tipotbl.situacao+"'")
                            +"), ";
            if(error > 0){
                break;
            }
        }

        if(error > 0){
            res.status(400)
                .json({
                    status: 'Warning',
                    data_tabelas: errorMsg,
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
                            message: 'Inserted all tipo tabela'
                        });
                })
            .catch(function (err) {
                //return next(err);
                res.status(400)
                    .json({
                        status: 'Warning',
                        data_tabelas: 'Erro: '+err,
                        message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                    });
            });
        }
    }); 
}


function deletarTipoTabela(req, res, next) {
    db.any('DELETE FROM tipo_tabela')
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Deleted ALL tipo tabela'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_tabelas: 'Houve algum problema.',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function deletarTipoTabelaPorCodigo(req, res, next) {
    var codigo = parseInt(req.body.codigo);
    var cdvendedor = parseInt(req.body.cdvendedor);

    db.any('DELETE FROM tipo_tabela WHERE codigo = $1 AND cdvendedor = $2', [codigo,cdvendedor])
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Deleted ONE tipo tabela'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_tabelas: 'Id inexistente ou houve algum problema.',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

module.exports = {
    recuperarTipoTabela: recuperarTipoTabela,
    recuperarTipoTabelaPorVendedor: recuperarTipoTabelaPorVendedor,
    recuperarTipoTabelaPorCodigoEVendedor: recuperarTipoTabelaPorCodigoEVendedor,
    inserirTipoTabela: inserirTipoTabela,
    deletarTipoTabelaPorCodigo: deletarTipoTabelaPorCodigo,
    deletarTipoTabela: deletarTipoTabela
};