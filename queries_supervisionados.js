var db = require('./conexao').getDb();
var utils = require('./utils');

function recuperarSupervisionados(req, res, next) {
    db.any('select * from supervisionados')
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
                    data_supervisionados: data,
                    message: 'Retrieved ALL supervisionados'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_supervisionados: 'Não existem supervisionados cadastrados ou houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function recuperarSupervisionadoPorVendedor(req, res, next) {
    var cdvendedor = parseInt(req.body.cdvendedor);

    db.any('SELECT * FROM supervisionados WHERE cdvendedor = $1', [cdvendedor])
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
                    data_supervisionados: data,
                    message: 'Retrieved ONE supervisionado'
                });
        })
    .catch(function (err) {
        return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_supervisionados: 'Não existe o supervisionado ou houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function recuperarSupervisionadoPorCodigoEVendedor(req, res, next) {
    var cdsupervisor = parseInt(req.body.cdsupervisor);
    var cdvendedor = parseInt(req.body.cdvendedor);

    db.one('SELECT * FROM supervisionados WHERE cdsupervisor = $1 AND cdvendedor = $2', [cdsupervisor,cdvendedor])
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
                    data_supervisionados: data,
                    message: 'Retrieved ONE supervisionado'
                });
        })
    .catch(function (err) {
        return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_supervisionados: 'Não existe o supervisionado ou houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function inserirSupervisionados(req, res, next) {
    var supervisionados;
    var query_insert = "INSERT INTO supervisionados(cdsupervisor,cdvendedor,situacao) VALUES ";

    //Percorre os supervisionados para salvar
    for (i in req.body) {
        supervisionados = req.body[i];


        query_insert += "("+ (supervisionados.cdsupervisor.localeCompare('') == 0 ? null : supervisionados.cdsupervisor)
                        +","+(supervisionados.cdvendedor.localeCompare('') == 0 ? null : supervisionados.cdvendedor)
                        +","+ (supervisionados.situacao.localeCompare('') == 0 ? null : "'"+supervisionados.situacao+"'")
                        +"), ";
    }
    query_insert = query_insert.substring(0, query_insert.length-2)+";";
    //console.log("query: " + query_insert);
    db.none(query_insert)
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Inserted all supervisionados'
                });
        })
    .catch(function (err) {
        return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_supervisionados: 'Erro: '+err,
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}


function deletarSupervisionados(req, res, next) {
    db.any('DELETE FROM supervisionados')
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Deleted ALL supervisionados'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_supervisionados: 'Houve algum problema.',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function deletarSupervisionadoPorCodigo(req, res, next) {
    var cdsupervisor = parseInt(req.body.cdsupervisor);
    var cdvendedor = parseInt(req.body.cdvendedor);

    db.any('DELETE FROM supervisionados WHERE cdsupervisor = $1 AND cdvendedor = $2', [cdsupervisor,cdvendedor])
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Deleted ONE supervisionado'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_supervisionados: 'Id inexistente ou houve algum problema.',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

module.exports = {
    recuperarSupervisionados: recuperarSupervisionados,
    recuperarSupervisionadoPorCodigoEVendedor: recuperarSupervisionadoPorCodigoEVendedor,
    recuperarSupervisionadoPorVendedor: recuperarSupervisionadoPorVendedor,
    inserirSupervisionados: inserirSupervisionados,
    deletarSupervisionadoPorCodigo: deletarSupervisionadoPorCodigo,
    deletarSupervisionados: deletarSupervisionados
};