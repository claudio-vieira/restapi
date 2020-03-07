var db = require('./conexao').getDb();
var utils = require('./utils');

function recuperarHistoricoGordura(req, res, next) {
    db.any('select * from historico_gordura')
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
                    data_historicos: data,
                    message: 'Retrieved ALL historico gordura'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_historicos: 'Houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function recuperarHistoricoGorduraPorCodigo(req, res, next) {
    var codigo = parseInt(req.body.codigo);
    db.one('SELECT * FROM historico_gordura WHERE codigo = $1', codigo)
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
                    data_historicos: data,
                    message: 'Retrieved ONE historico gordura'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_historicos: 'Não existe o historico gordura ou houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function inserirHistoricoGordura(req, res, next) {
    var histGordura;
    var query_insert = "INSERT INTO historico_gordura (codigo,descricao,situacao) VALUES ";

    //Percorre os Historicos de Gordura para salvar
    for (i in req.body) {
        histGordura = req.body[i];


        query_insert += "("+ (histGordura.codigo.localeCompare('') == 0 ? null : histGordura.codigo)
                        +",'"+ (histGordura.descricao.localeCompare('') == 0 ? '' : histGordura.descricao) + "'"
                        +",'"+ (histGordura.situacao.localeCompare('') == 0 ? '' : histGordura.situacao) + "'"
                        +"), ";
    }
    query_insert = query_insert.substring(0, query_insert.length-2)+";";
    //console.log("query: " + query_insert);

    db.none(query_insert)
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Inserted all historico gordura'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_historicos: 'Houve algum problema.',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function deletarHistoricoGordura(req, res, next) {
    db.any('DELETE FROM historico_gordura')
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Deleted ALL historico gordura'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_historicos: 'Houve algum problema.',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function deletarHistoricoGorduraPorCodigo(req, res, next) {
    var codigo = parseInt(req.body.codigo);
    db.any('DELETE FROM historico_gordura WHERE codigo = $1', codigo)
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Deleted ONE historico gordura'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_historicos: 'Id inexistente ou houve algum problema.',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

module.exports = {
    recuperarHistoricoGordura: recuperarHistoricoGordura,
    recuperarHistoricoGorduraPorCodigo: recuperarHistoricoGorduraPorCodigo,
    inserirHistoricoGordura: inserirHistoricoGordura,
    deletarHistoricoGorduraPorCodigo: deletarHistoricoGorduraPorCodigo,
    deletarHistoricoGordura: deletarHistoricoGordura
};