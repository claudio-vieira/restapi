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

function recuperarPorVendedorPedidoProduto(req, res, next) {
    var cdvendedor = parseInt(req.body.cdvendedor);
    var cdpedido = parseInt(req.body.cdpedido);
    var cdproduto = parseInt(req.body.cdproduto);

    db.any('SELECT * FROM itens_pedido WHERE cdvendedor = '+cdvendedor+' AND cdpedido = '+cdpedido+' AND cdproduto = '+cdproduto)
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
    var cdvendedor = '';
    var cdcliente = '';

    if(param.cdpedido !== undefined && param.cdpedido != '' &&
    	param.cdvendedor !== undefined && param.cdvendedor != '' &&
    	param.cdcliente !== undefined && param.cdcliente != ''){
        codigo = parseInt(param.cdpedido);
    	cdvendedor = parseInt(param.cdvendedor);
    	cdcliente = parseInt(param.cdcliente);
    }else{
       return res.status(401).json({error: 'Parametro (cdpedido) e (cdvendedor) defenido incorretamente'});
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
    ' left join clientes on clientes.codigo = pedidos.cdcliente and clientes.cdvendedor = itens_pedido.cdvendedor                                    '+
               ' WHERE 1=1 '+
               ' and itens_pedido.cdpedido = '+codigo+
               ' and itens_pedido.cdvendedor = '+cdvendedor+
               ' and clientes.codigo = '+cdcliente)
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

function recuperarItensPorIdsPedidos(req, res, next) {

    const param = req.body;
    var ids = '';

    if(param.ids !== undefined && param.ids != ''){
        ids = param.ids;
    }else{
       return res.status(401).json({error: 'Parametro (ids) defenido incorretamente'});
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
     ' cast(round(cast( case when itens_pedido.valorreferencia is not null then itens_pedido.valorreferencia else 0 end as numeric),2) as double precision) as "valorreferencia",                       '+                      
     ' cast(round(cast( case when itens_pedido.valornegativogordura is not null then itens_pedido.valornegativogordura else 0 end as numeric),2)  as double precision) as "valornegativogordura",       '+                                                          
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
    ' FROM itens_pedido                                                                             '+
    ' inner join produtos on produtos.codigo = itens_pedido.cdproduto                               '+
    ' inner join pedidos on pedidos.cdpedido = itens_pedido.cdpedido                                '+
               'WHERE '+
               ' itens_pedido.cdpedido in ('+ids+')')
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

function recuperarItensIdsPedidoPorCodigo(req, res, next) {
    var ids = req.body.ids;
    var idvendedor = req.body.idvendedor;
    //console.log("ids",ids);

    /*var sql = 'SELECT i.*, p.especie, p.pesobruto, p.pesoliquido FROM itens_pedido i '+
            'inner join produtos p on p.codigo = i.cdproduto '+
            'WHERE i.cdpedido in ('+ids+')';*/

    var sql = 'select ip.*, p.descricao, p.especie, '+
            'sum(ip.precovenda * ip.qtdeproduto) as valortotal, '+
            'sum(P.pesobruto * ip.qtdeproduto) as pesototal,  '+
            'sum(P.pesoliquido * ip.qtdeproduto) as pesoliqtotal,  '+
            'sum(ip.qtdeproduto) as volumetotal  '+
            'FROM itens_pedido ip  '+
            'inner join produtos P  '+
            'on p.codigo = ip.cdproduto '+
            'where ip.cdpedido in ('+ids+') '+
            (idvendedor != "" && idvendedor != "0" ? 'and ip.cdvendedor = '+idvendedor+' ' : ' ')+
            'group by ip.cdvendedor, ip.cdpreposto, ip.cdlocalfaturamento, ip.cdpedido, ip.cdproduto, p.descricao, p.especie';

    db.any(sql)
        .then(function (data) {
            var items = Object.keys(data);
            res.status(200)
                .json({
                    status: 'success',
                    data_itens: data,
                    message: 'Retrieved items'
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
    try{
        var item;

        var query_insert = "";

        //console.log("inserindo itens", req.body);
        //Percorre os itens para salvar
        for (i in req.body) {
            item = req.body[i];
            
            query_insert += "INSERT INTO itens_pedido(cdvendedor,cdlocalfaturamento,cdproduto,cdpreposto,cdpedido,qtdeproduto,valorunitario,"
                            +"descricaoproduto,precotabela,precovenda,percdesconto,percdescontomax,percdescontomin,valordesconto,tipodesc,"
                            +"usogordura,sobragordura,st,valorreferencia,valornegativogordura,valorminimodisponivel) VALUES ";

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
                            +") ON CONFLICT ON CONSTRAINT itens_pedidos_pkey DO UPDATE SET " 
                            +(item.cdvendedor == undefined || item.cdvendedor.toString().localeCompare('') == 0 ? '' : ("cdvendedor = " +item.cdvendedor+",") )
                            +(item.cdlocalfaturamento == undefined || item.cdlocalfaturamento.toString().localeCompare('') == 0 ? '' : ("cdlocalfaturamento = " +item.cdlocalfaturamento+",") )
                            +(item.cdproduto == undefined || item.cdproduto.toString().localeCompare('') == 0 ? '' : ("cdproduto = " +item.cdproduto+",") )
                            +(item.cdvendedor == undefined || item.cdvendedor.toString().localeCompare('') == 0 ? '' : ("cdpreposto = " +item.cdvendedor+",") )
                            +(item.cdpedido == undefined || item.cdpedido.toString().localeCompare('') == 0 ? '' : ("cdpedido = " +item.cdpedido+",") )
                            +(item.qtdeproduto == undefined || item.qtdeproduto.toString().localeCompare('') == 0 ? '' : ("qtdeproduto = " +item.qtdeproduto.toString().replace(/,/, '.')+",") )
                            +(item.valorunitario == undefined || item.valorunitario.toString().localeCompare('') == 0 ? '' : ("valorunitario = " +item.valorunitario.toString().replace(/,/, '.')+",") )
                            +(item.descricaoproduto == undefined || item.descricaoproduto.toString().localeCompare('') == 0 ? '' : ("descricaoproduto = '" +item.descricaoproduto+"',") )
                            +(item.precotabela == undefined || item.precotabela.toString().localeCompare('') == 0 ? '' : ("precotabela = " +item.precotabela+",") )
                            +(item.precovenda == undefined || item.precovenda.toString().localeCompare('') == 0 ? '' : ("precovenda = " +item.precovenda+",") )
                            +(item.percdesconto == undefined || item.percdesconto.toString().localeCompare('') == 0 ? '' : ("percdesconto = " +item.percdesconto+",") )
                            +(item.percdescontomax == undefined || item.percdescontomax.toString().localeCompare('') == 0 ? '' : ("percdescontomax = " +item.percdescontomax+",") )
                            +(item.percdescontomin == undefined || item.percdescontomin.toString().localeCompare('') == 0 ? '' : ("percdescontomin = " +item.percdescontomin+",") )
                            +(item.valordesconto == undefined || item.valordesconto.toString().localeCompare('') == 0 ? '' : ("valordesconto = " +item.valordesconto+",") )
                            +(item.tipodesc == undefined || item.tipodesc.toString().localeCompare('') == 0 ? '' : ("tipodesc = '" +item.tipodesc+"',") )
                            +(item.usogordura == undefined || item.usogordura.toString().localeCompare('') == 0 ? '' : ("usogordura = " +item.usogordura+",") )
                            +(item.sobragordura == undefined || item.sobragordura.toString().localeCompare('') == 0 ? '' : ("sobragordura = " +item.sobragordura+",") )
                            +(item.st == undefined || item.st.toString().localeCompare('') == 0 ? '' : ("st = " +item.st+",") )
                            +(item.valorreferencia == undefined || item.valorreferencia.toString().localeCompare('') == 0 ? '' : ("valorreferencia = " +item.valorreferencia+",") )
                            +(item.valornegativogordura == undefined || item.valornegativogordura.toString().localeCompare('') == 0 ? '' : ("valornegativogordura = " +item.valornegativogordura+",") )
                            +(item.valorminimodisponivel == undefined || item.valorminimodisponivel.toString().localeCompare('') == 0 ? '' : ("valorminimodisponivel = " +item.valorminimodisponivel+",") );
                            //+",";
                            query_insert = query_insert.substring(0, query_insert.length-1)+";";
        }

        //query_insert = query_insert.substring(0, query_insert.length-1)+";";
        //console.log("query: " + query_insert);

        db.none(query_insert)
            .then(function () {
                //console.log("checar 1");
                res.status(200)
                    .json({
                        status: 'success',
                        message: 'Inserted all itens'
                    });
            })
        .catch(function (err) {
            
            //ItemPedido ja inserido gera cod 23505
            if(err.code == 23505){
                //console.log("checar 2");
                res.status(200)
                    .json({
                        status: 'success',
                        message: 'Inserted all itens'
                    });
            }else{
                //console.log("checar 3");
                res.status(400)
                    .json({
                        status: 'Warning',
                        data_itens: 'Erro: '+err,
                        message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                    });
            }
        });

    }catch(err){
        res.status(400)
            .json({
                status: 'Warning',
                data_itens: 'Erro: '+err,
                message: 'Persistindo o erro favor contactar o administrador.'
            });
    }
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
    recuperarPorVendedorPedidoProduto: recuperarPorVendedorPedidoProduto,
    recuperarItensPorPedido:recuperarItensPorPedido,
    recuperarItensPorIdsPedidos: recuperarItensPorIdsPedidos,
    recuperarItensIdsPedidoPorCodigo: recuperarItensIdsPedidoPorCodigo,
    inserirItensPedido: inserirItensPedido,
    deletarItensPedidoPorCodigo: deletarItensPedidoPorCodigo,
    deletarItensPedido: deletarItensPedido
};