var db = require('./conexao').getDb();
var utils = require('./utils');

function recuperarVendas(req, res, next) {
    db.any('select * from vendas')
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
                    data_vendas: data,
                    message: 'Retrieved ALL vendas'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_vendas: 'Houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function recuperarVendaPorCodigo(req, res, next) {
    var codigo = parseInt(req.body.codigo);
    db.one('SELECT * FROM vendas WHERE codigo = $1', codigo)
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
                    data_vendas: data,
                    message: 'Retrieved ONE venda'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_vendas: 'Não existe a venda ou houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function inserirVendas(req, res, next) {
    var venda;
    var query_insert = "INSERT INTO vendas (codigo,abreviacao,descricao,situacao) VALUES ";

    //Percorre as vendas para salvar
    for (i in req.body) {
        venda = req.body[i];


        query_insert += "("+ (venda.codigo.localeCompare('') == 0 ? null : venda.codigo)
                        +","+ (venda.abreviacao.localeCompare('') == 0 ? null : "'"+venda.abreviacao+"'")
                        +","+ (venda.descricao.localeCompare('') == 0 ? null : "'"+venda.descricao+"'")
                        +","+ (venda.situacao.localeCompare('') == 0 ? null : "'"+venda.situacao+"'")
                        +"), ";
    }
    query_insert = query_insert.substring(0, query_insert.length-2)+";";
    //console.log("query: " + query_insert);

    db.none(query_insert)
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Inserted all vendas'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_vendas: 'Erro: '+err,
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function deletarVendas(req, res, next) {
    db.any('DELETE FROM vendas')
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Deleted ALL vendas'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_vendas: 'Houve algum problema.',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function deletarVendaPorCodigo(req, res, next) {
    var codigo = parseInt(req.body.codigo);
    db.any('DELETE FROM vendas WHERE codigo = $1', codigo)
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Deleted ONE venda'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_vendas: 'Id inexistente ou houve algum problema.',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

module.exports = {
    recuperarVendas: recuperarVendas,
    recuperarVendaPorCodigo: recuperarVendaPorCodigo,
    inserirVendas: inserirVendas,
    deletarVendaPorCodigo: deletarVendaPorCodigo,
    deletarVendas: deletarVendas
};