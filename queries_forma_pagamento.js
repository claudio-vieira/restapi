var db = require('./conexao').getDb();
var utils = require('./utils');

function recuperarFormasPagamento(req, res, next) {
    db.any('select * from forma_pagamento')
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
                    data_pagamentos: data,
                    message: 'Retrieved ALL formas pagamento'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_pagamentos: 'Houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function recuperarFormaPagamentoPorCodigo(req, res, next) {
    var codigo = parseInt(req.body.codigo);
    db.one('SELECT * FROM forma_pagamento WHERE codigo = $1', codigo)
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
                    data_pagamentos: data,
                    message: 'Retrieved ONE forma pagamento'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_pagamentos: 'Não existe a forma pagamento ou houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function inserirFormasPagamento(req, res, next) {
    var formaPag;
    var query_insert = "INSERT INTO forma_pagamento (codigo,descricao,situacao) VALUES ";

    //Percorre as formas de pagamento para salvar
    for (i in req.body) {
        formaPag = req.body[i];


        query_insert += "("+ (formaPag.codigo.localeCompare('') == 0 ? null : formaPag.codigo)
                        +",'"+ (formaPag.descricao.localeCompare('') == 0 ? '' : formaPag.descricao) + "'"
                        +",'"+ (formaPag.situacao.localeCompare('') == 0 ? '' : formaPag.situacao) + "'"
                        +"), ";
    }
    query_insert = query_insert.substring(0, query_insert.length-2)+";";
    //console.log("query: " + query_insert);

    db.none(query_insert)
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Inserted all formas pagamento'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_pagamentos: 'Houve algum problema.',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function deletarFormasPagamento(req, res, next) {
    db.any('DELETE FROM forma_pagamento')
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Deleted ALL formas pagamento'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_pagamentos: 'Houve algum problema.',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function deletarFormaPagamentoPorCodigo(req, res, next) {
    var codigo = parseInt(req.body.codigo);
    db.any('DELETE FROM forma_pagamento WHERE codigo = $1', codigo)
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Deleted ONE forma pagamento'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_pagamentos: 'Id inexistente ou houve algum problema.',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

module.exports = {
    recuperarFormasPagamento: recuperarFormasPagamento,
    recuperarFormaPagamentoPorCodigo: recuperarFormaPagamentoPorCodigo,
    inserirFormasPagamento: inserirFormasPagamento,
    deletarFormaPagamentoPorCodigo: deletarFormaPagamentoPorCodigo,
    deletarFormasPagamento: deletarFormasPagamento
};