var db = require('./conexao').getDb();
var utils = require('./utils');

function recuperarSaldoGordura(req, res, next) {
    db.any('select * from saldo_gordura')
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
                    data_gorduras: data,
                    message: 'Retrieved ALL saldo gordura'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_gorduras: 'Não existem saldo gordura cadastrados ou houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function recuperarSaldoGorduraPorVendedor(req, res, next) {
    var cdvendedor = parseInt(req.body.cdvendedor);

    db.any('SELECT * FROM saldo_gordura WHERE cdvendedor = $1', [cdvendedor])
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
                    data_gorduras: data,
                    message: 'Retrieved ONE saldo gordura'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_gorduras: 'Não existe o pedido ou houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function recuperarSaldoGorduraPorCodigoEVendedor(req, res, next) {
    var cdvendedor = parseInt(req.body.cdvendedor);
    var saldogordura = parseFloat(req.body.saldogordura);

    db.one('SELECT * FROM saldo_gordura WHERE cdvendedor = $1 AND saldogordura = $2', [cdvendedor,saldogordura])
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
                    data_gorduras: data,
                    message: 'Retrieved ONE saldo gordura'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_gorduras: 'Não existe o pedido ou houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function inserirSaldoGordura(req, res, next) {
    var saldo;
    var query_insert = "INSERT INTO saldo_gordura(cdvendedor,saldogordura) VALUES ";

    //Percorre os saldo gordura para salvar
    for (i in req.body) {
        saldo = req.body[i];


        query_insert += "("+ (saldo.cdvendedor.localeCompare('') == 0 ? null : saldo.cdvendedor)
                        +","+ (saldo.saldogordura.localeCompare('') == 0 ? null : saldo.saldogordura.replace(/,/, '.'))    
                        +"), ";
    }
    query_insert = query_insert.substring(0, query_insert.length-2)+";";
    //console.log("query: " + query_insert);
    
    db.none(query_insert)
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Inserted all saldo gordura'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_gorduras: 'Erro: '+err,
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}


function deletarSaldoGordura(req, res, next) {
    db.any('DELETE FROM saldo_gordura')
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Deleted ALL saldo gordura'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
            .json({
                status: 'Warning',
                data_gorduras: 'Houve algum problema.',
                message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
            });
    });
}

function deletarSaldoGorduraPorCodigo(req, res, next) {
    var cdvendedor = parseInt(req.body.cdvendedor);
    var saldogordura = parseFloat(req.body.saldogordura);

    db.any('DELETE FROM saldo_gordura WHERE cdvendedor = $1 AND saldogordura = $2', [cdvendedor,saldogordura])
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Deleted ONE saldo gordura'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
            .json({
                status: 'Warning',
                data_gorduras: 'Id inexistente ou houve algum problema.',
                message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
            });
    });
}

function atualizarSaldoGordura(req, res, next){
	const param = req.body;
		
    if(param.saldogordura == undefined || param.saldogordura == ''){
        return res.status(400).json({error: '(saldogordura) obrigatorio no corpo da requisicao'});
    }

    if(param.cdvendedor == undefined || param.cdvendedor == ''){
        return res.status(400).json({error: '(cdvendedor) obrigatorio no corpo da requisicao'});
    }

    db.task('update-saldo', async t => {

        await t.any('update saldo_gordura set saldogordura = '+param.saldogordura+' where saldonovo = false and cdvendedor = '+param.cdvendedor);
        await t.any('update saldo_gordura set saldonovo = false where and cdvendedor = '+param.cdvendedor);

    })
    .then(data => {
        // success
        // data = as returned from the task's callback
        
    })
    .catch(error => {
        // error
        //Pedido já inserido gera cod 23505
    });
}

module.exports = {
    recuperarSaldoGordura: recuperarSaldoGordura,
    recuperarSaldoGorduraPorCodigoEVendedor: recuperarSaldoGorduraPorCodigoEVendedor,
    recuperarSaldoGorduraPorVendedor: recuperarSaldoGorduraPorVendedor,
    inserirSaldoGordura: inserirSaldoGordura,
    deletarSaldoGorduraPorCodigo: deletarSaldoGorduraPorCodigo,
    deletarSaldoGordura: deletarSaldoGordura,
    atualizarSaldoGordura: atualizarSaldoGordura
};