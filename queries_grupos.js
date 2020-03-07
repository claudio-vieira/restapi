var db = require('./conexao').getDb();
var utils = require('./utils');

function recuperarGrupos(req, res, next) {
    db.any('select * from grupos')
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
                    data_grupos: data,
                    message: 'Retrieved ALL grupos'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_grupos: 'Houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function recuperarGruposPorCodigo(req, res, next) {
    var codigo = parseInt(req.body.codigo);
    db.one('SELECT * FROM grupos WHERE codigo = $1', codigo)
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
                    data_grupos: data,
                    message: 'Retrieved ONE grupo'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_grupos: 'Não existe o grupo ou houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function inserirGrupos(req, res, next) {
    var grupo;
    var query_insert = "INSERT INTO grupos (codigo,descricao,situacao) VALUES ";

    //Percorre os grupos para salvar
    for (i in req.body) {
        grupo = req.body[i];


        query_insert += "("+ (grupo.codigo.localeCompare('') == 0 ? null : grupo.codigo)
                        +",'"+ (grupo.descricao.localeCompare('') == 0 ? '' : grupo.descricao) + "'"
                        +","+ (grupo.situacao.localeCompare('') == 0 ? null : grupo.situacao)   
                        +"), ";
    }
    query_insert = query_insert.substring(0, query_insert.length-2)+";";
    //console.log("query: " + query_insert);

    db.none(query_insert)
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Inserted all grupos'
                });
        })
    .catch(function (err) {
        return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_grupos: 'Houve algum problema.',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function deletarGrupos(req, res, next) {
    db.any('DELETE FROM grupos')
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Deleted ALL grupos'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_grupos: 'Houve algum problema.',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function deletarGruposPorCodigo(req, res, next) {
    var codigo = parseInt(req.body.codigo);
    db.any('DELETE FROM grupos WHERE codigo = $1', codigo)
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Deleted ONE grupo'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_grupos: 'Id inexistente ou houve algum problema.',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

module.exports = {
    recuperarGrupos: recuperarGrupos,
    recuperarGruposPorCodigo: recuperarGruposPorCodigo,
    inserirGrupos: inserirGrupos,
    deletarGruposPorCodigo: deletarGruposPorCodigo,
    deletarGrupos: deletarGrupos
};