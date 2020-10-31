var db = require('./conexao').getDb();
var utils = require('./utils');
var dateFormat = require('dateformat');
const cron = require("node-cron");
const jsftp = require("jsftp");
var fs = require("fs");

var ftp_pedido = new jsftp({
  host: "54.94.243.33",
  port: 21, // defaults to 21
  user: "liane", // defaults to "anonymous"
  pass: "Integra@01" // defaults to "@anonymous"
});

var ftp_pedido_tmp = new jsftp({
  host: "54.94.243.33",
  port: 21, // defaults to 21
  user: "liane", // defaults to "anonymous"
  pass: "Integra@01" // defaults to "@anonymous"
});

var ftp_cliente = new jsftp({
  host: "54.94.243.33",
  port: 21, // defaults to 21
  user: "liane", // defaults to "anonymous"
  pass: "Integra@01" // defaults to "@anonymous"
});

var ftp_cliente_tmp = new jsftp({
  host: "54.94.243.33",
  port: 21, // defaults to 21
  user: "liane", // defaults to "anonymous"
  pass: "Integra@01" // defaults to "@anonymous"
});

var ftp_checar_arquivo = new jsftp({
    host: "54.94.243.33",
    port: 21, // defaults to 21
    user: "liane", // defaults to "anonymous"
    pass: "Integra@01" // defaults to "@anonymous"
  });

var ftp_move_file = new jsftp({
    host: "54.94.243.33",
    port: 21, // defaults to 21
    user: "liane", // defaults to "anonymous"
    pass: "Integra@01" // defaults to "@anonymous"
  });

var TIPOOCORRENCIA = "API-PROCESSOS";

cron.schedule("*/60 * * * * *", function() { 
    console.log("running a task every minute");

    db.task('insert-clientes', async t => {
        const clientes = await t.any('SELECT * FROM clientes c WHERE c.enviadoftp is false');        
        if(clientes != undefined) processarClientesInit(clientes);
    })
    .then(data => {
        // success
        // data = as returned from the task's callback
    })
    .catch(error => {
        // error
        //Cliente já inserido gera cod 23505
    });

    
    db.task('insert-pedidos', async t => {
    
        var sql = "SELECT p.*,c.idtipotabela "+
        "FROM pedidos p "+
        "LEFT JOIN clientes c on c.cnpj = p.cnpjcliente and c.cdvendedor = p.cdvendedor "+
        "WHERE p.enviadoftp is false and p.pendente = 1 ";
    
        const pedidos = await t.any(sql);
       
   	    var strPedido = "<PEDIDOS>\n";
    	var strPedidoItem = "<ITEM DO PEDIDO>\n";

    	for(var i=0; i < pedidos.length; i++) {
        	var pedido = pedidos[i];

        	var gorduraGerada = 0;
        	var gorduraUsada = 0;
        	var totalST = 0;

            	const itenspedidos = await t.any('select ip.*, p.descricao FROM itens_pedido ip ' +
            	'inner join produtos p ' +
            	' on p.codigo = ip.cdproduto '+
            	' where ip.cdpedido = '+pedido.cdpedido+
            	' and ip.cdvendedor = '+pedido.cdvendedor);

            //Somente envia os pedidos que tenham itens
            if((itenspedidos == undefined || itenspedidos.length == 0) 
                && pedido.situacao != 9){ continue; }

            for(var j=0; j < itenspedidos.length; j++) {
            
              strPedidoItem +=  zeros(pedido.cdvendedor,3) + "|" +
                                zeros(pedido.cdvendedor,3) + "|" +
                                zeros(pedido.cdpedido,6) + "|" +
                                itenspedidos[j].cdproduto + "|" +
                                zeros(pedido.cdlocalfaturamento,2) + "|" +
                                (pedido.idtipotabela == undefined || pedido.idtipotabela == null ? "" : zeros(pedido.idtipotabela,4) ) + "|" +
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
    
                gorduraUsada += itenspedidos[j].usogordura != null || itenspedidos[j].usogordura != undefined ? itenspedidos[j].usogordura : 0;
                gorduraGerada += itenspedidos[j].sobragordura != null || itenspedidos[j].sobragordura != undefined ? itenspedidos[j].sobragordura : 0;
                totalST += itenspedidos[j].ST != null || itenspedidos[j].ST != undefined ? itenspedidos[j].ST : 0;
            }
    
            pedido.dtpedido = dateFormat(pedido.dtpedido, "dd/mm/yyyy");
    
            strPedido += zeros(pedido.cdvendedor,3) + "|" +
                        zeros(pedido.cdvendedor,3) + "|" +
                        zeros(pedido.cdpedido,6) + "|" +
                        (pedido.cdclienteerp != undefined ? pedido.cdclienteerp : "") + "|" +
                        (pedido.cdcliente != undefined ? pedido.cdcliente : "") + "|" +
                        pedido.cnpjcliente + "|" +
                        zeros(pedido.cdlocalfaturamento,2) + "|" +
                        (pedido.idtipotabela == undefined || pedido.idtipotabela == null ? "" : zeros(pedido.idtipotabela,4) ) + "|" +
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

        if(pedidos.length > 0 
            && strPedido.localeCompare("<PEDIDOS>\n") != 0){
            enviaPedidos(strPedido, strPedidoItem, pedidos);
        }
    })
    .then(data => {
        // success
        // data = as returned from the task's callback
        
    })
    .catch(error => {
        // error
        //Pedido já inserido gera cod 23505
    });

    
});

function processarPedidos(req, res, next) {

	var processarpedidos = req.body.processarpedidos;

	if(processarpedidos.localeCompare('true') == 0){


	    db.task('my-task', async t => {

            var sql = "SELECT p.*,c.idtipotabela "+
                "FROM pedidos p "+
                "LEFT JOIN clientes c on c.cnpj = p.cnpjcliente and c.cdvendedor = p.cdvendedor "+
                "WHERE p.enviadoftp is false and p.pendente = 1 ";

            const pedidos = await t.any(sql);

            const itenspedidos = await db.any('select ip.*, p.descricao FROM itens_pedido ip ' +
                'inner join produtos p ' +
                ' on p.codigo = ip.cdproduto '+
                ' where ip.cdpedido = '+pedido.cdpedido+
                ' and IP.cdvendedor = '+pedido.cdvendedor);
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

function processarClientesInit(clientes){
    var strCliente = "<CLIENTES>\n";

    for(var j=0; j < clientes.length; j++) {
        
        var cliente = clientes[j];

        strCliente += cliente.cdvendedor+"|"+
        (cliente.codigo != null ? cliente.codigo : "")+"|"+ //este é o código que irá vir pelo sitema da liane, na criação do cliente este código é nulo
        (cliente.nome != null ? cliente.nome : "")+"|"+
        (cliente.fantasia != null ? cliente.fantasia : "")+"|"+
        (cliente.endereco != null ? cliente.endereco : "")+"|"+
        (cliente.numeroendereco != null ? cliente.numeroendereco : "")+"|"+
        (cliente.complementoendereco != null ? cliente.complementoendereco : "")+"|"+
        (cliente.bairro != null ? cliente.bairro : "")+"|"+
        (cliente.cidade != null ? cliente.cidade : "")+"|"+
        (cliente.uf != null ? cliente.uf : "")+"|"+
        (cliente.cep != null ? cliente.cep : "")+"|"+
        (cliente.cnpj != null ? cliente.cnpj : "")+"|"+
        (cliente.inscrestadual != null ? cliente.inscrestadual : "")+"|"+
        (cliente.fone != null ? cliente.fone : "")+"|"+
        (cliente.celular != null ? cliente.celular : "")+"|"+
        (cliente.fax != null ? cliente.fax : "")+"|"+
        (cliente.contato != null ? cliente.contato : "")+"|"+
        (cliente.email != null ? cliente.email : "")+"|"+
        (cliente.tipopessoa != null ? cliente.tipopessoa : "")+"|"+
        (cliente.regapuracao != null ? cliente.regapuracao : "")+"|"+
        (cliente.limcred != null ? cliente.limcred : "")+"|"+
        (cliente.situacao != null ? cliente.situacao : "")+"|"+
        (cliente.possuiie != null ? cliente.possuiie : "")+"|"+
        (cliente.liminarst != null ? cliente.liminarst : "")+"|"+
        (cliente.idfilial != null ? zeros(cliente.idfilial,2) : "")+"|"+
        (cliente.idtipotabela != null ? zeros(cliente.idtipotabela,4) : "") + "|" +
        (cliente.suframa != null ? cliente.suframa : "")+"|"+
        (cliente.email2 != null ? cliente.email2 : "")+"|"+
        (cliente.email3 != null ? cliente.email3 : "")+"|"+
        (cliente.codigo != null && cliente.codigo > 0 ? cliente.codigo : 
            (cliente.codigointerno != null && cliente.codigointerno > 0 ? cliente.codigointerno : "")
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

async function enviaPedidos(strPedido, strPedidoItem, pedidos){

	var buffer = Buffer.from(strPedido + strPedidoItem);

	var d = new Date();
	var nome = "Pedidos_" + dateFormat(d, "yyyymmddHHMMss") + ".txt";

    await ftp_pedido.put(buffer, "upload_tmp/pedidos/"+"copy_"+nome, err => {
      if (!err) {
        console.log("Pedidos gravados na pasta temporaria!");
      }else{
        console.log("Error_pedido: "+err);
      }
    });

    await ftp_pedido_tmp.put(buffer, "upload_tmp/pedidos/"+nome, err => {
	  if (!err) {
	    //console.log("Setando como enviados!");
        //setaPedidosEnviados(pedidos);
        
        //var linhas = ""; // Will store the contents of the file
        ftp_checar_arquivo.get("upload_tmp/pedidos/"+nome, (erro, socket) => {
            if (erro) {
                return;
            }
        
            socket.on("data", d => {
                
                var linhas = d.toString().split("\n");
                var pedidos_enviados = new Array();
                
                for (i in linhas) {
                    //console.log("teste ", linhas[i]);
                    //Ao checar na tag de item não é necessario continuar o laço repetidor
                    if(linhas[i].trim().includes("<ITEM DO PEDIDO>")) {
                        break;
                    }
                    //Coleta todos os pedidos já enviados no arquivo
                    if(!linhas[i].includes("<")){
                        for(var j=0; j < pedidos.length; j++) {
                            var pedido = pedidos[j];
                            //Se o pedido que esta no arquivo estiver no array de pedidos enviados então
                            //cria um array
                            if(parseInt(pedido.cdpedido) == parseInt(linhas[i].split("|")[2])){
                                pedidos_enviados.push(pedido);
                            }   
                        }
                    }
                }
                
                ftp_move_file.rename("upload_tmp/pedidos/"+nome, "upload/"+nome, (err, res) => {
                    if (!err) {
                        console.log("Renaming successful!");
                    }
                });

                if(pedidos_enviados.length > 0) setaPedidosEnviados(pedidos_enviados);
            });
        
            socket.on("close", err => {
                if (err) {
                console.error("There was an error retrieving the file.");
                }
            });
        
            socket.resume();
        });

	  }else{
	  	console.log("Error_pedido_tmp: "+err);
	  }
    });
    
}

async function enviaClientes(strCliente, clientes){

	var buffer = Buffer.from(strCliente);

	var d = new Date();
	var nome = "Clientes_" + dateFormat(d, "yyyymmddHHMMss") + ".txt";
    //console.log("a processar, enviando");
    if(clientes.length > 0){
        
        await ftp_cliente.put(buffer, "upload/"+nome, err => {
            if (!err) {
                console.log("File transferred successfully!");
            }else{
                console.log("Error_cliente: "+err);
            }
        });

        await ftp_cliente_tmp.put(buffer, "upload_tmp/clientes/"+nome, err => {
            if (!err) {
                console.log("Clientes gravados na pasta temporaria!");
                setaClientesEnviados(clientes);
            }else{
                console.log("Error_cliente_tmp: "+err);
            }
        });

    }

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
            " and cdvendedor = "+pedido.cdvendedor;
            /*" and (cdcliente = "+pedido.cdcliente+
            " or cdclienteapk = "+pedido.cdclienteapk+"); ";*/
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
        var msg = "problema na atualizacao dos pedidos para enviadoftp true: \n";
        console.log(msg, error);
        utils.registrarOcorrencias(msg + error, TIPOOCORRENCIA, "ENVIAR PEDIDOS FTP", "", 0, "ERROR", false, "", db, "");
    });
}

/*
	Seta os clientes que foram processados como enviados
*/
function setaClientesEnviados(clientes){
	
    var query_update = "";
	for(var i=0; i < clientes.length; i++) {
		var cliente = clientes[i];
        
        if(cliente.codigo != null && cliente.codigo > 0){
            query_update += "update clientes set enviadoftp = true where codigo = "+cliente.codigo+";";
        }else{
            query_update += "update clientes set enviadoftp = true where codigointerno = "+cliente.codigointerno+";";
        }
	}
    
    if(clientes.length > 0){
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
            var msg = "problema na atualizacao dos clientes para enviadoftp true: \n";
            console.log(msg, error);
            utils.registrarOcorrencias(msg + error, TIPOOCORRENCIA, "ENVIAR CLIENTES FTP", "", 0, "ERROR", false, "", db, "");
        });
    }
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
	
    if(param.cdsupervisor == undefined && param.cdsupervisor.localeCompare('') == 0){
        return res.status(400).json({error: '(cdsupervisor) obrigatorio no corpo da requisicao para carregar o pedido'});
    }

    if(param.gorduraliberada == undefined && param.gorduraliberada == 0){
        return res.status(400).json({error: '(gorduraliberada) obrigatorio no corpo da requisicao para carregar o pedido'});
    }

    if(param.dataliberada == undefined && param.dataliberada.localeCompare('') == 0){
        return res.status(400).json({error: '(dataliberada) obrigatorio no corpo da requisicao para carregar o pedido'});
    }

    sql = "update pedidos set pendente = '1' where 1=1 "+fVendedor+fcliente+fpedido+"; ";
    sql += "INSERT INTO pedidos_aprovados(cdsupervisor,cdvendedor,cdpedido,gorduraliberada,dataliberada) VALUES ";
    sql += "("+ (param.cdsupervisor.localeCompare('') == 0 ? null : param.cdsupervisor)
        +","+ (param.cdvendedor.localeCompare('') == 0 ? null : param.cdvendedor)
        +","+ (param.cdpedido.localeCompare('') == 0 ? null : param.cdpedido)
        +","+ (param.gorduraliberada == 0 ? null : param.gorduraliberada.toString().replace(/,/, '.'))
        +","+ (param.dataliberada.localeCompare('') == 0 ? null : "'"+param.dataliberada+"'")
        +"); ";

    console.log(sql);
	db.any(sql)
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
