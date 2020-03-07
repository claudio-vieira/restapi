var db = require('./conexao').getDb();
var utils = require('./utils');

function recuperarGrupoConcedeDesconto(req, res, next) {
    db.any('select * from grupo_concede_desconto')
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
                    data_grupo_concede_descontos: data,
                    message: 'Retrieved ALL grupo concede desconto'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_grupo_concede_descontos: 'Houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function recuperarGrupoConcedeDescontoPorCodigo(req, res, next) {
    var codigo = parseInt(req.body.codigo);
    db.one('SELECT * FROM grupo_concede_desconto WHERE codigo = $1', codigo)
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
                    data_grupo_concede_descontos: data,
                    message: 'Retrieved ONE grupo concede desconto'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_grupo_concede_descontos: 'Não existe o grupo concede desconto ou houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function inserirGrupoConcedeDesconto(req, res, next) {
    var concedeDesc;
    var query_insert = "INSERT INTO grupo_concede_desconto (codigo,descricao,especieproduto) VALUES ";

    //Percorre os clientes para salvar
    for (i in req.body) {
        concedeDesc = req.body[i];


        query_insert += "("+ (concedeDesc.codigo.localeCompare('') == 0 ? null : concedeDesc.codigo)
                        +",'"+ (concedeDesc.descricao.localeCompare('') == 0 ? '' : concedeDesc.descricao) + "'"
                        +","+ (concedeDesc.especieproduto.localeCompare('') == 0 ? null : concedeDesc.especieproduto)   
                        +"), ";
    }
    query_insert = query_insert.substring(0, query_insert.length-2)+";";
    //console.log("query: " + query_insert);

    db.none(query_insert)
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Inserted all grupo concede desconto'
                });
        })
    .catch(function (err) {
        return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_grupo_concede_descontos: 'Houve algum problema.',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function deletarGrupoConcedeDesconto(req, res, next) {
    db.any('DELETE FROM grupo_concede_desconto')
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Deleted ALL grupo concede desconto'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_grupo_concede_descontos: 'Houve algum problema.',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function deletarGrupoConcedeDescontoPorCodigo(req, res, next) {
    var codigo = parseInt(req.body.codigo);
    db.any('DELETE FROM grupo_concede_desconto WHERE codigo = $1', codigo)
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Deleted ONE grupo concede desconto'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_grupo_concede_descontos: 'Id inexistente ou houve algum problema.',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

module.exports = {
    recuperarGrupoConcedeDesconto: recuperarGrupoConcedeDesconto,
    recuperarGrupoConcedeDescontoPorCodigo: recuperarGrupoConcedeDescontoPorCodigo,
    inserirGrupoConcedeDesconto: inserirGrupoConcedeDesconto,
    deletarGrupoConcedeDescontoPorCodigo: deletarGrupoConcedeDescontoPorCodigo,
    deletarGrupoConcedeDesconto: deletarGrupoConcedeDesconto
};