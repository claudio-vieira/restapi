var db = require('./conexao').getDb();
var utils = require('./utils');
var testeGlobal;

function recuperarPedidos(req, res, next) {
    db.any('select * from pedidos')
        .then(function (data) {
            data.forEach(function(value) {
                var items = Object.keys(value);
                items.forEach(function(item) {
                    /*console.log("value[item]: ",value[item]);
                    console.log("item ",item);
                    console.log("value: ",value);*/
                    if(item.localeCompare("dtpedido") == 0 || 
                        item.localeCompare("dtemissaonota") == 0 ||
                        item.localeCompare("dtsaidanota") == 0){
                        //console.log("value[item]: ",('0'+(value[item].getMonth()+1).toString()));
                        //console.log("value[item]: ",(value[item].getMonth()+1));
                        //value[item] = value[item].toString().substring(0,10).replace("-","/");
                        value[item] = (value[item].getDate().toString().length > 1 ? value[item].getDate() : '0'+value[item].getDate().toString())
                        +"/"+(((value[item].getMonth()+1).toString().length) > 1 ? (value[item].getMonth()+1) : ('0'+(value[item].getMonth()+1).toString()))
                        +"/"+value[item].getFullYear();
                    }
                });
            });             
            res.status(200)
                .json({
                    status: 'success',
                    data_pedidos: data,
                    message: 'Retrieved ALL pedidos'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_pedidos: 'Erro: '+err,
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function recuperarUltimoPedidoPorCodigoCliente(req, res, next) {
    const param = req.body;

    var fVendedor = '';
    var fSupervisor = '';
    var cdcliente = '';
    
    if(param.cdvendedor !== undefined && param.cdvendedor != ''){
        fVendedor = ' and vendedores.codigo = '+parseInt(param.cdvendedor);
    }else{
        return res.status(401).json({error: '(cdvendedor) obrigatorio no corpo da requisicao para carregar o pedido'});
    }

    if(param.cdsupervisor !== undefined && param.cdsupervisor != ''){
        fSupervisor = ' and supervisores.codigo = '+parseInt(param.cdsupervisor);
    }else{
       return res.status(401).json({error: '(cdsupervisor) obrigatorio no corpo da requisicao para carregar o pedido'});
    }

    if(param.cdcliente !== undefined && param.cdcliente != ''){
        cdcliente = ' and pedidos.cdcliente = '+parseInt(param.cdcliente);
    }else{
        return res.status(401).json({error: '(cdcliente) obrigatorio no corpo da requisicao para carregar o pedido'});
    }

    db.one('SELECT                                                                          '+
    ' pedidos.cdpreposto,                                                                   '+
    ' pedidos.cdpedido,                                                                     '+
    ' pedidos.idfilial,                                                                     '+
    ' pedidos.cdlocalfaturamento,                                                           '+
    ' pedidos.cdcliente,                                                                    '+
    ' pedidos.cdclienteapk,                                                                 '+
    ' pedidos.cnpj,                                                                         '+
    ' pedidos.tipotabela,                                                                   '+
    ' pedidos.cdcobranca,                                                                   '+
    ' pedidos.cdvenda,                                                                      '+
    ' pedidos.dtpedido,                                                                     '+
    ' pedidos.dtentrega,                                                                    '+
    ' pedidos.hrpedido,                                                                     '+
    ' pedidos.cdformapagamento,                                                             '+
    ' pedidos.parcela1,                                                                     '+
    ' pedidos.parcela2,                                                                     '+
    ' pedidos.parcela3,                                                                     '+
    ' pedidos.parcela4,                                                                     '+
    ' pedidos.parcela5,                                                                     '+
    ' pedidos.parcela6,                                                                     '+
    ' pedidos.parcela7,                                                                     '+
    ' pedidos.parcela8,                                                                     '+
    ' pedidos.parcela9,                                                                     '+
    ' pedidos.cnpjcliente,                                                                  '+
    ' cast(round(cast( case when pedidos.totaltabela is not null then pedidos.totaltabela else 0 end as numeric),2) as double precision) as "totaltabela",  		'+                                                                
    ' cast(round(cast( case when pedidos.totalvenda is not null then pedidos.totalvenda else 0 end as numeric),2) as double precision) as "totalvenda",           '+                                                        
    ' cast(round(cast( case when pedidos.totaldesconto is not null then pedidos.totaldesconto else 0 end as numeric),2) as double precision) as "totaldesconto",  '+                                                                  ' pedidos.bensuframa,                                                                   '+
    ' pedidos.ordem,                                                                        '+
    ' pedidos.observacao,                                                                   '+
    ' pedidos.nupedidocliente,                                                              '+
    ' pedidos.nunotafiscal,                                                                 '+
    ' pedidos.serienotafiscal,                                                              '+
    ' pedidos.situacaonfe,                                                                  '+
    ' pedidos.dtemissaonota,                                                                '+
    ' pedidos.dtsaidanota,                                                                  '+
    ' pedidos.valornota,                                                                    '+
    ' pedidos.situacao,                                                                     '+
    ' cast(round(cast( case when pedidos.gordurausada is not null then pedidos.gordurausada else 0 end as numeric),2) as double precision) as "gordurausada",     '+                                                         
    ' cast(round(cast( case when pedidos.gorduragerada is not null then pedidos.gorduragerada else 0 end as numeric),2) as double precision) as "gorduragerada",  '+                                                             ' pedidos.motivousogordura,                                                             '+
    ' pedidos.cdmotivogordura,                                                              '+
    ' cast(round(cast( case when pedidos.gorduraliberarsupervisor is not null then pedidos.gorduraliberarsupervisor else 0 end as numeric),2) as double precision) as "valalorPendenteGordura",          '+
    ' pedidos.pendente,                                                 '+
   '  cast(round(cast( case when pedidos.st is not null then pedidos.st else 0 end as numeric),2) as double precision) AS "st", 										                        '+
    ' cast(round(cast( case when pedidos.pesoliquidototal is not null then pedidos.pesoliquidototal else 0 end as numeric),2) as double precision) AS "pesoliquidototal",          			'+
    ' cast(round(cast( case when pedidos.pesobrutototal is not null then pedidos.pesobrutototal else 0 end as numeric),2) as double precision) as "pesobrutototal",            				'+
    ' cast(round(cast( case when pedidos.valorreferenciatotal is not null then pedidos.valorreferenciatotal else 0 end as numeric),2) as double precision) as "valorreferenciatotal",      	'+
    ' cast( case when pedidos.totalvolume is not null then pedidos.totalvolume else 0 end as numeric) as "totalvolume",               							    '+
    ' cast( case when pedidos.totalprodutos is not null then pedidos.totalprodutos else 0 end as numeric) as "totalprodutos",            							'+
    ' forma_pagamento.codigo as "codigoFormaPagamento",                 '+
    ' forma_pagamento.descricao as "tipoPagamento",                     '+
    ' vendedores.codigo as "vendedorCodigo",                                               '+
    ' vendedores.nome as "vendedorNome",                                                   '+
    ' vendedores.endereco as "vendedorEndereco",                                           '+
    ' vendedores.municipio as "vendedorMunicipio",                                         '+
    ' vendedores.bairro as "vendedorBairro",                                               '+
    ' vendedores.uf as "vendedorUf",                                                       '+
    ' vendedores.telefone as "vendedorTelefone",                                           '+
    ' vendedores.celular as "vendedorCelular",                                             '+
    ' vendedores.email as "vendedorEmail",                                                 '+
    ' vendedores.idtabelapreco as "vendedorIdtabelapreco",                                 '+
    ' vendedores.nuultimopedido as "vendedorNuUltimopedido",                               '+
    ' vendedores.precoliberado as "vendedorPrecoliberado",                                 '+
    ' vendedores.descminmax as "vendedorDescminmax",                                       '+
    ' vendedores.descavista as "vendedorDescavista",                                       '+
    ' vendedores.nudiasdescavista as "vendedorNudiasdescavista",                           '+
    ' vendedores.permiteusargordura as "vendedorPermiteusargordura",                       '+
    ' vendedores.reiniciadados as "vendedorReiniciadados",                                 '+
    ' vendedores.descintermediario as "vendedorDescintermediario",                          '+
    ' clientes.codigo                as  "clienteCodigo",                                  '+
    ' clientes.codigointerno         as  "clienteCodigointerno",                            '+
    ' clientes.nome                  as  "clienteNome",                                     '+
    ' clientes.fantasia              as  "clienteFantasia",                                 '+
    ' clientes.endereco              as  "clienteEndereco",                                 '+
    ' clientes.numeroendereco        as  "clienteNumeroendereco",                           '+
    ' clientes.complementoendereco   as  "clienteComplementoendereco",                      '+
    ' clientes.bairro                as  "clienteBairro",                                   '+
    ' clientes.uf                    as  "clienteUf",                                       '+
    ' clientes.cep                 as  "clienteCep",                                        '+
    ' clientes.cidade                as  "clienteCidade",                                   '+
    ' clientes.cnpj                  as  "clienteCnpj",                                     '+
    ' clientes.inscrestadual         as  "clienteInscrestadual",                            '+
    ' clientes.fone                    as  "clienteFone",                                   '+
    ' clientes.celular               as  "clienteCelular",                                  '+
    ' \'false\'                      as "expanded"                                          '+
   ' FROM pedidos                                                                           '+
   ' inner join vendedores on vendedores.codigo = pedidos.cdvendedor                        '+
   ' inner join supervisionados on supervisionados.cdvendedor = vendedores.codigo           '+
   ' inner join supervisores on supervisores.codigo = supervisionados.cdsupervisor          '+
   ' inner join clientes on clientes.codigo = pedidos.cdcliente          '+
    ' inner join forma_pagamento on forma_pagamento.codigo = pedidos.cdformapagamento          '+

           ' WHERE 1=1 '+fVendedor+fSupervisor+cdcliente+
           ' and pedidos.nunotafiscal IS NOT NULL and pedidos.nunotafiscal > 0'+
           ' ORDER BY pedidos.dtpedido DESC limit 1') 
         .then(function (data) {

            return res.status(200)
                .json({
                    status: 'success',
                    data_pedidos: data,
                    message: 'Retrieved ONE pedido'
                });
        }).catch(function (err) {
        //return next(err);
            if(err.message === 'No data returned from the query.'){
                return res.status(204)
                .json({
                    status: 'Warning',
                    data_pedidos: 'No data returned from the query',
                    message: 'Verifique se os parametros estão corretos e tente novamente.'
                });
            }else{
                return res.status(401)
                .json({
                    status: 'Warning',
                    data_pedidos: 'Nao existe o pedido ou houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
            }           
    });
}

function recuperarPedidosPendentesSupervisor(req, res, next) {
    const param = req.body;

    var fVendedor = '';
    var fSupervisor = '';
    var fPeriodo = '';
    
    if(param.cdvendedor !== undefined && param.cdvendedor != ''){
        fVendedor = ' and vendedores.codigo = '+parseInt(param.cdvendedor);
    }

    if(param.cdsupervisor !== undefined && param.cdsupervisor != ''){
        fSupervisor = ' and supervisores.codigo = '+parseInt(param.cdsupervisor);
    }else{
       return res.status(401).json({error: '(cdsupervisor) obrigatorio no corpo da requisicao para carregar os pedidos'});
    }

    if((param.datainicio !== undefined && param.datafim !== undefined) && (param.datainicio !== '' && param.datafim !== '')){
        fPeriodo = ' and date(pedidos.dtpedido) between date(\''+param.datainicio+'\') and date(\''+param.datafim+'\')';
    }

    db.any('SELECT                                                                                  '+
    ' pedidos.cdpreposto,                                                                   '+
    ' pedidos.cdpedido,                                                                     '+
    ' pedidos.idfilial,                                                                     '+
    ' pedidos.cdlocalfaturamento,                                                           '+
    ' pedidos.cdcliente,                                                                    '+
    ' pedidos.cdclienteapk,                                                                 '+
    ' pedidos.cnpj,                                                                         '+
    ' pedidos.tipotabela,                                                                   '+
    ' pedidos.cdcobranca,                                                                   '+
    ' pedidos.cdvenda,                                                                      '+
    ' pedidos.dtpedido,                                                                     '+
    ' pedidos.dtentrega,                                                                    '+
    ' pedidos.hrpedido,                                                                     '+
    ' pedidos.cdformapagamento,                                                             '+
    ' pedidos.parcela1,                                                                     '+
    ' pedidos.parcela2,                                                                     '+
    ' pedidos.parcela3,                                                                     '+
    ' pedidos.parcela4,                                                                     '+
    ' pedidos.parcela5,                                                                     '+
    ' pedidos.parcela6,                                                                     '+
    ' pedidos.parcela7,                                                                     '+
    ' pedidos.parcela8,                                                                     '+
    ' pedidos.parcela9,                                                                     '+
    ' pedidos.cnpjcliente,                                                                  '+
    ' cast(round(cast( case when pedidos.totaltabela is not null then pedidos.totaltabela else 0 end as numeric),2) as double precision) as "totaltabela",  		'+                                                                
    ' cast(round(cast( case when pedidos.totalvenda is not null then pedidos.totalvenda else 0 end as numeric),2) as double precision) as "totalvenda",           '+                                                        
    ' cast(round(cast( case when pedidos.totaldesconto is not null then pedidos.totaldesconto else 0 end as numeric),2) as double precision) as "totaldesconto",  '+                                                                  ' pedidos.bensuframa,                                                                   '+
    ' pedidos.ordem,                                                                        '+
    ' pedidos.observacao,                                                                   '+
    ' pedidos.nupedidocliente,                                                              '+
    ' pedidos.nunotafiscal,                                                                 '+
    ' pedidos.serienotafiscal,                                                              '+
    ' pedidos.situacaonfe,                                                                  '+
    ' pedidos.dtemissaonota,                                                                '+
    ' pedidos.dtsaidanota,                                                                  '+
    ' pedidos.valornota,                                                                    '+
    ' pedidos.situacao,                                                                     '+
    ' cast(round(cast( case when pedidos.gordurausada is not null then pedidos.gordurausada else 0 end as numeric),2) as double precision) as "gordurausada",     '+                                                         
    ' cast(round(cast( case when pedidos.gorduragerada is not null then pedidos.gorduragerada else 0 end as numeric),2) as double precision) as "gorduragerada",  '+                                                             ' pedidos.motivousogordura,                                                             '+
    ' pedidos.cdmotivogordura,                                                              '+
    ' cast(round(cast( case when pedidos.gorduraliberarsupervisor is not null then pedidos.gorduraliberarsupervisor else 0 end as numeric),2) as double precision) as "valalorPendenteGordura",          '+
    ' pedidos.pendente,                                                 '+
   '  cast(round(cast( case when pedidos.st is not null then pedidos.st else 0 end as numeric),2) as double precision) AS "st", 										                        '+
    ' cast(round(cast( case when pedidos.pesoliquidototal is not null then pedidos.pesoliquidototal else 0 end as numeric),2) as double precision) AS "pesoliquidototal",          			'+
    ' cast(round(cast( case when pedidos.pesobrutototal is not null then pedidos.pesobrutototal else 0 end as numeric),2) as double precision) as "pesobrutototal",            				'+
    ' cast(round(cast( case when pedidos.valorreferenciatotal is not null then pedidos.valorreferenciatotal else 0 end as numeric),2) as double precision) as "valorreferenciatotal",      	'+
    ' cast( case when pedidos.totalvolume is not null then pedidos.totalvolume else 0 end as numeric) as "totalvolume",               							    '+
    ' cast( case when pedidos.totalprodutos is not null then pedidos.totalprodutos else 0 end as numeric) as "totalprodutos",            							'+
    ' forma_pagamento.codigo as "codigoFormaPagamento",                 '+
    ' forma_pagamento.descricao as "tipoPagamento",                     '+
        ' tipo_tabela.codigo as "tipotabelaCodigo",                                             '+
        ' tipo_tabela.descricao as "tipotabelaDescricao",                                      '+
    ' vendedores.codigo as "vendedorCodigo",                                               '+
    ' vendedores.nome as "vendedorNome",                                                   '+
    ' vendedores.endereco as "vendedorEndereco",                                           '+
    ' vendedores.municipio as "vendedorMunicipio",                                         '+
    ' vendedores.bairro as "vendedorBairro",                                               '+
    ' vendedores.uf as "vendedorUf",                                                       '+
    ' vendedores.telefone as "vendedorTelefone",                                           '+
    ' vendedores.celular as "vendedorCelular",                                             '+
    ' vendedores.email as "vendedorEmail",                                                 '+
    ' vendedores.idtabelapreco as "vendedorIdtabelapreco",                                 '+
    ' vendedores.nuultimopedido as "vendedorNuUltimopedido",                               '+
    ' vendedores.precoliberado as "vendedorPrecoliberado",                                 '+
    ' vendedores.descminmax as "vendedorDescminmax",                                       '+
    ' vendedores.descavista as "vendedorDescavista",                                       '+
    ' vendedores.nudiasdescavista as "vendedorNudiasdescavista",                           '+
    ' vendedores.permiteusargordura as "vendedorPermiteusargordura",                       '+
    ' vendedores.reiniciadados as "vendedorReiniciadados",                                 '+
    ' vendedores.descintermediario as "vendedorDescintermediario",                          '+
    ' clientes.codigo                as  "clienteCodigo",                                  '+
    ' clientes.codigointerno         as  "clienteCodigointerno",                            '+
    ' clientes.nome                  as  "clienteNome",                                     '+
    ' clientes.fantasia              as  "clienteFantasia",                                 '+
    ' clientes.endereco              as  "clienteEndereco",                                 '+
    ' clientes.numeroendereco        as  "clienteNumeroendereco",                           '+
    ' clientes.complementoendereco   as  "clienteComplementoendereco",                      '+
    ' clientes.bairro                as  "clienteBairro",                                   '+
    ' clientes.uf                    as  "clienteUf",                                       '+
    ' clientes.cep                 as  "clienteCep",                                        '+
    ' clientes.cidade                as  "clienteCidade",                                   '+
    ' clientes.cnpj                  as  "clienteCnpj",                                     '+
    ' clientes.inscrestadual         as  "clienteInscrestadual",                            '+
    ' clientes.fone                    as  "clienteFone",                                   '+
    ' clientes.celular               as  "clienteCelular",                                  '+
    ' \'false\'                      as "expanded"                                          '+
   ' FROM pedidos                                                                           '+
   ' inner join vendedores on vendedores.codigo = pedidos.cdvendedor                        '+
   ' inner join supervisionados on supervisionados.cdvendedor = vendedores.codigo           '+
   ' inner join supervisores on supervisores.codigo = supervisionados.cdsupervisor          '+
   ' inner join clientes on clientes.codigo = pedidos.cdcliente          '+
   ' inner join tipo_tabela on tipo_tabela.codigo = pedidos.tipotabela and tipo_tabela.cdvendedor = vendedores.codigo    '+
   ' inner join forma_pagamento on forma_pagamento.codigo = pedidos.cdformapagamento          '+

           ' WHERE 1=1 and pedidos.pendente = 0 and pedidos.situacao = 0 and pedidos.tipotabela is not null '+fVendedor+fSupervisor+fPeriodo+
           ' ORDER BY pedidos.dtpedido DESC') 
        .then(function (data) {
            var items = Object.keys(data);
            return res.status(200)
                .json({
                    status: 'success',
                    data_pedidos: data,
                    message: 'Retrieved ONE pedido'
                });
        }).catch(function (err) {
        //return next(err);
            return res.status(400)
                .json({
                    status: 'Warning',
                    data_pedidos: 'Não existe o pedido ou houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}
function recuperarPedidosPorVendedor(req, res, next) {
    var cdvendedor = parseInt(req.body.cdvendedor);

    db.any('SELECT * FROM pedidos WHERE cdvendedor = $1', [cdvendedor])
        .then(function (data) {
            var items = Object.keys(data);
            res.status(200)
                .json({
                    status: 'success',
                    data_pedidos: data,
                    message: 'Retrieved ONE pedido'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_pedidos: 'NÃ£o existe o pedido ou houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function recuperarPedidosPorCodigoEVendedor(req, res, next) {
    var cdvendedor = parseInt(req.body.cdvendedor);
    var cdpedido = parseInt(req.body.cdpedido);

    db.one('SELECT * FROM pedidos WHERE cdpedido = $1 AND cdvendedor = $2', [cdpedido,cdvendedor])
        .then(function (data) {
            var items = Object.keys(data);
            res.status(200)
                .json({
                    status: 'success',
                    data_pedidos: data,
                    message: 'Retrieved ONE pedido'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_pedidos: 'NÃ£o existe o pedido ou houve algum problema',
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

function inserirPedidos(req, res, next) {
    var pedido;
    var error = 0;
    var errorMsg;
    console.log("Iniciou a insercao de pedidos");


    var tipoVenda = retornaTabelaParaValidacao('vendas');   
    tipoVenda.then(resTipoVenda => {
        console.log("Iniciou a insercao de pedidos");


        var formaPag = retornaTabelaParaValidacao('forma_pagamento');
        formaPag.then(resFormaPagamento => {
    console.log("Iniciou a insercao de pedidos");


        var localFaturamento = retornaTabelaParaValidacao('local_faturamento');           
            localFaturamento.then(resLocalFaturamento => {
        console.log("Iniciou a insercao de pedidos");

                var query_insert = "INSERT INTO pedidos(cdvendedor,idfilial,cdpedido,cdlocalfaturamento,cdcliente,dtpedido,totalvenda,"
                                    +"nupedidocliente,nunotafiscal,serienotafiscal,situacaonfe,dtemissaonota,dtsaidanota,valornota,"
                                    +"cdvenda,cdformapagamento,parcela1,parcela2,parcela3,parcela4,parcela5,parcela6,parcela7,parcela8,parcela9,situacao,"
                                    +"cnpjcliente,cdclienteapk,tipotabela,cdcobranca,dtentrega,hrpedido,totaltabela,totaldesconto,"
                                    +"bensuframa,ordem,observacao,gordurausada,gorduragerada,motivousogordura,cdmotivogordura,enviadoftp,pendente,gorduraliberarsupervisor,cdsupervisor, "
				    +"st,pesoliquidototal,pesobrutototal,valorreferenciatotal,totalvolume,totalprodutos, motivousogordurasupervisor) VALUES ";
                
                for (i in req.body) {
                    pedido = req.body[i];
                    query_insert += "("+ (pedido.cdvendedor == undefined || pedido.cdvendedor.toString().localeCompare('') == 0 ? null : pedido.cdvendedor)
                                    +","+ (pedido.idfilial == undefined || pedido.idfilial.toString().localeCompare('') == 0 ? null : pedido.idfilial)
                                    +","+ (pedido.cdpedido == undefined || pedido.cdpedido.toString().localeCompare('') == 0 ? null : pedido.cdpedido);
                                   

                    /*for(var l=0; l < resLocalFaturamento.length; l++){
                        if(pedido.cdlocalfaturamento.localeCompare(resLocalFaturamento[l].codigo, undefined, {numeric: true}) == 0){
                            query_insert += ","+ (pedido.cdlocalfaturamento.localeCompare('') == 0 ? null : pedido.cdlocalfaturamento);
                            error -= l;
                            break;
                        }else{ 
                            if(error <= 0)
                                errorMsg = "Local de faturamento '" + pedido.cdlocalfaturamento + "' nÃ£o cadastrado.";
                            error += 1;
                        } 
                    }*/
                    //console.log("pedido.dtpedido: ",pedido.dtpedido);
                    //console.log("pedido.dtentrega: ",pedido.dtentrega);
                    query_insert += ","+ (pedido.cdlocalfaturamento == undefined || pedido.cdlocalfaturamento.toString().localeCompare('') == 0 ? null : pedido.cdlocalfaturamento)
                                    +","+ (pedido.cdcliente == undefined || pedido.cdcliente.toString().localeCompare('') == 0 ? null : pedido.cdcliente)
                                    +","+ (pedido.dtpedido == undefined || pedido.dtpedido.toString().localeCompare('') == 0 ? null :  "'"+utils.convertDataDDMMYYYYSplitBar(pedido.dtpedido)+"'")
                                    +","+ (pedido.totalvenda == undefined || pedido.totalvenda.toString().localeCompare('') == 0 ? null : pedido.totalvenda.toString().replace(/,/, '.'))
                                    +","+ (pedido.nupedidocliente == undefined || pedido.nupedidocliente.toString().localeCompare('') == 0 ? null : pedido.nupedidocliente)
                                    +","+ (pedido.nunotafiscal == undefined || pedido.nunotafiscal.toString().localeCompare('') == 0 ? null : pedido.nunotafiscal)
                                    +","+ (pedido.serienotafiscal == undefined || pedido.serienotafiscal.toString().localeCompare('') == 0 ? null : "'"+pedido.serienotafiscal+"'")
                                    +","+ (pedido.situacaonfe == undefined || pedido.situacaonfe.toString().localeCompare('') == 0 ? null : pedido.situacaonfe)
                                    +","+ (pedido.dtemissaonota == undefined || pedido.dtemissaonota.toString().localeCompare('') == 0 ? null : "'"+utils.convertDataDDMMYYYY(pedido.dtemissaonota)+"'")
                                    +","+ (pedido.dtsaidanota == undefined || pedido.dtsaidanota.toString().localeCompare('') == 0 ? null : "'"+utils.convertDataDDMMYYYY(pedido.dtsaidanota)+"'")
                                    +","+ (pedido.valornota == undefined || pedido.valornota.toString().localeCompare('') == 0 ? null : pedido.valornota.toString().replace(/,/, '.'))
                                    +","+ (pedido.cdvenda == undefined || pedido.cdvenda.toString().localeCompare('') == 0 ? null : "'"+pedido.cdvenda+"'")
                                    +","+ (pedido.cdformapagamento == undefined || pedido.cdformapagamento.toString().localeCompare('') == 0 ? null : pedido.cdformapagamento)
                                    +","+ (pedido.parcela1 == undefined || pedido.parcela1.toString().localeCompare('') == 0 ? null : pedido.parcela1)
                                    +","+ (pedido.parcela2 == undefined || pedido.parcela2.toString().localeCompare('') == 0 ? null : pedido.parcela2)
                                    +","+ (pedido.parcela3 == undefined || pedido.parcela3.toString().localeCompare('') == 0 ? null : pedido.parcela3)
                                    +","+ (pedido.parcela4 == undefined || pedido.parcela4.toString().localeCompare('') == 0 ? null : pedido.parcela4)
                                    +","+ (pedido.parcela5 == undefined || pedido.parcela5.toString().localeCompare('') == 0 ? null : pedido.parcela5)
                                    +","+ (pedido.parcela6 == undefined || pedido.parcela6.toString().localeCompare('') == 0 ? null : pedido.parcela6)
                                    +","+ (pedido.parcela7 == undefined || pedido.parcela7.toString().localeCompare('') == 0 ? null : pedido.parcela7)
                                    +","+ (pedido.parcela8 == undefined || pedido.parcela8.toString().localeCompare('') == 0 ? null : pedido.parcela8)
                                    +","+ (pedido.parcela9 == undefined || pedido.parcela9.toString().localeCompare('') == 0 ? null : pedido.parcela9)
                                    +","+ (pedido.situacao == undefined || pedido.situacao.toString().localeCompare('') == 0 ? null : pedido.situacao)
                                    +","+ (pedido.cnpjcliente == undefined || pedido.cnpjcliente.toString().localeCompare('') == 0 ? null : "'"+pedido.cnpjcliente+"'")
                                    +","+ (pedido.cdclienteapk == undefined || pedido.cdclienteapk.toString().localeCompare('') == 0 ? null : pedido.cdclienteapk)
                                    +","+ (pedido.tipotabela == undefined || pedido.tipotabela.toString().localeCompare('') == 0 ? null : pedido.tipotabela)
                                    +","+ (pedido.cdcobranca == undefined || pedido.cdcobranca.toString().localeCompare('') == 0 ? null : pedido.cdcobranca)
                                    +","+ (pedido.dtentrega == undefined || pedido.dtentrega.toString().localeCompare('') == 0 ? null : "'"+utils.convertDataDDMMYYYYSplitBar(pedido.dtentrega)+"'")
                                    +","+ (pedido.hrpedido == undefined || pedido.hrpedido.toString().localeCompare('') == 0 ? null : "'"+pedido.hrpedido+"'")
                                    +","+ (pedido.totaltabela == undefined || pedido.totaltabela.toString().localeCompare('') == 0 ? null : pedido.totaltabela)
                                    +","+ (pedido.totaldesconto == undefined || pedido.totaldesconto.toString().localeCompare('') == 0 ? null : pedido.totaldesconto)
                                    +","+ (pedido.bensuframa == undefined || pedido.bensuframa.toString().localeCompare('') == 0 ? null : pedido.bensuframa)
                                    +","+ (pedido.ordem == undefined || pedido.ordem.toString().localeCompare('') == 0 ? null : "'"+pedido.ordem+"'")
                                    +","+ (pedido.observacao == undefined || pedido.observacao.toString().localeCompare('') == 0 ? null : "'"+pedido.observacao+"'")
                                    +","+ (pedido.gordurausada == undefined || pedido.gordurausada.toString().localeCompare('') == 0 ? null : pedido.gordurausada)
                                    +","+ (pedido.gorduragerada == undefined || pedido.gorduragerada.toString().localeCompare('') == 0 ? null : pedido.gorduragerada)
                                    +","+ (pedido.motivousogordura == undefined || pedido.motivousogordura.toString().localeCompare('') == 0 ? null : "'"+pedido.motivousogordura+"'")
                                    +","+ (pedido.cdmotivogordura == undefined || pedido.cdmotivogordura.toString().localeCompare('') == 0 ? null : pedido.cdmotivogordura)
                                    +",false" //Sempre false pois há um serviço que envia os pedidos não enviados para o FTP a partir desta flag
                                    +","+ (pedido.pendente == undefined || pedido.pendente.toString().localeCompare('') == 0 ? 0 : pedido.pendente)
                                    +","+ (pedido.gorduraliberarsupervisor == undefined || pedido.gorduraliberarsupervisor.toString().localeCompare('') == 0 ? null : pedido.gorduraliberarsupervisor)
                                    +","+ (pedido.cdsupervisor == undefined || pedido.cdsupervisor.toString().localeCompare('') == 0 ? null : pedido.cdsupervisor)
 				    +","+ (pedido.st == undefined || pedido.st.toString().localeCompare('') == 0 ? null : pedido.st)
				    +","+ (pedido.pesoliquidototal == undefined || pedido.pesoliquidototal.toString().localeCompare('') == 0 ? null : pedido.pesoliquidototal)
			   	    +","+ (pedido.pesobrutototal == undefined || pedido.pesobrutototal.toString().localeCompare('') == 0 ? null : pedido.pesobrutototal)
				    +","+ (pedido.valorreferenciatotal == undefined || pedido.valorreferenciatotal.toString().localeCompare('') == 0 ? null : pedido.valorreferenciatotal)
				    +","+ (pedido.totalvolume == undefined || pedido.totalvolume.toString().localeCompare('') == 0 ? null : pedido.totalvolume)
				    +","+ (pedido.totalprodutos == undefined || pedido.totalprodutos.toString().localeCompare('') == 0 ? null : pedido.totalprodutos)
				    +","+ (pedido.motivousogordurasupervisor == undefined || pedido.motivousogordurasupervisor.toString().localeCompare('') == 0 ? null : "'"+pedido.motivousogordurasupervisor+"'")
                                    +"), "; 

                    /*for(var j=0; j < resTipoVenda.length; j++){
                        if(pedido.cdvenda.localeCompare(resTipoVenda[j].abreviacao) == 0){
                            query_insert += ","+ (pedido.cdvenda.localeCompare('') == 0 ? null : resTipoVenda[j].codigo);
                            error -= j;
                            break;
                        }else{ 
                            if(error <= 0)
                                errorMsg = "Tipo de venda '" + pedido.cdvenda + "' nÃ£o cadastrada.";
                            error += 1;
                        } 
                    }
    
                    for(var k=0; k < resFormaPagamento.length; k++){                                    
                        if(pedido.cdformapagamento.localeCompare(resFormaPagamento[k].codigo) == 0){
                            query_insert += ","+ (pedido.cdformapagamento.localeCompare('') == 0 ? null : resFormaPagamento[k].codigo);
                            error -= k;
                            break;
                        }else{ 
                            if(error <= 0)
                                errorMsg = "Forma de pagamento '" + pedido.cdformapagamento + "' nÃ£o cadastrada.";
                            error += 1;
                        } 
                    }*/

                    /*query_insert +=  ","+ (pedido.parcela1.localeCompare('') == 0 ? null : pedido.parcela1)
                                    +","+ (pedido.parcela2.localeCompare('') == 0 ? null : pedido.parcela2)
                                    +","+ (pedido.parcela3.localeCompare('') == 0 ? null : pedido.parcela3)
                                    +","+ (pedido.parcela4.localeCompare('') == 0 ? null : pedido.parcela4)
                                    +","+ (pedido.parcela5.localeCompare('') == 0 ? null : pedido.parcela5)
                                    +","+ (pedido.situacao.localeCompare('') == 0 ? null : pedido.situacao)
                                    +"), ";*/

                    if(error > 0){
                        break;
                    }
                }
                if(error > 0){

                     //console.log("error a insercao de pedidos");
                    res.status(400)
                        .json({
                            status: 'Warning',
                            data_pedidos: errorMsg,
                            message: 'Err: '+error
                        });
                }else{
                    query_insert = query_insert.substring(0, query_insert.length-2)+";";
                    //console.log("Query: "+ query_insert);

                    db.none(query_insert)
                    .then(function () {
                     //console.log("success a insercao de pedidos");
                        res.status(200)
                            .json({
                                status: 'success',
                                message: 'Inserted all pedidos'
                            });
                    })
                    .catch(function (err) {
                        //return next(err);
                        //console.log("err",err);

                        //Pedido ja inserido gera cod 23505
                        if(err.code == 23505){
                            //console.log("sucesso a insercao de pedidos");
                            res.status(200)
                            .json({
                                status: 'success',
                                message: 'Already Inserted'
                            });
                        }else{
                            //console.log("error a insercao de pedidos");
                            res.status(400)
                                .json({
                                    status: 'Warning',
                                    data_pedidos: 'Erro: '+err,
                                    message: 'Erro: '+err
                                });
                        }
                    });
                }
          }).catch(function (err) {
                //return next(err);
                //console.log("err",err);

                //Pedido jÃ¡ inserido gera cod 23505
                console.log("error a insercao de pedidos");

                res.status(400)
                    .json({
                        status: 'Warning',
                        data_pedidos: 'Erro: '+err,
                        message: 'Erro: '+err
                    });
            
            });
        }).catch(function (err) {
            //return next(err);
            //console.log("err",err);

            //Pedido jÃ¡ inserido gera cod 23505
            console.log("error a insercao de pedidos");
            res.status(400)
                .json({
                    status: 'Warning',
                    data_pedidos: 'Erro: '+err,
                    message: 'Erro: '+err
                });
        
        });
    }).catch(function (err) {
        //return next(err);
        //console.log("err",err);

        //Pedido jÃ¡ inserido gera cod 23505
    console.log("error a insercao de pedidos");
        
        res.status(400)
            .json({
                status: 'Warning',
                data_pedidos: 'Erro: '+err,
                message: 'Erro: '+err
            });
    
    });
}



function deletarPedidos(req, res, next) {
    db.any('DELETE FROM pedidos')
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Deleted ALL pedidos'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_pedidos: 'Houve algum problema.',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function deletarPedidoPorCodigo(req, res, next) {
    var cdvendedor = parseInt(req.body.cdvendedor);
    var cdpedido = parseInt(req.body.cdpedido);

    db.any('DELETE FROM pedidos WHERE cdpedido = $1 AND cdvendedor = $2', [cdpedido,cdvendedor])
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Deleted ONE pedidos'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_pedidos: 'Id inexistente ou houve algum problema.',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

module.exports = {
    recuperarPedidos: recuperarPedidos,
    recuperarPedidosPorVendedor: recuperarPedidosPorVendedor,
    recuperarPedidosPorCodigoEVendedor: recuperarPedidosPorCodigoEVendedor,
    recuperarPedidosPendentesSupervisor: recuperarPedidosPendentesSupervisor,
    recuperarUltimoPedidoPorCodigoCliente: recuperarUltimoPedidoPorCodigoCliente,
    inserirPedidos: inserirPedidos,
    deletarPedidoPorCodigo: deletarPedidoPorCodigo,
    deletarPedidos: deletarPedidos
};