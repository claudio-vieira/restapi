var db = require('./conexao').getDb();
var utils = require('./utils');

function recuperarSubgrupo(req, res, next) {
    db.any('select * from sub_grupos')
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
                    data_sub_grupos: data,
                    message: 'Retrieved ALL sub-grupos'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_sub_grupos: 'Houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function recuperarSubgrupoPorCodigo(req, res, next) {
    var codigo = parseInt(req.body.codigo);
    db.one('SELECT * FROM sub_grupos WHERE codigo = $1', codigo)
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
                    data_sub_grupos: data,
                    message: 'Retrieved ONE sub-grupo'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_sub_grupos: 'Não existe o grupo ou houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function inserirSubgrupo(req, res, next) {
    var subgrupo;
    var query_insert = "INSERT INTO sub_grupos (codigo,codigo_sub_grupo,descricao,situacao) VALUES ";

    //Percorre os clientes para salvar
    for (i in req.body) {
        subgrupo = req.body[i];


        query_insert += "("+ (subgrupo.codigo.localeCompare('') == 0 ? null : subgrupo.codigo)
                        +","+ (subgrupo.codigo_sub_grupo.localeCompare('') == 0 ? null : subgrupo.codigo_sub_grupo)
                        +","+ (subgrupo.descricao.localeCompare('') == 0 ? null : "'"+subgrupo.descricao+"'")
                        +","+ (subgrupo.situacao.localeCompare('') == 0 ? null : subgrupo.situacao)   
                        +"), ";
    }
    query_insert = query_insert.substring(0, query_insert.length-2)+";";
    //console.log("query: " + query_insert);

    db.none(query_insert)
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Inserted all sub-grupos'
                });
        })
    .catch(function (err) {
        return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_sub_grupos: 'Erro: '+err,
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function deletarSubgrupo(req, res, next) {
    db.any('DELETE FROM sub_grupos')
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Deleted ALL sub-grupos'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_sub_grupos: 'Houve algum problema.',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function deletarSubgrupoPorCodigo(req, res, next) {
    var codigo = parseInt(req.body.codigo);
    db.any('DELETE FROM sub_grupos WHERE codigo = $1', codigo)
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Deleted ONE sub-grupo'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_sub_grupos: 'Id inexistente ou houve algum problema.',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

module.exports = {
    recuperarSubgrupo: recuperarSubgrupo,
    recuperarSubgrupoPorCodigo: recuperarSubgrupoPorCodigo,
    inserirSubgrupo: inserirSubgrupo,
    deletarSubgrupoPorCodigo: deletarSubgrupoPorCodigo,
    deletarSubgrupo: deletarSubgrupo
};