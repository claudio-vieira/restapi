var db = require('./conexao').getDb();
var utils = require('./utils');

function recuperarNotaFiscal(req, res, next) {
    db.any('select * from notafiscal')
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
                    data_notafiscal: data,
                    message: 'Retrieved ALL notas fiscal'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_notafiscal: 'Não existem notas fiscais cadastrados ou houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function recuperarNotaFiscalPorVendedor(req, res, next) {
    var cdvendedor = parseInt(req.body.cdvendedor);

    db.any('SELECT * FROM notafiscal WHERE cdvendedor = $1', cdvendedor)
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
                    data_notafiscal: data,
                    message: 'Retrieved ONE notas'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_notafiscal: 'Não existe o notas ou houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function recuperarNotaFiscalPorCodigo(req, res, next) {
    var nunotafiscal = parseInt(req.body.nunotafiscal);

    db.one('SELECT * FROM notafiscal WHERE nunotafiscal = $1', nunotafiscal)
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
                    data_notafiscal: data,
                    message: 'Retrieved ONE notas'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_notafiscal: 'Não existe o notas ou houve algum problema',
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

function inserirNotas(req, res, next) {
    var nota;
    var error = 0;

    var vendedor = retornaTabelaParaValidacao('vendedores');   
    vendedor.then(resVendedor => {

        var localFaturamento = retornaTabelaParaValidacao('local_faturamento');   
        localFaturamento.then(resLocalFaturamento => {
    
            var query_insert = "INSERT INTO notafiscal(cdvendedor,cdfilial,cdpreposto,cdcliente,tipodoc,desccobranca,nudocumento,nuparcela,tipodocfilho,"
                                                    +"nuparcelafilho,desccobrancafilho,dtvencimento,valordocumento,situacao,dtemissao) VALUES ";

            //Percorre os notas para salvar
            for (i in req.body) {
                nota = req.body[i];
                
                /*for(var a=0; a < resVendedor.length; a++){
                    if(nota.cdvendedor.localeCompare(resVendedor[a].codigo, undefined, {numeric: true}) == 0){
                        query_insert += "(" + (nota.cdvendedor.localeCompare('') == 0 ? null : nota.cdvendedor);
                        error -= a;
                        break;
                    }else{ 
                        if(error <= 0)
                            errorMsg = "Vendedor '" + nota.cdvendedor + "' não cadastrado.";
                        error += 1;
                    } 
                }
                
                for(var b=0; b < resLocalFaturamento.length; b++){
                    if(nota.cdfilial.localeCompare(resLocalFaturamento[b].codigo, undefined, {numeric: true}) == 0){
                        query_insert += ","+(nota.cdfilial.localeCompare('') == 0 ? null : nota.cdfilial);
                        error -= b;
                        break;
                    }else{ 
                        if(error <= 0)
                            errorMsg = "Local de faturamento '" + nota.cdfilial + "' não cadastrado.";
                        error += 1;
                    } 
                }*/

                query_insert +=  
                                "("+(nota.cdvendedor.localeCompare('') == 0 ? null : nota.cdvendedor)
								+","+(nota.cdpreposto.localeCompare('') == 0 ? null : nota.cdpreposto)
                                +","+(nota.cdfilial.localeCompare('') == 0 ? null : nota.cdfilial)
                                +","+(nota.cdcliente.localeCompare('') == 0 ? null : nota.cdcliente)
                                +","+(nota.tipodoc.localeCompare('') == 0 ? null : nota.tipodoc)
                                +","+(nota.desccobranca.localeCompare('') == 0 ? null : "'"+nota.desccobranca+"'")
                                +","+(nota.nudocumento.localeCompare('') == 0 ? null : nota.nudocumento)
                                +","+(nota.nuparcela.localeCompare('') == 0 ? null : nota.nuparcela)
                                +","+(nota.tipodocfilho.localeCompare('') == 0 ? null : nota.tipodocfilho)
                                +","+(nota.nuparcelafilho.localeCompare('') == 0 ? null : nota.nuparcelafilho)
                                +","+(nota.desccobrancafilho.localeCompare('') == 0 ? null : "'"+nota.desccobrancafilho+"'")
                                +","+(nota.dtvencimento.localeCompare('') == 0 ? null : "'"+utils.convertDataDDMMYYYYSplitBar(nota.dtvencimento)+"'")
                                +","+(nota.valordocumento.localeCompare('') == 0 ? null : nota.valordocumento.replace(/,/, '.'))
                                +","+(nota.situacao.localeCompare('') == 0 ? null : nota.situacao)
                                +","+(nota.dtemissao.localeCompare('') == 0 ? null : "'"+utils.convertDataDDMMYYYYSplitBar(nota.dtemissao)+"'")
                                +"), ";
                if(error > 0){
                    break;
                }
            }

            if(error > 0){
                res.status(400)
                    .json({
                        status: 'Warning',
                        data_notafiscal: errorMsg,
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
                            data_notafiscal: 'Erro: '+err,
                            message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                        });
                });
            }
        });
    });
}


function deletarNotas(req, res, next) {
    db.any('DELETE FROM notafiscal')
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Deleted ALL notas fiscal'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_notafiscal: 'Houve algum problema.',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function deletarNotaFiscalPorCodigo(req, res, next) {
    var nunotafiscal = parseInt(req.body.nunotafiscal);

    db.any('DELETE FROM notafiscal WHERE nunotafiscal = $1', nunotafiscal)
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Deleted ONE nota fiscal'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_notafiscal: 'numero nota inexistente ou houve algum problema.',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

module.exports = {
    recuperarNotaFiscal: recuperarNotaFiscal,
    recuperarNotaFiscalPorCodigo: recuperarNotaFiscalPorCodigo,
    recuperarNotaFiscalPorVendedor: recuperarNotaFiscalPorVendedor,
    inserirNotas: inserirNotas,
    deletarNotaFiscalPorCodigo: deletarNotaFiscalPorCodigo,
    deletarNotas: deletarNotas
};