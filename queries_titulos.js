var db = require('./conexao').getDb();
var utils = require('./utils');

function recuperarTitulos(req, res, next) {
    db.any('select * from titulos')
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
                    data_titulos: data,
                    message: 'Retrieved ALL titulos'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_titulos: 'Não existem titulos cadastrados ou houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function recuperarTituloPorVendedor(req, res, next) {
    var cdvendedor = parseInt(req.body.cdvendedor);

    db.any('SELECT * FROM titulos WHERE cdvendedor = $1', cdvendedor)
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
                    data_titulos: data,
                    message: 'Retrieved ONE titulo'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_titulos: 'Não existe o titulo ou houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function recuperarTituloPorCodigo(req, res, next) {
    var idtitulos = parseInt(req.body.idtitulos);

    db.one('SELECT * FROM titulos WHERE idtitulos = $1', idtitulos)
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
                    data_titulos: data,
                    message: 'Retrieved ONE titulo'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_titulos: 'Não existe o titulo ou houve algum problema',
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

function inserirTitulos(req, res, next) {
    var titulo;
    var error = 0;

    var vendedor = retornaTabelaParaValidacao('vendedores');   
    vendedor.then(resVendedor => {

        var localFaturamento = retornaTabelaParaValidacao('local_faturamento');   
        localFaturamento.then(resLocalFaturamento => {
    
            var query_insert = "INSERT INTO titulos(cdvendedor,cdfilial,cdpreposto,cdcliente,tipodoc,desccobranca,nudocumento,nuparcela,tipodocfilho,"
                                                    +"nuparcelafilho,desccobrancafilho,dtvencimento,valordocumento,situacao,dtemissao) VALUES ";

            //Percorre os titulos para salvar
            for (i in req.body) {
                titulo = req.body[i];
                
                /*for(var a=0; a < resVendedor.length; a++){
                    if(titulo.cdvendedor.localeCompare(resVendedor[a].codigo, undefined, {numeric: true}) == 0){
                        query_insert += "(" + (titulo.cdvendedor.localeCompare('') == 0 ? null : titulo.cdvendedor);
                        error -= a;
                        break;
                    }else{ 
                        if(error <= 0)
                            errorMsg = "Vendedor '" + titulo.cdvendedor + "' não cadastrado.";
                        error += 1;
                    } 
                }
                
                for(var b=0; b < resLocalFaturamento.length; b++){
                    if(titulo.cdfilial.localeCompare(resLocalFaturamento[b].codigo, undefined, {numeric: true}) == 0){
                        query_insert += ","+(titulo.cdfilial.localeCompare('') == 0 ? null : titulo.cdfilial);
                        error -= b;
                        break;
                    }else{ 
                        if(error <= 0)
                            errorMsg = "Local de faturamento '" + titulo.cdfilial + "' não cadastrado.";
                        error += 1;
                    } 
                }*/

                query_insert +=  
                                "("+(titulo.cdvendedor.localeCompare('') == 0 ? null : titulo.cdvendedor)
                                +","+(titulo.cdfilial.localeCompare('') == 0 ? null : titulo.cdfilial)
                                +","+(titulo.cdpreposto.localeCompare('') == 0 ? null : titulo.cdpreposto)
                                +","+(titulo.cdcliente.localeCompare('') == 0 ? null : titulo.cdcliente)
                                +","+(titulo.tipodoc.localeCompare('') == 0 ? null : titulo.tipodoc)
                                +","+(titulo.desccobranca.localeCompare('') == 0 ? null : "'"+titulo.desccobranca+"'")
                                +","+(titulo.nudocumento.localeCompare('') == 0 ? null : titulo.nudocumento)
                                +","+(titulo.nuparcela.localeCompare('') == 0 ? null : titulo.nuparcela)
                                +","+(titulo.tipodocfilho.localeCompare('') == 0 ? null : titulo.tipodocfilho)
                                +","+(titulo.nuparcelafilho.localeCompare('') == 0 ? null : titulo.nuparcelafilho)
                                +","+(titulo.desccobrancafilho.localeCompare('') == 0 ? null : "'"+titulo.desccobrancafilho+"'")
                                +","+(titulo.dtvencimento.localeCompare('') == 0 ? null : "'"+utils.convertDataDDMMYYYYSplitBar(titulo.dtvencimento)+"'")
                                +","+(titulo.valordocumento.localeCompare('') == 0 ? null : titulo.valordocumento.replace(/,/, '.'))
                                +","+(titulo.situacao.localeCompare('') == 0 ? null : titulo.situacao)
                                +","+(titulo.dtemissao.localeCompare('') == 0 ? null : "'"+utils.convertDataDDMMYYYYSplitBar(titulo.dtemissao)+"'")
                                +"), ";
                if(error > 0){
                    break;
                }
            }

            if(error > 0){
                res.status(400)
                    .json({
                        status: 'Warning',
                        data_titulos: errorMsg,
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
                                message: 'Inserted all titulos'
                            });
                    })
                .catch(function (err) {
                    //return next(err);
                    res.status(400)
                        .json({
                            status: 'Warning',
                            data_titulos: 'Erro: '+err,
                            message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                        });
                });
            }
        });
    });
}


function deletarTitulos(req, res, next) {
    db.any('DELETE FROM titulos')
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Deleted ALL titulos'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_titulos: 'Houve algum problema.',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function deletarTituloPorCodigo(req, res, next) {
    var idtitulos = parseInt(req.body.idtitulos);

    db.any('DELETE FROM titulos WHERE idtitulos = $1', idtitulos)
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Deleted ONE titulo'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_titulos: 'Id inexistente ou houve algum problema.',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

module.exports = {
    recuperarTitulos: recuperarTitulos,
    recuperarTituloPorCodigo: recuperarTituloPorCodigo,
    recuperarTituloPorVendedor: recuperarTituloPorVendedor,
    inserirTitulos: inserirTitulos,
    deletarTituloPorCodigo: deletarTituloPorCodigo,
    deletarTitulos: deletarTitulos
};