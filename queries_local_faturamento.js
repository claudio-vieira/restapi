var db = require('./conexao').getDb();
var utils = require('./utils');
var testeGlobal;

function recuperarLocalFaturamento(req, res, next) {
    db.any('select * from local_faturamento')
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
                    data_faturamentos: data,
                    message: 'Retrieved ALL locais de faturamento'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_faturamentos: 'Não existem pedidos cadastrados ou houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function recuperarLocalFaturamentoPorCodigo(req, res, next) {
    var codigo = parseInt(req.body.codigo);
    db.one('SELECT * FROM local_faturamento WHERE codigo = $1', codigo)
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
                    data_faturamentos: data,
                    message: 'Retrieved ONE local de faturamento'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_faturamentos: 'Não existe o local faturamento ou houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function inserirLocalFaturamento(req, res, next) {
    var local;

    var query_insert = "INSERT INTO local_faturamento (codigo,descricao,situacao,uf) VALUES ";
 

    //Percorre os clientes para salvar
    for (i in req.body) {
        local = req.body[i];

        query_insert += "("+ (local.codigo.localeCompare('') == 0 ? null : local.codigo)
                        +","+ (local.descricao.localeCompare('') == 0 ? null : "'"+local.descricao+"'")
                        +","+ (local.situacao.localeCompare('') == 0 ? null : "'"+local.situacao+"'")
                        +","+ (local.uf.localeCompare('') == 0 ? null : "'"+local.uf+"'")
                        +"), ";
    }

    query_insert = query_insert.substring(0, query_insert.length-2)+";";

    db.none(query_insert)
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Inserted all locais de faturamento'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_faturamentos: 'Erro: '+err,
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
    
}


function deletarLocalFaturamento(req, res, next) {
    db.any('DELETE FROM local_faturamento')
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Deleted ALL locais de faturamento'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_faturamentos: 'Houve algum problema.',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function deletarLocalFaturamentoPorCodigo(req, res, next) {
    var codigo = parseInt(req.body.codigo);
    db.any('DELETE FROM local_faturamento WHERE codigo = $1', codigo)
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Deleted ONE local de faturamento'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_faturamentos: 'Id inexistente ou houve algum problema.',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

module.exports = {
    recuperarLocalFaturamento: recuperarLocalFaturamento,
    recuperarLocalFaturamentoPorCodigo: recuperarLocalFaturamentoPorCodigo,
    inserirLocalFaturamento: inserirLocalFaturamento,
    deletarLocalFaturamentoPorCodigo: deletarLocalFaturamentoPorCodigo,
    deletarLocalFaturamento: deletarLocalFaturamento
};