var db = require('./conexao').getDb();
var utils = require('./utils');

function recuperarPromocaoEspecial(req, res, next) {
    db.any('select * from promocao_especial')
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
                    data_promocoes: data,
                    message: 'Retrieved ALL promocao especial'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_promocoes: 'Houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function recuperarPromocaoEspecialPorVendedor(req, res, next) {
    var cdvendedor = parseInt(req.body.cdvendedor);

    db.any('SELECT * FROM promocao_especial WHERE cdvendedor = $1', cdvendedor)
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
                    data_promocoes: data,
                    message: 'Retrieved ONE promocao especial'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_promocoes: 'Não existe o promocao especial ou houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function recuperarPromocaoEspecialPorCodigo(req, res, next) {
    var codigo = parseInt(req.body.idpromocao);

    db.one('SELECT * FROM promocao_especial WHERE idpromocao = $1', codigo)
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
                    data_promocoes: data,
                    message: 'Retrieved ONE promocao especial'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_promocoes: 'Não existe o promocao especial ou houve algum problema',
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

function inserirPromocaoEspecial(req, res, next) {
    var promocao;
    var error = 0;

    var vendedor = retornaTabelaParaValidacao('vendedores');   
    vendedor.then(resVendedor => {

        var localFaturamento = retornaTabelaParaValidacao('local_faturamento');   
        localFaturamento.then(resLocalFaturamento => {
    
            var produto = retornaTabelaParaValidacao('produtos');   
            produto.then(resProdutos => {

                var query_insert = "INSERT INTO promocao_especial (cdvendedor,cdfilialfaturamento,cdproduto,uftabpreco,"
                                                                    +"cdcliente,tipotabpreco,dtvalidade,percentualdesc) VALUES ";

                //Percorre os promocao especial para salvar
                for (i in req.body) {
                    promocao = req.body[i];

                    /*for(var a=0; a < resVendedor.length; a++){
                        if(promocao.cdvendedor.localeCompare(resVendedor[a].codigo, undefined, {numeric: true}) == 0){
                            query_insert += "(" + (promocao.cdvendedor.localeCompare('') == 0 ? null : promocao.cdvendedor)
                            error -= a;
                            break;
                        }else{ 
                            if(error <= 0)
                                errorMsg = "Vendedor '" + promocao.cdvendedor + "' não cadastrado.";
                            error += 1;
                        } 
                    }
                    
                    for(var b=0; b < resLocalFaturamento.length; b++){
                        if(promocao.cdfilialfaturamento.localeCompare(resLocalFaturamento[b].codigo, undefined, {numeric: true}) == 0){
                            query_insert += "," + (promocao.cdfilialfaturamento.localeCompare('') == 0 ? null : promocao.cdfilialfaturamento);
                            error -= b;
                            break;
                        }else{ 
                            if(error <= 0)
                                errorMsg = "Local de faturamento '" + promocao.cdfilialfaturamento + "' não cadastrado.";
                            error += 1;
                        } 
                    }

                    for(var c=0; c < resProdutos.length; c++){
                        if(promocao.cdproduto.localeCompare(resProdutos[c].codigo, undefined, {numeric: true}) == 0){
                            query_insert += "," + (promocao.cdproduto.localeCompare('') == 0 ? null : promocao.cdproduto);
                            error -= c;
                            break;
                        }else{
                            if(error <= 0)
                                errorMsg = "Produto não cadastrado '" + promocao.cdproduto + "' não cadastrado.";
                            error += 1;
                        } 
                    }*/

                    query_insert += 
                                    "("+ (promocao.cdvendedor.localeCompare('') == 0 ? null : promocao.cdvendedor)
                                    +","+ (promocao.cdfilialfaturamento.localeCompare('') == null ? null : promocao.cdfilialfaturamento)
                                    +","+ (promocao.cdproduto.localeCompare('') == 0 ? null : promocao.cdproduto)
                                    +","+ (promocao.uftabpreco.localeCompare('') == 0 ? null : "'"+promocao.uftabpreco+"'")
                                    +","+ (promocao.cdcliente.localeCompare('') == 0 ? null : promocao.cdcliente)
                                    +","+ (promocao.tipotabpreco.localeCompare('') == 0 ? null : promocao.tipotabpreco)
                                    +","+ (promocao.dtvalidade.localeCompare('') == 0 ? null : "'"+promocao.dtvalidade+"'")
                                    +","+ (promocao.percentualdesc.localeCompare('') == 0 ? null : promocao.percentualdesc.replace(/,/, '.'))
                                    +"), ";
                    if(error > 0){
                        break;
                    }
                }

                if(error > 0){
                    res.status(400)
                        .json({
                            status: 'Warning',
                            data_promocoes: errorMsg,
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
                                    message: 'Inserted all promocao especial'
                                });
                        })
                    .catch(function (err) {
                        //return next(err);
                        res.status(400)
                            .json({
                                status: 'Warning',
                                data_promocoes: 'Erro: '+err,
                                message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                            });
                    });
                }
            });
        });
    });

}

function deletarPromocaoEspecial(req, res, next) {
    db.any('DELETE FROM promocao_especial')
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Deleted ALL promocao especial'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_promocoes: 'Houve algum problema.',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function deletarPromocaoEspecialPorCodigo(req, res, next) {
    var codigo = parseInt(req.body.idpromocao);

    db.any('DELETE FROM promocao_especial WHERE idpromocao = $1', codigo)
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Deleted ONE promocao especial'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_promocoes: 'Id inexistente ou houve algum problema.',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

module.exports = {
    recuperarPromocaoEspecial: recuperarPromocaoEspecial,
    recuperarPromocaoEspecialPorCodigo: recuperarPromocaoEspecialPorCodigo,
    recuperarPromocaoEspecialPorVendedor: recuperarPromocaoEspecialPorVendedor,
    inserirPromocaoEspecial: inserirPromocaoEspecial,
    deletarPromocaoEspecialPorCodigo: deletarPromocaoEspecialPorCodigo,
    deletarPromocaoEspecial: deletarPromocaoEspecial
};