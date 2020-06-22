var db = require('./conexao').getDb();
var utils = require('./utils');

function recuperarDetalheGordura(req, res, next) {
    db.any('select * from detalhe_gordura')
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
                    data_detalhe_gordura: data,
                    message: 'Retrieved ALL detail gordura'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_detalhe_gordura: 'Não existem detalher da gordura cadastrados ou houve algum problema',
                    message: 'Erro: '+err
                });
    });
}

function recuperarDetalheGorduraPorVendedor(req, res, next) {
    var cdvendedor = parseInt(req.body.cdvendedor);

    db.any('SELECT * FROM detalhe_gordura WHERE cdvendedor = $1', [cdvendedor])
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
                    data_detalhe_gordura: data,
                    message: 'Retrieved ONE detail gordura'
                });
        })
    .catch(function (err) {
        return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_detalhe_gordura: 'Não existe o detalhes da gordura ou houve algum problema',
                    message: 'Erro: '+err
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

function inserirDetalheGordura(req, res, next) {
    var detalheGordura;
    var query_insert = "INSERT INTO detalhe_gordura(cdvendedor,nunotafiscal,addgordura,subgordura) VALUES ";
    var saldoPorVendedor = [];

    //Percorre os detalheGordura para salvar
    for (i in req.body) {
        detalheGordura = req.body[i];


        query_insert += "("+ (detalheGordura.cdvendedor == 0 ? null : detalheGordura.cdvendedor)
                        +","+(detalheGordura.nunotafiscal == 0 ? null : detalheGordura.nunotafiscal)
                        +","+(detalheGordura.addgordura == 0 ? null : detalheGordura.addgordura.toString().replace(/,/, '.'))
                        +","+ (detalheGordura.subgordura == 0 ? null : detalheGordura.subgordura.toString().replace(/,/, '.'))
                        +"), ";
        var valor = (parseFloat(detalheGordura.addgordura.toString().replace(/,/, '.')) + (-parseFloat(detalheGordura.subgordura.toString().replace(/,/, '.'))));
        //Alredy object in vector 
        /*if(saldoPorVendedor.some(saldo => saldo.cdvendedor === detalheGordura.cdvendedor)){
            var objIndex = saldoPorVendedor.findIndex((obj => obj.cdvendedor == detalheGordura.cdvendedor));
            saldoPorVendedor[objIndex].valor = (saldoPorVendedor[objIndex].valor + (valor));
        }
        //Don't have object in vector
        else{
            saldoPorVendedor.push({cdvendedor:detalheGordura.cdvendedor,saldo:valor});
        }*/

        //Alredy object in vector 
        if(saldoPorVendedor.some(saldo => saldo.cdvendedor === detalheGordura.cdvendedor)){
            var objIndex = saldoPorVendedor.findIndex(obj => obj.cdvendedor === detalheGordura.cdvendedor);
            //console.log("objIndex", objIndex);
            //console.log("TESTE X", saldoPorVendedor[objIndex].saldo);
            saldoPorVendedor[objIndex].saldo = (saldoPorVendedor[objIndex].saldo + (valor));
            //console.log("TESTE Y", saldoPorVendedor[objIndex].saldo);
            //console.log("saldoPorVendedor", saldoPorVendedor);
        }
        //Don't have object in vector
        else{
            //console.log("TESTE 6", {cdvendedor:detalheGordura[0],saldo:valor});
            //console.log("TESTE X", saldoPorVendedor[objIndex].valor);
            saldoPorVendedor.push({cdvendedor:detalheGordura.cdvendedor,saldo:valor});
            //console.log("TESTE Y", saldoPorVendedor[objIndex].valor);
            //console.log("saldoPorVendedor", saldoPorVendedor);
        }
    }

    query_insert = query_insert.substring(0, query_insert.length-2)+";";
    //console.log("query: " + query_insert);
    db.none(query_insert)
        .then(function () {

        var tipoVenda = retornaTabelaParaValidacao('saldo_gordura');   
            tipoVenda.then(resSaldoGordura => {

                //console.log(saldoPorVendedor);
                var query_insert_saldo;
                //Monta a estrutura de atualização dos saldos
                for(var i=0; i < saldoPorVendedor.length; i++){
                    query_insert_saldo = "UPDATE saldo_gordura SET ";
                    for(var j=0; j < resSaldoGordura.length; j++){
                        if(saldoPorVendedor[i].cdvendedor == resSaldoGordura[j].cdvendedor){
                            query_insert_saldo += "saldogordura = "+(resSaldoGordura[j].saldogordura + (saldoPorVendedor[i].saldo))
                            +" WHERE cdvendedor = "+resSaldoGordura[j].cdvendedor+";";
                        }
                    }
                }
                //console.log("query: " + query_insert_saldo);
                db.none(query_insert_saldo)
                .then(function () {

                })
                .catch(function (err) {
                    console.log("Err update saldo_gordura: "+err);
                });
            });
            res.status(200)
                    .json({
                        status: 'success',
                        message: 'Inserted all detalhes gordura'
                    });
        })
    .catch(function (err) {
        return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_detalhe_gordura: 'Erro: '+err,
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}


function deletarTodosDetalheGordura(req, res, next) {
    db.any('DELETE FROM detalhe_gordura')
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Deleted ALL detalhes gordura'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_detalhe_gordura: 'Houve algum problema.',
                    message: 'Err: '+err
                });
    });
}


module.exports = {
    recuperarDetalheGordura: recuperarDetalheGordura,
    recuperarDetalheGorduraPorVendedor: recuperarDetalheGorduraPorVendedor,
    inserirDetalheGordura: inserirDetalheGordura,
    deletarTodosDetalheGordura: deletarTodosDetalheGordura
};