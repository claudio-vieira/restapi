var db = require('./conexao').getDb();
const cron = require("node-cron");
//Required package
//var pdf = require("pdf-creator-node");
var pdf = require('html-pdf');
var ejs = require('ejs');
//var fs = require('fs');
const { format } = require('path');
var nodemailer = require('nodemailer');
const { options } = require('./app');

cron.schedule("*/60 * * * * *", function() { 
    console.log("running a task EMAIL every minute");

    var sql = "SELECT "+
        "p.cdvendedor, "+ 
        "p.cdpedido, "+
        "p.cdcliente, "+
        "p.dtpedido, "+
        "p.cnpjcliente, "+
        "p.observacao, "+
        "p.parcela1, "+
        "p.parcela2, "+
        "p.parcela3, "+
        "p.parcela4, "+
        "p.parcela5, "+
        "p.parcela6, "+
        "p.parcela7, "+
        "p.parcela8, "+
        "p.parcela9, "+
        "p.pendente, "+
        "p.enviadoemail, "+
        "p.enviadoemailsupervisor, "+
        "p.totalvenda as totalPedido, "+ 
        "f.descricao as descFormaPagamento, "+
        "fi.descricao as descfilialfaturamento, "+
        "c.cidade as nomeCidade, "+
        "c.inscrestadual, "+
        "c.nome as nomeCliente, "+
        "c.cep as cepCliente, "+
        "c.endereco as enderecoCliente, "+
        "c.numeroendereco as enderecoNumero, "+
        "c.email as emailCliente, "+
        "c.fone as phoneCliente, "+
        "c.bairro as bairroCliente, "+
        "c.uf as ufCliente, "+
        "s.email as emailSupervisor, "+
        "s.descricao as nomeSupervisor, "+
        "v.nome as nomeRepresentante, "+
        "CASE WHEN v.celular IS NOT NULL THEN v.celular ELSE v.telefone END as phoneRepresentante "+
        "FROM pedidos p "+
        "INNER JOIN clientes c ON c.cnpj = p.cnpjcliente "+
        "INNER JOIN vendedores v on v.codigo = p.cdvendedor  "+
        "LEFT JOIN forma_pagamento f on f.codigo = p.cdformapagamento "+
        "LEFT JOIN supervisores s on s.codigo = p.cdsupervisor "+
        "LEFT JOIN filial_representante fi on fi.cdvendedor = v.codigo and fi.cdfilial = p.cdlocalfaturamento "+
        "WHERE (p.enviadoemail = 0 OR p.enviadoemailsupervisor = 0) AND p.situacao != 9";

    db.task('envio-email', async t => {
        
        const pedidos = await t.any(sql);
        
        for(var j=0; j < pedidos.length; j++) {

            var sql_itens = "select "+
                    "i.cdproduto, "+
                    "i.descricaoproduto, "+
                    "i.qtdeproduto, "+
                    "i.precovenda as valorunitario,"+
                    "p.especie, "+
                    "p.pesobruto, "+
                    "p.altura, "+
                    "p.largura, "+
                    "p.profundidade, "+
                    "p.unidade "+
                    "from itens_pedido i  "+
                    "inner join produtos p on p.codigo = i.cdproduto "+
                    "where i.cdpedido = "+pedidos[j].cdpedido+" and i.cdvendedor = "+pedidos[j].cdvendedor;
            
            const itens = await t.any(sql_itens);

            const data = preencherValores(pedidos[j], itens);
            //console.log(data);

            const buffer = await htmlToPdfBuffer("template.ejs", {
                pedido: data
            });


            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'suporte.lianealimentos@gmail.com',
                    pass: 'suportelianesfa'
                }
            });
            
            var mailOptions = {
                from: 'suporte.lianealimentos@gmail.com',
                cc: ["grupoliane@gmail.com"],
                to: pedidos[j].emailcliente,
                subject: 'Pedidos para validar',
                text: "Olá "+pedidos[j].nomecliente+", em anexo o pedido feito no dia "+(pedidos[j].dtpedido != undefined && pedidos[j].dtpedido != null ? pedidos[j].dtpedido.getDate()+"/"+(pedidos[j].dtpedido.getMonth()+1)+"/"+pedidos[j].dtpedido.getFullYear() : "")+
                " realizado com o vendedor "+pedidos[j].nomeRepresentante+".\n\n\n"+
                " Este email é enviado automáticamente e não precisa ser respondido!",
                attachments: [
                    {  
                        filename: 'Report.pdf',
                        content: buffer
                    }],
            };

            var mailOptionsSupervisor = {
                from: 'suporte.lianealimentos@gmail.com',
                cc: ["grupoliane@gmail.com"],
                to: pedidos[j].emailcliente,
                subject: 'Pedidos para validar',
                text: 'Olá '+pedidos[j].nomesupervisor+", o pedido feito no dia "+(pedidos[j].dtpedido != undefined && pedidos[j].dtpedido != null ? pedidos[j].dtpedido.getDate()+"/"+(pedidos[j].dtpedido.getMonth()+1)+"/"+pedidos[j].dtpedido.getFullYear() : "")+
                " realizado com o vendedor "+pedidos[j].nomerepresentante+" aguarda sua aprovação!\n\n\n"+
                " Este email é enviado automáticamente e não precisa ser respondido!",
                attachments: [
                    {  
                        filename: 'Report.pdf',
                        content: buffer
                    }],
            };
              
            if(pedidos[j].enviadoemail == 0){

                var res = await transporter.sendMail(mailOptions);

                if(res.accepted.length == 1 || res.accepted.length == 2){
                    //console.log('Email sent Cliente: ' + info.response);
                    var sql_update = "update pedidos set enviadoemail = 1 "+
                                    " where cdvendedor = "+pedidos[j].cdvendedor+
                                    " and cdpedido = "+pedidos[j].cdpedido+
                                    " and cdcliente = "+pedidos[j].cdcliente;
                                    
                    await t.any(sql_update).then(function (sucess) {
                        console.log("Setado enviado para o Cliente "+pedidos[j].nomecliente+
                                    " codigo cliente: "+ pedidos[j].cdcliente+
                                    " representante: "+ pedidos[j].cdvendedor);
                    }).catch(function (err) {
                        console.log("Problema setar enviado cliente: "+pedidos[j].cdcliente+
                                    " pedido: "+ pedidos[j].cdpedido+
                                    " representante: "+ pedidos[j].cdvendedor);
                        console.log("ERRO: "+err);
                    });
                }else{
                    console.log("Problema envio de email pedido: "+pedidos[j].cdpedido+
                                        " cliente: "+ pedidos[j].cdcliente+
                                        " representante: "+ pedidos[j].cdvendedor);
                }
            }

            if(pedidos[j].enviadoemailsupervisor == 0){

                var res = await transporter.sendMail(mailOptionsSupervisor);
                //console.log("res", res);
                if(res.accepted.length == 1 || res.accepted.length == 2){

                    var sql_update = "update pedidos set enviadoemailsupervisor = 1 "+
                                    " where cdvendedor = "+pedidos[j].cdvendedor+
                                    " and cdpedido = "+pedidos[j].cdpedido+
                                    " and cdcliente = "+pedidos[j].cdcliente;
                                    
                    await t.any(sql_update).then(function (sucess) {
                        console.log("Setado enviado para o supervisor "+pedidos[j].nomesupervisor+
                                    " cliente: "+ pedidos[j].cdcliente+
                                    " representante: "+ pedidos[j].cdvendedor);
                    }).catch(function (err) {
                        console.log("Problema setar enviado supervisor: "+pedidos[j].nomesupervisor+
                                    " cliente: "+ pedidos[j].cdcliente+
                                    " representante: "+ pedidos[j].cdvendedor);
                        console.log("ERRO: "+err);
                    });
                }else{
                    console.log("Problema envio de email supervisor pedido: "+pedidos[j].cdpedido+
                    " cliente: "+ pedidos[j].cdcliente+
                    " representante: "+ pedidos[j].cdvendedor);
                }
            }

        }        
    })
    .then(data => {
        // success
        // data = as returned from the task's callback
        console.log("Sucesso no envio de email "+data);
    })
    .catch(error => {
        // error
        console.log("Problema envio de email "+error);
    });

});

function preencherValores(value, items){

    var data = {
        "cdvendedor": (value.cdvendedor != undefined && value.cdvendedor != null ? value.cdvendedor : ""),
        // "cdpreposto": (value.cdpreposto != undefined && value.cdpreposto != null ? value.cdpreposto : ""),
        "cdpedido": (value.cdpedido != undefined && value.cdpedido != null ? value.cdpedido : ""),
        "descfilialfaturamento": (value.descfilialfaturamento != undefined && value.descfilialfaturamento != null ? value.descfilialfaturamento : ""),
        // "cdlocalfaturamento": (value.cdlocalfaturamento != undefined && value.cdlocalfaturamento != null ? value.cdlocalfaturamento : ""),
        "cdcliente": (value.cdcliente != undefined && value.cdcliente != null ? value.cdcliente : ""),
        // "cdclienteapk": (value.cdclienteapk != undefined && value.cdclienteapk != null ? value.cdclienteapk : ""),
        // "cnpj": (value.cnpj != undefined && value.cnpj != null ? value.cnpj : ""),
        // "tipotabela": (value.tipotabela != undefined && value.tipotabela != null ? value.tipotabela : ""),
        // "cdcobranca": (value.cdcobranca != undefined && value.cdcobranca != null ? value.cdcobranca : ""),
        // "cdvenda": (value.cdvenda != undefined && value.cdvenda != null ? value.cdvenda : ""),
        "dtpedido": (value.dtpedido != undefined && value.dtpedido != null ? ("0" + value.dtpedido.getDate()).substr(-2) + "/" + ("0" + (value.dtpedido.getMonth() + 1)).substr(-2) + "/" + value.dtpedido.getFullYear() : ""),
        // "dtentrega": (value.dtentrega != undefined && value.dtentrega != null ? value.dtentrega : ""),
        // "hrpedido": (value.hrpedido != undefined && value.hrpedido != null ? value.hrpedido : ""),
        // "cdformapagamento": (value.cdformapagamento != undefined && value.cdformapagamento != null ? value.cdformapagamento : ""),
        // "parcela1": (value.parcela1 != undefined && value.parcela1 != null ? value.parcela1 : ""),
        // "parcela2": (value.parcela2 != undefined && value.parcela2 != null ? value.parcela2 : ""),
        // "parcela3": (value.parcela3 != undefined && value.parcela3 != null ? value.parcela3 : ""),
        // "parcela4": (value.parcela4 != undefined && value.parcela4 != null ? value.parcela4 : ""),
        // "parcela5": (value.parcela5 != undefined && value.parcela5 != null ? value.parcela5 : ""),
        // "parcela6": (value.parcela6 != undefined && value.parcela6 != null ? value.parcela6 : ""),
        // "parcela7": (value.parcela7 != undefined && value.parcela7 != null ? value.parcela7 : ""),
        // "parcela8": (value.parcela8 != undefined && value.parcela8 != null ? value.parcela8 : ""),
        // "parcela9": (value.parcela9 != undefined && value.parcela9 != null ? value.parcela9 : ""),
         "cnpjcliente": (value.cnpjcliente != undefined && value.cnpjcliente != null ? formatToMask(value.cnpjcliente, '##.###.###.####-##') : ""),
        // "totaltabela": (value.totaltabela != undefined && value.totaltabela != null ? value.totaltabela : ""),
        // "totalvenda": (value.totalvenda != undefined && value.totalvenda != null ? value.totalvenda : ""),
        // "totaldesconto": (value.totaldesconto != undefined && value.totaldesconto != null ? value.totaldesconto : ""),
        // "bensuframa": (value.bensuframa != undefined && value.bensuframa != null ? value.bensuframa : ""),
        // "ordem": (value.ordem != undefined && value.ordem != null ? value.ordem : ""),
         "observacao": (value.observacao != undefined && value.observacao != null ? value.observacao : ""),
        // "nupedidocliente": (value.nupedidocliente != undefined && value.nupedidocliente != null ? value.nupedidocliente : ""),
        // "nunotafiscal": (value.nunotafiscal != undefined && value.nunotafiscal != null ? value.nunotafiscal : ""),
        // "serienotafiscal": (value.serienotafiscal != undefined && value.serienotafiscal != null ? value.serienotafiscal : ""),
        // "situacaonfe": (value.situacaonfe != undefined && value.situacaonfe != null ? value.situacaonfe : ""),
        // "dtemissaonota": (value.dtemissaonota != undefined && value.dtemissaonota != null ? value.dtemissaonota : ""),
        // "dtsaidanota": (value.dtsaidanota != undefined && value.dtsaidanota != null ? value.dtsaidanota : ""),
        // "valornota": (value.valornota != undefined && value.valornota != null ? value.valornota : ""),
        // "situacao": (value.situacao != undefined && value.situacao != null ? value.situacao : ""),
        // "gordurausada": (value.gordurausada != undefined && value.gordurausada != null ? value.gordurausada : ""),
        // "gorduragerada": (value.gorduragerada != undefined && value.gorduragerada != null ? value.gorduragerada : ""),
        // "motivousogordura": (value.motivousogordura != undefined && value.motivousogordura != null ? value.motivousogordura : ""),
        // "cdmotivogordura": (value.cdmotivogordura != undefined && value.cdmotivogordura != null ? value.cdmotivogordura : ""),
        // "enviadoftp": (value.enviadoftp != undefined && value.enviadoftp != null ? value.enviadoftp : ""),
        // "gorduraliberarsupervisor": (value.gorduraliberarsupervisor != undefined && value.gorduraliberarsupervisor != null ? value.gorduraliberarsupervisor : ""),
        // "st": (value.st != undefined && value.st != null ? value.st : ""),
        // "pesoliquidototal": (value.pesoliquidototal != undefined && value.pesoliquidototal != null ? value.pesoliquidototal : ""),
        // "pesobrutototal": (value.pesobrutototal != undefined && value.pesobrutototal != null ? value.pesobrutototal : ""),
        // "valorreferenciatotal": (value.valorreferenciatotal != undefined && value.valorreferenciatotal != null ? value.valorreferenciatotal : ""),
        // "totalvolume": (value.totalvolume != undefined && value.totalvolume != null ? value.totalvolume : ""),
        // "totalprodutos": (value.totalprodutos != undefined && value.totalprodutos != null ? value.totalprodutos : ""),
        // "cdsupervisor": (value.cdsupervisor != undefined && value.cdsupervisor != null ? value.cdsupervisor : ""),
        // "pendente": (value.pendente != undefined && value.pendente != null ? value.pendente : ""),
        // "motivousogordurasupervisor": (value.motivousogordurasupervisor != undefined && value.motivousogordurasupervisor != null ? value.motivousogordurasupervisor : ""),
        "situacaoDescricao": (value.pendente != undefined && value.pendente != null && value.pendente == 0 ? "*ATENÇÃO - Pedido sujeito a análise" : "Pedido liberado automáticamente"),

        "nomeCidade": (value.nomecidade != undefined && value.nomecidade != null ? value.nomecidade : ""),
        //"inscrestadual": (value.inscrestadual != undefined && value.inscrestadual != null ? formatToMask(value.inscrestadual, '###.###.###.###') : ""),
        "inscrestadual": (value.inscrestadual != undefined && value.inscrestadual != null ? value.inscrestadual : ""),
        "nomeCliente": (value.nomecliente != undefined && value.nomecliente != null ? value.nomecliente : ""),
        "cepCliente": (value.cepcliente != undefined && value.cepcliente != null ? formatToMask(value.cepcliente, '#####-###') : ""),
        "enderecoCliente": (value.enderecocliente != undefined && value.endereconumero != undefined && value.enderecocliente != null ? value.enderecocliente+", "+value.endereconumero : ""),
        "emailCliente": (value.emailcliente != undefined && value.emailcliente != null ? value.emailcliente : ""),
        "phoneCliente": (value.phonecliente != undefined && value.phonecliente != null ? value.phonecliente : ""),
        "bairroCliente": (value.bairrocliente != undefined && value.bairrocliente != null ? value.bairrocliente : ""),
        "ufCliente": (value.ufcliente != undefined && value.ufcliente != null ? value.ufcliente : ""),
        "nomeRepresentante": (value.nomerepresentante != undefined && value.nomerepresentante != null ? value.nomerepresentante : ""),
        "condPagamento": 
            (value.descformapagamento != undefined && value.descformapagamento != null ? value.descformapagamento+" " : "")+
            (value.parcela1 != undefined && value.parcela1 != null && value.parcela1 > 0 ? "P1 "+value.parcela1+" | " : "")+
            (value.parcela2 != undefined && value.parcela2 != null && value.parcela2 > 0 ? "P2 "+value.parcela2+" | " : "")+
            (value.parcela3 != undefined && value.parcela3 != null && value.parcela3 > 0 ? "P3 "+value.parcela3+" | " : "")+
            (value.parcela4 != undefined && value.parcela4 != null && value.parcela4 > 0 ? "P4 "+value.parcela4+" | " : "")+
            (value.parcela5 != undefined && value.parcela5 != null && value.parcela5 > 0 ? "P5 "+value.parcela5+" | " : "")+
            (value.parcela6 != undefined && value.parcela6 != null && value.parcela6 > 0 ? "P6 "+value.parcela6+" | " : "")+
            (value.parcela7 != undefined && value.parcela7 != null && value.parcela7 > 0 ? "P7 "+value.parcela7+" | " : "")+
            (value.parcela8 != undefined && value.parcela8 != null && value.parcela8 > 0 ? "P8 "+value.parcela8+" | " : "")+
            (value.parcela9 != undefined && value.parcela9 != null && value.parcela9 > 0 ? "P9 "+value.parcela9+" | " : ""),
        "phoneRepresentante": (value.phonerepresentante != undefined && value.phonerepresentante != null ? value.phonerepresentante : ""),
        "nroCompra": "",
        "totalPedido": (value.totalpedido != undefined && value.totalpedido != null ? value.totalpedido.toFixed(2) : "")
    }

    var totalPesoBiscoito = 0;
    var totalPesoMacarrao = 0;
    var totalPesoFarinha = 0;
    var totalPesoRevenda = 0;
    var totalPesoGeral = 0;
    var cubagemTotal = 0;

    var itens_pedidos = [];
    for(var j=0; j < items.length; j++) {

        var tmp ={
            ordenacao: (j + 1)+"",
            codigo: items[j].cdproduto,
            descricao: items[j].descricaoproduto,
            unidade: items[j].unidade,
            quantidade: items[j].qtdeproduto,
            valorUnitario: (items[j].valorunitario != null ? items[j].valorunitario.toFixed(2) : 0),
            total: (items[j].qtdeproduto * (items[j].valorunitario != null ? items[j].valorunitario : 0)).toFixed(2)
        }
        
        itens_pedidos[j] = tmp;

        cubagemTotal += (items[j].altura * items[j].largura * items[j].profundidade * items[j].qtdeproduto);

        totalPesoGeral += items[j].pesobruto;

        if(items[j].especie == 1){//Macarrao
            totalPesoMacarrao += items[j].pesobruto;
        } else if(items[j].especie == 2){//Biscoito
            totalPesoBiscoito += items[j].pesobruto;
        } else if(items[j].especie == 4){//Farinha
            totalPesoFarinha += items[j].pesobruto;
        } else if(items[j].especie == 6){//Revenda
            totalPesoRevenda += items[j].pesobruto;
        }

    }

    data.totalPesoMacarrao = totalPesoMacarrao.toFixed(4);
    data.totalPesoBiscoito = totalPesoBiscoito.toFixed(4);
    data.totalPesoFarinha = totalPesoFarinha.toFixed(4);
    data.totalPesoRevenda = totalPesoRevenda.toFixed(4);
    data.totalPesoGeral = totalPesoGeral.toFixed(4);
    data.cubagemTotal = cubagemTotal.toFixed(2);

    data.itens = itens_pedidos;

    return data;
}

function formatToMask(value, pattern) {
    var i = 0,
        v = value.toString();
    return pattern.replace(/#/g, _ => v[i++]);
}

async function htmlToPdfBuffer(pathname, params) {
    
    const html = await ejs.renderFile(pathname, params);
    
    var options = {
        format: "A4",
        orientation: "portrait"
    };

    return new Promise((resolve, reject) => {
        pdf.create(html, options).toBuffer((err, buffer) => {
            if (err) {
                reject(err);
            } else {
                resolve(buffer);
            }
        });
    });
}
