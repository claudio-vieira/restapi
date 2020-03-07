var db = require('./conexao').getDb();
var utils = require('./utils');

function recuperarNotaItens(req, res, next) {
    db.any('select * from notaitens')
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
                    data_notaitens: data,
                    message: 'Retrieved ALL notas fiscal'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_notaitens: 'Não existem notas itens cadastrados ou houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function recuperarNotaItensPorVendedor(req, res, next) {
    var cdvendedor = parseInt(req.body.cdvendedor);

    db.any('SELECT * FROM notaitens WHERE cdvendedor = $1', cdvendedor)
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
                    data_notaitens: data,
                    message: 'Retrieved ONE notas'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_notaitens: 'Não existe o notas itens ou houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function recuperarNotaItensPorNota(req, res, next) {
    var nunotafiscal = parseInt(req.body.nunotafiscal);

    db.one('SELECT * FROM notaitens WHERE nunotafiscal = $1', nunotafiscal)
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
                    data_notaitens: data,
                    message: 'Retrieved ONE notas'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_notaitens: 'Não existe o notas itens ou houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function retornaTabelaParaValidacao(nomeTabela){
    var p1 = new Promise(
        function(resolve, reject) {         
            db.query('select * from ' + nomeTabela)
                .then(function (data) {
                    resolve(data);
                })
            .catch(function (err) {
                return next(err);
            });
    });
    return p1;
}

function inserirNotasItens(req, res, next) {
    var notaItem;
    var error = 0;

    var notaitens = retornaTabelaParaValidacao('notaitens');   
    notaitens.then(resNotaItens => {

        var localFaturamento = retornaTabelaParaValidacao('local_faturamento');   
        localFaturamento.then(resLocalFaturamento => {
    
            var query_insert = "INSERT INTO notaitens(cdvendedor,cdpreposto,cdfilial,nunotafiscal,serienf,cdproduto,qtdeproduto,valorunitario) VALUES ";

            //Percorre os notas para salvar
            for (i in req.body) {
                notaItem = req.body[i];

                query_insert +=  
                                "("+(notaItem.cdvendedor.localeCompare('') == 0 ? null : notaItem.cdvendedor)
								+","+(notaItem.cdpreposto.localeCompare('') == 0 ? null : notaItem.cdpreposto)
                                +","+(notaItem.cdfilial.localeCompare('') == 0 ? null : notaItem.cdfilial)
								 +","+(notaItem.nunotafiscal.localeCompare('') == 0 ? null : notaItem.nunotafiscal)
								 +","+(notaItem.serienf.localeCompare('') == 0 ? null : notaItem.serienf)
                                +","+(notaItem.cdproduto.localeCompare('') == 0 ? null : notaItem.cdproduto)
								 +","+(notaItem.qtdeproduto.localeCompare('') == 0 ? null : notaItem.qtdeproduto)
								 +","+(notaItem.valorunitario.localeCompare('') == 0 ? null : notaItem.valorunitario)
								 
                                +"), ";
                if(error > 0){
                    break;
                }
            }

            if(error > 0){
                res.status(400)
                    .json({
                        status: 'Warning',
                        data_notaitens: errorMsg,
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
                                message: 'Inserted all notas'
                            });
                    })
                .catch(function (err) {
                    //return next(err);
                    res.status(400)
                        .json({
                            status: 'Warning',
                            data_notaitens: 'Erro: '+err,
                            message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                        });
                });
            }
        });
    });
}

function deletarNotasItens(req, res, next) {
    db.any('DELETE FROM notaitens')
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Deleted ALL notas itens'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_notaitens: 'Houve algum problema.',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function deletarNotaItensPorCodigo(req, res, next) {
    var nunotafiscal = parseInt(req.body.nunotafiscal);

    db.any('DELETE FROM notaitens WHERE nunotafiscal = $1', nunotafiscal)
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Deleted ONE nota itens'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_notaitens: 'numero nota inexistente ou houve algum problema.',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

module.exports = {
    recuperarNotaItens: recuperarNotaItens,
    recuperarNotaItensPorNota: recuperarNotaItensPorNota,
    recuperarNotaItensPorVendedor: recuperarNotaItensPorVendedor,
    inserirNotasItens: inserirNotasItens,
    deletarNotaItensPorCodigo: deletarNotaItensPorCodigo,
    deletarNotasItens: deletarNotasItens
};