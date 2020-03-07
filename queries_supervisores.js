var db = require('./conexao').getDb();
var utils = require('./utils');

function recuperarSupervisores(req, res, next) {
    db.any('select * from supervisores')
        .then(function (data) {
            data.forEach(function(value) {
                var items = Object.keys(value);
                /*items.forEach(function(item) {
                    if(value[item] == null){
                       value[item] = '';
                    }
                });*/
            });  
            res.status(200)
                .json({
                    status: 'success',
                    data_supervisores: data,
                    message: 'Retrieved ALL supervisores'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_supervisores: 'Não existem supervisores cadastrados ou houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function recuperarSupervisorPorCodigo(req, res, next) {
    var codigo = parseInt(req.body.codigo);

    db.one('SELECT * FROM supervisores WHERE codigo = $1', codigo)
        .then(function (data) {
            var items = Object.keys(data);
            /*items.forEach(function(item) {
                if(data[item] == null){
                   data[item] = '';
                }
            });*/
            res.status(200)
                .json({
                    status: 'success',
                    data_supervisores: data,
                    message: 'Retrieved ONE supervisor'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_supervisores: 'Não existe o supervisor ou houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function recuperarSupervisorParaLogin(req, res, next) {
    const param = req.body;

    var login = '';
    var senha = '';
    
    if(param.login !== undefined && param.login != '' && param.senha !== undefined && param.senha != ''){
        login = parseInt(param.login);
        senha = parseInt(param.senha);
    }else{
        return res.status(401).json({error: '� obrigat�rio o par�metro (login) e (senha) no corpo da requisi��o'});
    }

    db.one('SELECT * FROM supervisores WHERE codigo = $1 and codigo = $2 ', [login,senha])
        .then(function (data) {
            var items = Object.keys(data);
            if(items.length == 0){
                return res.status(400)
                .json({
                    status: 'Warning',
                    data_supervisores: '',
                    message: 'Supervisor n�o encontrado.'
                });
            }else{
            return res.status(200)
                .json({
                    status: 'success',
                    data_supervisores: data,
                    message: 'Retrieved ONE supervisor'
                });
            }
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_supervisores: 'N�o existe o supervisor ou houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function inserirSupervisores(req, res, next) {
    var supervisores;
    var query_insert = "INSERT INTO supervisores(codigo,descricao,situacao,percdesconto) VALUES ";

    //Percorre os supervisores para salvar
    for (i in req.body) {
        supervisores = req.body[i];


        query_insert += "("+ (supervisores.codigo.localeCompare('') == 0 ? null : supervisores.codigo)
                        +","+ (supervisores.descricao.localeCompare('') == 0 ? null : "'"+supervisores.descricao+"'")
                        +","+ (supervisores.situacao.localeCompare('') == 0 ? null : "'"+supervisores.situacao+"'")
                        +","+ (supervisores.percdesconto.localeCompare('') == 0 ? null : supervisores.percdesconto.replace(/,/, '.'))
                        +"), ";
    }
    query_insert = query_insert.substring(0, query_insert.length-2)+";";
    //console.log("query: " + query_insert);
    db.none(query_insert)
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Inserted all supervisores'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_supervisores: 'Erro: '+err,
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}


function deletarSupervisores(req, res, next) {
    db.any('DELETE FROM supervisores')
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Deleted ALL supervisores'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_supervisores: 'Houve algum problema.',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function deletarSupervisorPorCodigo(req, res, next) {
    var codigo = parseInt(req.body.codigo);
    
    db.any('DELETE FROM supervisores WHERE codigo = $1', codigo)
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Deleted ONE supervisor'
                });
        })
    .catch(function (err) {
        return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_supervisores: 'Id inexistente ou houve algum problema.',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

module.exports = {
    recuperarSupervisores: recuperarSupervisores,
    recuperarSupervisorPorCodigo: recuperarSupervisorPorCodigo,
    recuperarSupervisorParaLogin: recuperarSupervisorParaLogin,
    inserirSupervisores: inserirSupervisores,
    deletarSupervisorPorCodigo: deletarSupervisorPorCodigo,
    deletarSupervisores: deletarSupervisores
};