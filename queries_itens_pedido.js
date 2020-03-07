var db = require('./conexao').getDb();
var utils = require('./utils');

function recuperarItensPedido(req, res, next) {
    db.any('select * from itens_pedido')
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
                    data_itens: data,
                    message: 'Retrieved ALL itens'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_itens: 'Não existem itens cadastrados ou houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function recuperarItensPedidoPorVendedor(req, res, next) {
    var cdvendedor = parseInt(req.body.cdvendedor);
    db.any('SELECT * FROM itens_pedido WHERE cdvendedor = $1', cdvendedor)
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
                    data_itens: data,
                    message: 'Retrieved ONE item'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_itens: 'Não existe o pedido ou houve algum problema',
                    message: 'Erro: '+err
                });
    });
}

function recuperarItensPorPedido(req, res, next) {

    const param = req.body;
    var codigo = '';

    if(param.cdpedido !== undefined && param.cdpedido != ''){
        codigo = parseInt(param.cdpedido);
    }else{
       return res.status(401).json({error: 'Parametro (cdpedido) defenido incorretamente'});
    }

    db.any(' SELECT '+
    ' itens_pedido.cdvendedor,            '+
    ' itens_pedido.cdpreposto,            '+
    ' itens_pedido.cdlocalfaturamento,    '+
    ' itens_pedido.cdpedido,              '+
    ' itens_pedido.descricaoproduto,      '+
    ' itens_pedido.cdproduto,             '+
    ' itens_pedido.qtdeproduto,           '+
    ' cast(round(cast( case when itens_pedido.valorunitario is not null then itens_pedido.valorunitario else 0 end as numeric),2) as double precision) as "valorunitario",       '+  
     ' cast(round(cast( case when itens_pedido.precotabela is not null then itens_pedido.precotabela else 0 end as numeric),2) as double precision) as "precotabela",           '+
     ' cast(round(cast( case when itens_pedido.precovenda is not null then itens_pedido.precovenda else 0 end as numeric),2) as double precision) as "precovenda",              '+
     ' cast(round(cast( case when itens_pedido.percdesconto is not null then itens_pedido.percdesconto else 0 end as numeric),2) as double precision) as "percdesconto",          '+
     ' cast(round(cast( case when itens_pedido.percdescontomax is not null then itens_pedido.percdescontomax else 0 end as numeric),2) as double precision) as "percdescontomax",   '+    
     ' cast(round(cast( case when itens_pedido.percdescontomin is not null then itens_pedido.percdescontomin else 0 end as numeric),2) as double precision) as "percdescontomin",     '+  
     ' cast(round(cast( case when itens_pedido.valordesconto is not null then itens_pedido.valordesconto else 0 end as numeric),2) as double precision) as "valordesconto",         '+
     ' itens_pedido.tipodesc,              '+
     ' cast(round(cast( case when itens_pedido.usogordura is not null then itens_pedido.usogordura else 0 end as numeric),2) as double precision) as "usogordura",            '+
     ' cast(round(cast( case when itens_pedido.sobragordura is not null then itens_pedido.sobragordura else 0 end as numeric),2) as double precision) as "sobragordura",        '+  
     ' cast(round(cast( case when itens_pedido.st is not null then itens_pedido.st else 0 end as numeric),2) as double precision) as "st",                    '+
     ' itens_pedido.cdpedidobonificacao,    '+
     ' cast(round(cast( case when itens_pedido.valorreferencia is not null then itens_pedido.valorreferencia else 0 end as numeric),2) as double precision) as "valorSelecionadoPedido",    '+
     ' cast(round(cast( case when itens_pedido.valornegativogordura is not null then itens_pedido.valornegativogordura else 0 end as numeric),2) as double precision) as "abaterGorduraSupervisor", '+    
     ' cast(round(cast( case when itens_pedido.valorreferencia is not null then itens_pedido.valorreferencia else 0 end as numeric),2) as double precision) as "valorreferencia",						'+						
     ' cast(round(cast( case when itens_pedido.valornegativogordura is not null then itens_pedido.valornegativogordura else 0 end as numeric),2)  as double precision) as "valornegativogordura",		'+								      						
     ' cast(round(cast( case when itens_pedido.precotabela is not null and itens_pedido.percdescontomax is not null then (itens_pedido.precotabela-((itens_pedido.precotabela * itens_pedido.percdescontomax)/100)) else 0 end as numeric),2) as double precision) as "valorTabelaMinimo", '+         
    ' produtos.descricao              as      "produtoDescricao",                                    '+
    ' produtos.unidade                as      "produtoUnidade",                                     '+
    ' produtos.estoque                as      "produtoEstoque",                                      '+
    ' produtos.cdgrupo                as      "produtoCdgrupo",                                      '+
    ' produtos.cdsubgrupo             as      "produtoCdsubgrupo",                                   '+
    ' produtos.link                   as      "produtoLink",                                         '+
    ' produtos.ncm                    as      "produtoNcm",                                          '+
    ' produtos.ean13                  as      "produtoEan13",                                       '+
    ' produtos.dun14                  as      "produtoDun14",                                        '+
    ' produtos.pallet                 as      "produtoPallet",                                       '+
    ' produtos.altura                 as      "produtoAltura",                                       '+
    ' produtos.largura                as      "produtoLargura",                                     '+
    ' produtos.profundidade           as      "produtoProfundidade",                                 '+
    ' produtos.situacao               as      "produtoSituacao",                                     '+
    ' produtos.pesoliquido            as      "produtoPesoliquido",                                  '+
    ' produtos.pesobruto              as      "produtoPesobruto",                                    '+
    ' produtos.especie                as      "produtoEspecie",                                      '+
    ' produtos.grupocondec            as      "produtoGrupocondec",                                  '+
    ' produtos.gruporecdesc           as      "produtoGruporecdesc",                                 '+
    ' produtos.qtdembalagem           as      "produtoQtdembalagem",                                 '+
    ' produtos.cdgrupovolume          as      "produtoCdgrupovolume"                               '+
    ' FROM itens_pedido                                                                           	'+
    ' inner join produtos on produtos.codigo = itens_pedido.cdproduto                        		'+
    ' inner join pedidos on pedidos.cdpedido = itens_pedido.cdpedido                        		'+
               'WHERE '+
               ' itens_pedido.cdpedido = $1', codigo)
        .then(function (data) {
            var items = Object.keys(data);
           
            res.status(200)
                .json({
                    status: 'success',
                    data_itens: data,
                    message: 'Retrieved result'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_itens: 'N�o existe o item ou houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function recuperarItensPedidoPorCodigo(req, res, next) {
    var codigo = parseInt(req.body.iditenspedidos);
    db.one('SELECT * FROM itens_pedido WHERE iditenspedidos = $1', codigo)
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
                    data_itens: data,
                    message: 'Retrieved ONE item'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_itens: 'Não existe o pedido ou houve algum problema',
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

function inserirItensPedido(req, res, next) {
    var item;
    var error = 0;

    var vendedor = retornaTabelaParaValidacao('vendedores');   
    vendedor.then(resVendedor => {

        var localFaturamento = retornaTabelaParaValidacao('local_faturamento');   
        localFaturamento.then(resLocalFaturamento => {
    
            var produto = retornaTabelaParaValidacao('produtos');   
            produto.then(resProdutos => {

                var query_insert = "INSERT INTO itens_pedido(cdvendedor,cdlocalfaturamento,cdproduto,cdpreposto,cdpedido,qtdeproduto,valorunitario,"
                                    +"descricaoproduto,precotabela,precovenda,percdesconto,percdescontomax,percdescontomin,valordesconto,tipodesc,"
                                    +"usogordura,sobragordura,st,valorreferencia,valornegativogordura,valorminimodisponivel) VALUES ";

                //Percorre os itens para salvar
                for (i in req.body) {
                    item = req.body[i];

                    /*for(var a=0; a < resVendedor.length; a++){
                        if(item.cdvendedor.localeCompare(resVendedor[a].codigo, undefined, {numeric: true}) == 0){
                            query_insert += "(" + (item.cdvendedor.localeCompare('') == 0 ? null : item.cdvendedor);
                            error -= a;
                            break;
                        }else{ 
                            if(error <= 0)
                                errorMsg = "Vendedor '" + item.cdvendedor + "' não cadastrado.";
                            error += 1;
                        } 
                    }
                    
                    for(var b=0; b < resLocalFaturamento.length; b++){
                        if(item.cdlocalfaturamento.localeCompare(resLocalFaturamento[b].codigo, undefined, {numeric: true}) == 0){
                            query_insert += "," + (item.cdlocalfaturamento.localeCompare('') == 0 ? null : item.cdlocalfaturamento);
                            error -= b;
                            break;
                        }else{ 
                            if(error <= 0)
                                errorMsg = "Local de faturamento '" + item.cdlocalfaturamento + "' não cadastrado.";
                            error += 1;
                        } 
                    }

                    for(var c=0; c < resProdutos.length; c++){
                        if(item.cdproduto.localeCompare(resProdutos[c].codigo, undefined, {numeric: true}) == 0){
                            query_insert += "," + (item.cdproduto.localeCompare('') == 0 ? null : item.cdproduto);
                            error -= c;
                            break;
                        }else{ 
                            if(error <= 0)
                                errorMsg = "Produto não cadastrado '" + item.cdproduto + "' não cadastrado.";
                            error += 1;
                        } 
                    }*/

                    query_insert +=  "("+ (item.cdvendedor == undefined || item.cdvendedor.toString().localeCompare('') == 0 ? null : item.cdvendedor)
                                    +","+ (item.cdlocalfaturamento == undefined || item.cdlocalfaturamento.toString().localeCompare('') == 0 ? null : item.cdlocalfaturamento)
                                    +","+ (item.cdproduto == undefined || item.cdproduto.toString().localeCompare('') == 0 ? null : item.cdproduto)
                                    +","+ (item.cdvendedor == undefined || item.cdvendedor.toString().localeCompare('') == 0 ? null : item.cdvendedor)
                                    +","+ (item.cdpedido == undefined || item.cdpedido.toString().localeCompare('') == 0 ? null : item.cdpedido)
                                    +","+ (item.qtdeproduto == undefined || item.qtdeproduto.toString().localeCompare('') == 0 ? null : item.qtdeproduto.toString().replace(/,/, '.'))
                                    +","+ (item.valorunitario == undefined || item.valorunitario.toString().localeCompare('') == 0 ? null : item.valorunitario.toString().replace(/,/, '.'))
                                    +","+ (item.descricaoproduto == undefined || item.descricaoproduto.toString().localeCompare('') == 0 ? null : "'"+item.descricaoproduto+"'")
                                    +","+ (item.precotabela == undefined || item.precotabela.toString().localeCompare('') == 0 ? null : item.precotabela)
                                    +","+ (item.precovenda == undefined || item.precovenda.toString().localeCompare('') == 0 ? null : item.precovenda)
                                    +","+ (item.percdesconto == undefined || item.percdesconto.toString().localeCompare('') == 0 ? null : item.percdesconto)
                                    +","+ (item.percdescontomax == undefined || item.percdescontomax.toString().localeCompare('') == 0 ? null : item.percdescontomax)
                                    +","+ (item.percdescontomin == undefined || item.percdescontomin.toString().localeCompare('') == 0 ? null : item.percdescontomin)
                                    +","+ (item.valordesconto == undefined || item.valordesconto.toString().localeCompare('') == 0 ? null : item.valordesconto)
                                    +","+ (item.tipodesc == undefined || item.tipodesc.toString().localeCompare('') == 0 ? null : "'"+item.tipodesc+"'")
                                    +","+ (item.usogordura == undefined || item.usogordura.toString().localeCompare('') == 0 ? null : item.usogordura)
                                    +","+ (item.sobragordura == undefined || item.sobragordura.toString().localeCompare('') == 0 ? null : item.sobragordura)
                                    //+","+ (item.motivousogordura == undefined || item.motivousogordura.toString().localeCompare('') == 0 ? null : "'"+item.motivousogordura+"'")
                                    //+","+ (item.cdmotivogordura == undefined || item.cdmotivogordura.toString().localeCompare('') == 0 ? null : item.cdmotivogordura)
                                    +","+ (item.st == undefined || item.st.toString().localeCompare('') == 0 ? null : item.st)
				    +","+ (item.valorreferencia == undefined || item.valorreferencia.toString().localeCompare('') == 0 ? null : item.valorreferencia)
                                    +","+ (item.valornegativogordura == undefined || item.valornegativogordura.toString().localeCompare('') == 0 ? null : item.valornegativogordura)
				    +","+ (item.valorminimodisponivel == undefined || item.valorminimodisponivel.toString().localeCompare('') == 0 ? null : item.valorminimodisponivel)
                                    +"), ";
                    if(error > 0){
                        break;
                    }
                }
                if(error > 0){
                    res.status(400)
                        .json({
                            status: 'Warning',
                            data_itens: errorMsg,
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
                                    message: 'Inserted all itens'
                                });
                        })
                    .catch(function (err) {
                        //return next(err);
                        res.status(400)
                            .json({
                                status: 'Warning',
                                data_itens: 'Erro: '+err,
                                message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                            });
                    });
                }
            }); 
        });
    });

}


function deletarItensPedido(req, res, next) {
    db.any('DELETE FROM itens_pedido')
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Deleted ALL itens'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_itens: 'Houve algum problema.',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function deletarItensPedidoPorCodigo(req, res, next) {
    var codigo = parseInt(req.body.iditenspedidos);
    db.any('DELETE FROM itens_pedido WHERE iditenspedidos = $1', codigo)
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Deleted ONE item'
                });
        })
    .catch(function (err) {
        return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_itens: 'Id inexistente ou houve algum problema.',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

module.exports = {
    recuperarItensPedido: recuperarItensPedido,
    recuperarItensPedidoPorCodigo: recuperarItensPedidoPorCodigo,
    recuperarItensPedidoPorVendedor: recuperarItensPedidoPorVendedor,
    recuperarItensPorPedido:recuperarItensPorPedido,
    inserirItensPedido: inserirItensPedido,
    deletarItensPedidoPorCodigo: deletarItensPedidoPorCodigo,
    deletarItensPedido: deletarItensPedido
};