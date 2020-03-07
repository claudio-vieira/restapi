var db = require('./conexao').getDb();
var utils = require('./utils');

function recuperarComissao(req, res, next) {
    db.any('select * from comissao_filial')
        .then(function (data) {
            data.forEach(function(value) {
                var items = Object.keys(value);
            });  
            res.status(200)
                .json({
                    status: 'success',
                    data_comissao: data,
                    message: 'Retrieved ALL COMISSAO'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_comissao: 'Não existem COMISSAO cadastrados ou houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function recuperarComissaoPorVendedor(req, res, next) {
    var cdvendedor = parseInt(req.body.cdvendedor);

    db.any('SELECT * FROM comissao_filial WHERE  cdrepresentante = $1', cdvendedor)
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
                    data_comissao: data,
                    message: 'Retrieved ONE comissao'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_comissao: 'Não existe o comissao ou houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function inserirComissao(req, res, next) {
    var comi;
    var query_insert = "INSERT INTO comissao_filial(cdrepresentante,idfilial,valorcomissao,valormassacomissao,valorbiscoitocomissao,valoroutrocomissao) VALUES ";

    //Percorre os titulos para salvar
    for (i in req.body) {
        comi = req.body[i];

        query_insert +=  
                        "("+(comi.cdrepresentante.localeCompare('') == 0 ? null : comi.cdrepresentante)
                        +","+(comi.idfilial.localeCompare('') == 0 ? null : comi.idfilial)
                        +","+(comi.valorcomissao.localeCompare('') == 0 ? null : comi.valorcomissao)
                        +","+(comi.valormassacomissao.localeCompare('') == 0 ? null : comi.valormassacomissao)
                        +","+(comi.valorbiscoitocomissao.localeCompare('') == 0 ? null : comi.valorbiscoitocomissao)
                        +","+(comi.valoroutrocomissao.localeCompare('') == 0 ? null : comi.valoroutrocomissao)
                        +"), ";
        if(error > 0){
            break;
        }
    }

    if(error > 0){
        res.status(400)
            .json({
                status: 'Warning',
                data_comissao: errorMsg,
                message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
            });
    }else{
        query_insert = query_insert.substring(0, query_insert.length-2)+";";
        //console.log("query: " + query_insert);

        db.none(query_insert)
            .then(function () {
                res.status(200)
                    .json({
                        status: 'success',
                        message: 'Inserted all COMISSAO'
                    });
            })
        .catch(function (err) {
            //return next(err);
            res.status(400)
                .json({
                    status: 'Warning',
                    data_comissao: 'Erro: '+err,
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
        });
    }
}


function deletarComissao(req, res, next) {
    db.any('DELETE FROM comissao_filial')
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Deleted ALL comissao_filial'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_comissao: 'Houve algum problema.',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

module.exports = {
    recuperarComissao: recuperarComissao,
    inserirComissao: inserirComissao,
    deletarComissao: deletarComissao,
	recuperarComissaoPorVendedor : recuperarComissaoPorVendedor
};