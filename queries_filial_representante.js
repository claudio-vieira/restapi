var db = require('./conexao').getDb();
var utils = require('./utils');

function recuperarFilial(req, res, next) {
    db.any('select * from filial_representante')
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
                    data_representantes: data,
                    message: 'Retrieved ALL filial'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_representantes: 'Não existem filiais cadastradas ou houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function recuperarFilialPorVendedor(req, res, next) {
    var cdvendedor = parseInt(req.body.cdvendedor);

    db.any('SELECT * FROM filial_representante WHERE cdvendedor = $1', [cdvendedor])
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
                    data_representantes: data,
                    message: 'Retrieved ANY filial'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_representantes: 'Não existe a filial ou houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function recuperarFilialPorCodigoEVendedor(req, res, next) {
    var cdvendedor = parseInt(req.body.cdvendedor);
    var codigo = parseInt(req.body.cdfilial);

    db.one('SELECT * FROM filial_representante WHERE cdfilial = $1 AND cdvendedor = $2', [codigo,cdvendedor])
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
                    data_representantes: data,
                    message: 'Retrieved ONE filial'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_representantes: 'Não existe a filial ou houve algum problema',
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

function inserirFilial(req, res, next) {
    var filial;

    var error = 0;

    var vendedor = retornaTabelaParaValidacao('vendedores');   
    vendedor.then(resVendedor => {

        var localFaturamento = retornaTabelaParaValidacao('local_faturamento');   
        localFaturamento.then(resLocalFaturamento => {
    
            var query_insert = "INSERT INTO filial_representante(cdvendedor,cdfilial,descricao) VALUES ";

            //Percorre as filiais representantes para salvar
            for (i in req.body) {
                filial = req.body[i];

                /*for(var a=0; a < resVendedor.length; a++){
                    if(filial.cdvendedor.localeCompare(resVendedor[a].codigo, undefined, {numeric: true}) == 0){
                        query_insert += "("+(filial.cdvendedor.localeCompare('') == 0 ? null : filial.cdvendedor);
                        error -= a;
                        break;
                    }else{ 
                        error += 1;
                        errorMsg = "Vendedor '" + filial.cdvendedor + "' não cadastrado.";
                    } 
                }
                
                for(var b=0; b < resLocalFaturamento.length; b++){
                    if(filial.cdfilial.localeCompare(resLocalFaturamento[b].codigo, undefined, {numeric: true}) == 0){
                        query_insert += ","+(filial.cdfilial.localeCompare('') == 0 ? null : filial.cdfilial); 
                        error -= b;
                        break;
                    }else{ 
                        error += 1;
                        errorMsg = "Local de faturamento '" + filial.cdfilial + "' não cadastrado.";
                    } 
                }*/
                query_insert += 
                                "("+ (filial.cdvendedor.localeCompare('') == 0 ? '' : filial.cdvendedor)    
                                +","+ (filial.cdfilial.localeCompare('') == 0 ? '' : filial.cdfilial)    
                                +",'"+ (filial.descricao.localeCompare('') == 0 ? '' : filial.descricao)    
                                +"'), ";
                if(error > 0){
                    break;
                }
            }
            if(error > 0){
                res.status(400)
                        .json({
                            status: 'Warning',
                            data_representantes: errorMsg,
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
                                message: 'Inserted all filial'
                            });
                    })
                .catch(function (err) {
                    //return next(err);
                    res.status(400)
                            .json({
                                status: 'Warning',
                                data_representantes: 'Erro: '+err,
                                message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                            });
                });
            }
        });
    });
}

function deletarFilial(req, res, next) {
    db.any('DELETE FROM filial_representante')
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Deleted ALL filial'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_representantes: 'Houve algum problema.',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function deletarFilialPorCodigo(req, res, next) {
    var codigo = parseInt(req.body.cdfilial);
    db.any('DELETE FROM filial_representante WHERE cdfilial = $1', codigo)
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Deleted ONE filial'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_representantes: 'Id inexistente ou houve algum problema.',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

module.exports = {
    recuperarFilial: recuperarFilial,
    recuperarFilialPorVendedor: recuperarFilialPorVendedor,
    recuperarFilialPorCodigoEVendedor: recuperarFilialPorCodigoEVendedor,
    inserirFilial: inserirFilial,
    deletarFilialPorCodigo: deletarFilialPorCodigo,
    deletarFilial: deletarFilial
};