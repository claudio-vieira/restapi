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
                    data_supervisores: 'NÃ£o existem supervisores cadastrados ou houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function recuperarSupervisorPorCodigo(req, res, next) {
    var codigo = parseInt(req.body.codigo);

    db.one('SELECT * FROM supervisores s WHERE s.codigo = $1', codigo)
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
                    data_supervisores: 'NÃ£o existe o supervisor ou houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function recuperarSupervisorPorCodigoGorduraAnoMes(req, res, next) {
    var codigo = parseInt(req.body.codigo);
    var anomes = parseInt(req.body.anomes);

    if(codigo == undefined || codigo == '' || anomes == undefined || anomes == ''){
        return res.status(401).json({error: 'Obrigatorio o parametro (codigo) e (anomes) no corpo da requisicao'});
    }

    //Query retorna os campos do supervisor mais a quantidade de gordura usada por ele no mês atual
    sql = "SELECT s.*, "+
        "coalesce((select sum(gorduraliberada) from pedidos_aprovados where cdsupervisor = "+codigo+" and dataliberada like '"+anomes+"'), 0) as saldoGorduraUsado, "+
        "coalesce((select valorgordura from saldo_gordura_sup where cdsupervisor = "+codigo+" and validadegordura like '"+anomes+"'), 0) as saldoGorduraInicio "+
        "FROM supervisores s  "+
        "LEFT JOIN pedidos_aprovados p on cdsupervisor = s.codigo "+
        "WHERE s.codigo = "+codigo+" group by s.codigo";

    console.log(sql);
    db.one(sql)
        .then(function (data) {
            var items = Object.keys(data);
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
                    data_supervisores: 'Nao existe o supervisor ou houve algum problema',
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
        return res.status(401).json({error: 'É obrigatório o parâmetro (login) e (senha) no corpo da requisição'});
    }

    db.one('SELECT * FROM supervisores WHERE codigo = $1 and codigo = $2 ', [login,senha])
        .then(function (data) {
            var items = Object.keys(data);
            if(items.length == 0){
                return res.status(400)
                .json({
                    status: 'Warning',
                    data_supervisores: '',
                    message: 'Supervisor nao encontrado.'
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
                    data_supervisores: 'Nao existe o supervisor ou houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function inserirSupervisores(req, res, next) {
    var supervisores;
    var query_insert = "INSERT INTO supervisores(codigo,descricao,situacao,percdesconto,valorgordura,validadegordura,email) VALUES ";

    //Percorre os supervisores para salvar
    for (i in req.body) {
        supervisores = req.body[i];


        query_insert += "("+ (supervisores.codigo.localeCompare('') == 0 ? null : supervisores.codigo)
                        +","+ (supervisores.descricao.localeCompare('') == 0 ? null : "'"+supervisores.descricao+"'")
                        +","+ (supervisores.situacao.localeCompare('') == 0 ? null : "'"+supervisores.situacao+"'")
                        +","+ (supervisores.percdesconto.localeCompare('') == 0 ? null : supervisores.percdesconto.replace(/,/, '.'))
                        +","+ (supervisores.valorgordura.localeCompare('') == 0 ? null : supervisores.valorgordura.replace(/,/, '.'))
                        +","+ (supervisores.validadegordura.localeCompare('') == 0 ? null : "'"+supervisores.validadegordura+"'")
                        +","+ (supervisores.email.localeCompare('') == 0 ? null : "'"+supervisores.email+"'")
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
    recuperarSupervisorPorCodigoGorduraAnoMes: recuperarSupervisorPorCodigoGorduraAnoMes,
    recuperarSupervisorParaLogin: recuperarSupervisorParaLogin,
    inserirSupervisores: inserirSupervisores,
    deletarSupervisorPorCodigo: deletarSupervisorPorCodigo,
    deletarSupervisores: deletarSupervisores
};