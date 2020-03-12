var db = require('./conexao').getDb();
var utils = require('./utils');
var dateFormat = require('dateformat');
const cron = require("node-cron");
const jsftp = require("jsftp");

var ftp = new jsftp({
  host: "54.94.243.33",
  port: 21, // defaults to 21
  user: "liane", // defaults to "anonymous"
  pass: "Integra@01" // defaults to "@anonymous"
});

cron.schedule("*/20 * * * * *", function() { 
    console.log("running a task every minute");

    db.task('insert-pedidos', async t => {
        
        const pedidos = await t.any('SELECT p.*,c1.idtipotabela as c1_idtipotabela, c2.idtipotabela as c2_idtipotabela FROM pedidos p LEFT JOIN clientes c1 on c1.codigo = p.cdcliente LEFT JOIN clientes c2 on c2.codigointerno = p.cdclienteapk WHERE p.enviadoftp is false and p.pendente = 1');
        var ids = "";
        var cdvendedores = "";
        for(var i=0; i < pedidos.length; i++) {
            var pedido = pedidos[i];
            ids += pedido.cdpedido+",";
            cdvendedores += pedido.cdvendedor+",";
        }

        ids = ids.substring(0, ids.length-1);
        cdvendedores = cdvendedores.substring(0, cdvendedores.length-1);

        const itenspedidos = await t.any('select ip.*, p.descricao FROM itens_pedido ip ' +
                'inner join produtos p ' +
                ' on p.codigo = ip.cdproduto '+
                ' where ip.cdpedido in ('+ids+")"+
                ' and IP.cdvendedor in ('+cdvendedores+")");
        
        processarPedidosInit(pedidos, itenspedidos);
    })
    .then(data => {
        // success
        // data = as returned from the task's callback
    })
    .catch(error => {
        // error
        //Pedido já inserido gera cod 23505
    });

    db.task('insert-clientes', async t => {
        const clientes = await t.any('SELECT c FROM clientes c WHERE c.enviadoftp is false');        
        processarClientesInit(clientes);
    })
    .then(data => {
        // success
        // data = as returned from the task's callback
    })
    .catch(error => {
        // error
        //Cliente já inserido gera cod 23505
    });
});

function processarPedidos(req, res, next) {

	var processarpedidos = req.body.processarpedidos;

	if(processarpedidos.localeCompare('true') == 0){


	    db.task('my-task', async t => {

            const pedidos = await t.any('SELECT p.*,c1.idtipotabela as c1_idtipotabela, c2.idtipotabela as c2_idtipotabela FROM pedidos p LEFT JOIN clientes c1 on c1.codigo = p.cdcliente LEFT JOIN clientes c2 on c2.codigointerno = p.cdclienteapk WHERE p.enviadoftp is false and p.pendente is false');

            const itenspedidos = await db.any('select ip.*, p.descricao FROM itens_pedido ip ' +
                'inner join produtos p ' +
                ' on p.codigo = ip.cdproduto '+
                ' where ip.cdpedido = '+pedido.cdpedido+
                ' and IP.cdvendedor = '+pedido.cdvendedor);

            //processarPedidosInit(pedidos, itenspedidos);
	    })
	    .then(data => {
	        // success
	        // data = as returned from the task's callback
	        res.status(200)
		    .json({
		        status: 'success',
		        message: 'Pedidos processados'
		    });
	    })
	    .catch(error => {
	        // error
	        res.status(500)
		    .json({
		        status: 'error',
		        message: 'Ouve algum problema no processamento dos pedidos. Favor contactar o administrador! '+error
		    });
	    });

	}else{

		res.status(200)
	    .json({
	        status: 'warning',
	        message: 'Para processar os pedidos o paramentro tem que ser <true>'
	    });
	}

}

function processarPedidosInit(pedidos, itenspedidos){
    var strPedido = "<PEDIDOS>\n";
    var strPedidoItem = "<ITEM DO PEDIDO>\n";

    
    //console.log("pedidos", pedidos);

    for(var i=0; i < pedidos.length; i++) {
        var pedido = pedidos[i];

        var gorduraGerada = 0;
        var gorduraUsada = 0;
        var totalST = 0;

        for(var j=0; j < itenspedidos.length; j++) {
            
            strPedidoItem += pedido.cdvendedor + "|" +
                            pedido.cdvendedor + "|" +
                            zeros(pedido.cdpedido,6) + "|" +
                            itenspedidos[j].cdproduto + "|" +
                            zeros(pedido.cdlocalfaturamento,2) + "|" +
                            (pedido.c2_idtipotabela == undefined || pedido.c2_idtipotabela == null ? zeros(pedido.c1_idtipotabela,4) : zeros(pedido.c2_idtipotabela,4)) + "|" +
                            itenspedidos[j].tipodesc + "|" +
                            zeros(Math.round(itenspedidos[j].qtdeproduto),6) + "|" +
                            (itenspedidos[j].precotabela != null ? itenspedidos[j].precotabela.toFixed(2) : 0) + "|" +
                            (itenspedidos[j].percdescontomax != null ? itenspedidos[j].percdescontomax.toFixed(2) : 0) + "|" +
                            (itenspedidos[j].percdescontomin != null ? itenspedidos[j].percdescontomin.toFixed(2) : 0) + "|" +
                            (itenspedidos[j].percdesconto != null ? itenspedidos[j].percdesconto.toFixed(2) : 0) + "|" +
                            (itenspedidos[j].valordesconto != null ? itenspedidos[j].valordesconto.toFixed(2) : 0) + "|" +
                            (itenspedidos[j].precovenda != null ? itenspedidos[j].precovenda.toFixed(2) : 0) + "|" +
                            (itenspedidos[j].sobragordura != null ? itenspedidos[j].sobragordura.toFixed(2) : 0) + "|" +
                            (itenspedidos[j].usogordura != null ? itenspedidos[j].usogordura.toFixed(2) : 0) + "|" +
                            (itenspedidos[j].st != null ? itenspedidos[j].st.toFixed(2) : 0) + "|" +
                            (itenspedidos[j].cdpedidobonificacao > 0 ? itenspedidos[j].cdpedidobonificacao : 0) + "|" +
			    (itenspedidos[j].valornegativogordura > 0 ? itenspedidos[j].valornegativogordura.toFixed(2) : "0.00") + "|" +
			    (itenspedidos[j].valorreferencia > 0 ? itenspedidos[j].valorreferencia.toFixed(2) : 0) + "|" +
			    (itenspedidos[j].valorminimodisponivel > 0 ? itenspedidos[j].valorminimodisponivel.toFixed(2) : 0) + "|" +
                            "\n";

            gorduraUsada += itenspedidos[j].USOGORDURA != null || itenspedidos[j].USOGORDURA != undefined ? itenspedidos[j].USOGORDURA : 0;
            gorduraGerada += itenspedidos[j].SOBRAGORDURA != null || itenspedidos[j].SOBRAGORDURA != undefined ? itenspedidos[j].SOBRAGORDURA : 0;
            totalST += itenspedidos[j].ST != null || itenspedidos[j].ST != undefined ? itenspedidos[j].ST : 0;
        }

        pedido.dtpedido = dateFormat(pedido.dtpedido, "dd/mm/yyyy");

        strPedido += pedido.cdvendedor + "|" +
                    pedido.cdvendedor + "|" +
                    zeros(pedido.cdpedido,6) + "|" +
                    (pedido.cdclienteerp != undefined ? pedido.cdclienteerp : "") + "|" +
                    (pedido.cdcliente != undefined ? pedido.cdcliente : "") + "|" +
                    pedido.cnpjcliente + "|" +
                    zeros(pedido.cdlocalfaturamento,2) + "|" +
                    (pedido.c2_idtipotabela == undefined || pedido.c2_idtipotabela == null ? zeros(pedido.c1_idtipotabela,4) : zeros(pedido.c2_idtipotabela,4)) + "|" +
                    pedido.dtpedido + "|" +
                    (pedido.ordem != undefined ? pedido.ordem : "") + "|" +
                    (pedido.observacao != undefined ? pedido.observacao : "") + "|" +
                    pedido.cdvenda + "|" +
                    pedido.cdformapagamento + "|" +
                    (pedido.cdcobranca == 0 ? "E" : "R")+ "|" + // "ENTREGAR", "RETIRAR"
                    (pedido.bensuframa > 0 ? "S" : "N") + "|" +
                    (pedido.parcela1 != null ? zeros(pedido.parcela1,3) :"000")+ "|" +
                    (pedido.parcela2 != null ? zeros(pedido.parcela2,3) :"000")+ "|" +
                    (pedido.parcela3 != null ? zeros(pedido.parcela3,3) :"000")+ "|" +
                    (pedido.parcela4 != null ? zeros(pedido.parcela4,3) :"000")+ "|" +
                    (pedido.parcela5 != null ? zeros(pedido.parcela5,3) :"000")+ "|" +
                    "000|" +
                    "000|" +
                    "000|" +
                    "000|" +
                    pedido.situacao + "|" +
                    (pedido.totalvenda != null ? pedido.totalvenda.toFixed(2) : "") + "|" +
                    (pedido.totaltabela != null ? pedido.totaltabela.toFixed(2) : "") + "|" +
                    (pedido.totaldesconto != null ? pedido.totaldesconto.toFixed(2) : "") + "|" +
                    gorduraGerada.toFixed(2) + "|" +
                    gorduraUsada.toFixed(2) + "|" +
                        pedido.cdpedido + "|" +
                    totalST.toFixed(2) + "|"+
                    (pedido.cdmotivogordura > 0 ? pedido.cdmotivogordura : "") + "|" +
                    (pedido.motivousogordura != null ? pedido.motivousogordura : "") + "|" +
                    "\n";
    }

    enviaPedidos(strPedido, strPedidoItem, pedidos);
}

function processarClientesInit(clientes){
    var strCliente = "<CLIENTES>\n";

    for(var j=0; j < clientes.length; j++) {
        
        var cliente = clientes[j];

        strCliente += cliente.CDVENDEDOR+"|"+
        (cliente.CODIGO != null ? cliente.CODIGO : "")+"|"+ //Este é o código que irá vir pelo sitema da Liane, na criação do cliente este código é nulo
        (cliente.NOME != null ? cliente.NOME : "")+"|"+
        (cliente.FANTASIA != null ? cliente.FANTASIA : "")+"|"+
        (cliente.ENDERECO != null ? cliente.ENDERECO : "")+"|"+
        (cliente.NUMEROENDERECO != null ? cliente.NUMEROENDERECO : "")+"|"+
        (cliente.COMPLEMENTOENDERECO != null ? cliente.COMPLEMENTOENDERECO : "")+"|"+
        (cliente.BAIRRO != null ? cliente.BAIRRO : "")+"|"+
        (cliente.CIDADE != null ? cliente.CIDADE : "")+"|"+
        (cliente.UF != null ? cliente.UF : "")+"|"+
        (cliente.CEP != null ? cliente.CEP : "")+"|"+
        (cliente.CNPJ != null ? cliente.CNPJ : "")+"|"+
        (cliente.INSCRESTADUAL != null ? cliente.INSCRESTADUAL : "")+"|"+
        (cliente.FONE != null ? cliente.FONE : "")+"|"+
        (cliente.CELULAR != null ? cliente.CELULAR : "")+"|"+
        (cliente.FAX != null ? cliente.FAX : "")+"|"+
        (cliente.CONTATO != null ? cliente.CONTATO : "")+"|"+
        (cliente.EMAIL != null ? cliente.EMAIL : "")+"|"+
        (cliente.TIPOPESSOA != null ? cliente.TIPOPESSOA : "")+"|"+
        (cliente.REGAPURACAO != null ? cliente.REGAPURACAO : "")+"|"+
        (cliente.LIMCRED != null ? cliente.LIMCRED : "")+"|"+
        (cliente.SITUACAO != null ? cliente.SITUACAO : "")+"|"+
        (cliente.POSSUIIE != null ? cliente.POSSUIIE : "")+"|"+
        (cliente.LIMINARST != null ? cliente.LIMINARST : "")+"|"+
        (cliente.IDFILIAL != null ? zeros(cliente.IDFILIAL,2) : "")+"|"+
        (cliente.IDTIPOTABELA != null ? zeros(cliente.IDTIPOTABELA,4) : "") + "|" +
        (cliente.SUFRAMA != null ? cliente.SUFRAMA : "")+"|"+
        (cliente.EMAIL2 != null ? cliente.EMAIL2 : "")+"|"+
        (cliente.EMAIL3 != null ? cliente.EMAIL3 : "")+"|"+
        (cliente.CODIGO != null && cliente.CODIGO > 0 ? cliente.CODIGO : 
            (cliente.CODIGOINTERNO != null && cliente.CODIGOINTERNO > 0 ? cliente.CODIGOINTERNO : "")
        )+"|"+
        "\n";
    }

    enviaClientes(strCliente, clientes);
}

function zeros(value, qtd){
    var result = "";

    var nzeros = qtd - value.length;

    if (nzeros < 1){
        return value;
    }

    for (var i = 0; i < nzeros; i++){
        result += "0";
    }

    result = result + value;

    return result;
}

function enviaPedidos(strPedido, strPedidoItem, pedidos){

	var buffer = Buffer.from(strPedido + strPedidoItem);

	var d = new Date();
	var nome = "Pedidos_" + dateFormat(d, "yyyyMMddHHmmss") + ".txt";
    //console.log("a processar, enviando");
    ftp.put(buffer, "upload/"+nome, err => {
	  if (!err) {
	    console.log("File transferred successfully!");
	    setaPedidosEnviados(pedidos)
	  }else{
	  	console.log("Error: "+err);
	  }
	});

	return "teste";
}

function enviaClientes(strCliente, clientes){

	var buffer = Buffer.from(strCliente);

	var d = new Date();
	var nome = "Clientes_" + dateFormat(d, "yyyyMMddHHmmss") + ".txt";
    //console.log("a processar, enviando");
    ftp.put(buffer, "upload/"+nome, err => {
	  if (!err) {
	    console.log("File transferred successfully!");
	    setaClientesEnviados(clientes)
	  }else{
	  	console.log("Error: "+err);
	  }
	});

}

/*
	Seta os pedidos que foram processados como enviados
*/
function setaPedidosEnviados(pedidos){
	
	//var idPedidos = "";
    var query_update = "";
    //console.log("a processar, setando 1", query_update);
	for(var i=0; i < pedidos.length; i++) {
		var pedido = pedidos[i];
		
		query_update += "update pedidos set enviadoftp = true where cdpedido = "+pedido.cdpedido+
            " and cdvendedor = "+pedido.cdvendedor+
            " and (cdcliente = "+pedido.cdcliente+
            " or cdclienteapk = "+pedido.cdclienteapk+"); ";
	}

    //console.log("a processar, setando", query_update);
    db.task('my-task', async t => {
        //console.log("result, teste");
        const result = await db.any(query_update);
        
    })
    .then(data => {
        // success
        // data = as returned from the task's callback
        console.log("Pedidos atualizados como já enviados para o FTP");
    })
    .catch(error => {
        console.log("problema na atualizacao dos pedidos para enviadoftp true: \n", error);
    });
}

/*
	Seta os clientes que foram processados como enviados
*/
function setaClientesEnviados(clientes){
	
    var query_update = "";
	for(var i=0; i < clientes.length; i++) {
		var cliente = clientes[i];
        
        if(cliente.CODIGO != null && cliente.CODIGO > 0){
            query_update += "update clientes set enviadoftp = true where codigo = "+cliente.CODIGO;
        }else{
            query_update += "update clientes set enviadoftp = true where CODIGOINTERNO = "+cliente.CODIGOINTERNO;
        }
	}

    //console.log("a processar, setando", query_update);
    db.task('my-task', async t => {
        //console.log("result, teste");
        const result = await db.any(query_update);
        
    })
    .then(data => {
        // success
        // data = as returned from the task's callback
        console.log("Clientes atualizados como já enviados para o FTP");
    })
    .catch(error => {
        console.log("problema na atualizacao dos clientes para enviadoftp true: \n", error);
    });
}

function rejeitarPedidoPendente(req, res, next){
	const param = req.body;

	var fpedido = '';
    var fVendedor = '';
	var fcliente = '';
	
	
    if(param.cdpedido !== undefined && param.cdpedido != ''){
        fpedido = ' and cdpedido = '+parseInt(param.cdpedido);
    }else{
        return res.status(400).json({error: '(cdpedido) obrigatorio no corpo da requisicao para carregar o pedido'});
    }

    if(param.cdvendedor !== undefined && param.cdvendedor != ''){
        fVendedor = ' and cdvendedor = '+parseInt(param.cdvendedor);
    }else{
        return res.status(400).json({error: '(cdvendedor) obrigatorio no corpo da requisicao para carregar o pedido'});
    }

    if(param.cdcliente !== undefined && param.cdcliente != ''){
        fcliente = ' and cdcliente = '+parseInt(param.cdcliente);
    }else{
        return res.status(400).json({error: '(cdcliente) obrigatorio no corpo da requisicao para carregar o pedido'});
    }
	
	db.any("update pedidos set pendente = '2' where 1=1 "+fVendedor+fcliente+fpedido)
		.then(data =>  {
	        // success
	        // data = as returned from the task's callback
			console.log("Pedido rejeitado com sucesso");

			return res.status(200)
				.json({
					status: 'success',
					data_pedidos: data,
					message: 'Pedido rejeitado com sucesso'
				});

		}).catch(error => {
			console.log("Ocorreu um erro ao rejeitar o pedido  \n", error);
		
			return res.status(500)
			.json({
				status: 'Warning',
				data_pedidos: 'Nao existe pedido ou houve algum problema',
				message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador'
			});
            
	    });
	
}

function liberarPedidoPendente(req, res, next){
	const param = req.body;

	var fpedido = '';
    var fVendedor = '';
	var fcliente = '';
	
	
    if(param.cdpedido !== undefined && param.cdpedido != ''){
        fpedido = ' and cdpedido = '+parseInt(param.cdpedido);
    }else{
        return res.status(400).json({error: '(cdpedido) obrigatorio no corpo da requisicao para carregar o pedido'});
    }

    if(param.cdvendedor !== undefined && param.cdvendedor != ''){
        fVendedor = ' and cdvendedor = '+parseInt(param.cdvendedor);
    }else{
        return res.status(400).json({error: '(cdvendedor) obrigatorio no corpo da requisicao para carregar o pedido'});
    }

    if(param.cdcliente !== undefined && param.cdcliente != ''){
        fcliente = ' and cdcliente = '+parseInt(param.cdcliente);
    }else{
        return res.status(400).json({error: '(cdcliente) obrigatorio no corpo da requisicao para carregar o pedido'});
    }
	
	db.any("update pedidos set pendente = '1' where 1=1 "+fVendedor+fcliente+fpedido)
		.then(data =>  {
	        // success
	        // data = as returned from the task's callback
			console.log("Pedido liberado com sucesso");

			res.status(200)
				.json({
					status: 'success',
					data_pedidos: data,
					message: 'Pedido liberado com sucesso'
				});

		}).catch(error => {
			console.log("Ocorreu um erro ao liberado o pedido  \n", error);
			
			
			return res.status(500)
			.json({
				status: 'Warning',
				data_pedidos: 'Nao existe pedido ou houve algum problema',
				message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador'
			});

	    });
	
}

module.exports = {
    rejeitarPedidoPendente:rejeitarPedidoPendente,
    liberarPedidoPendente:liberarPedidoPendente,
    processarPedidos: processarPedidos
};