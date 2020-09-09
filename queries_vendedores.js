var db = require('./conexao').getDb();

// add query functions
function recuperarVendedores(req, res, next) {
    db.any('select * from vendedores')
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
                    data_sellers: data,
                    message: 'Retrieved ALL vendedores'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_sellers: 'Não existem vendedores ou houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function recuperarVendedorPorCodigo(req, res, next) {
    var codigo = parseInt(req.body.codigo);
    db.any('select * from vendedores where codigo = $1', codigo)
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
                    data_sellers: data,
                    message: 'Retrieved ONE vendedor'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_sellers: 'Não existe o vendedor ou houve algum problema',
                    message: 'Err: '+err
                });
    });
}

function recuperarVendedorPorNome(req, res, next) {
    var nome = req.body.nome;
    db.any("select * from vendedores where nome like '%"+nome+"%'")
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
                    data_sellers: data,
                    message: 'Retrieved ONE vendedor'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_sellers: 'Não existe o vendedor ou houve algum problema',
                    message: 'Err: '+err
                });
    });
}

function recuperarVendedorPorNomeCodigo(req, res, next) {
    var nome = req.body.nome;
    var sql;
    var empty = [];
    if(nome == undefined || nome == ""){
        return res.status(200)
                .json({
                    status: 'Warning',
                    data_sellers: empty,
                    message: 'Favor enviar algum valor'
                });
        //sql = "select * from vendedores";
    }else{
        sql = "select * from vendedores where nome like '%"+nome.toUpperCase()+"%' or CAST(codigo AS VARCHAR(250)) like '"+nome.toUpperCase()+"'";
    }
    //console.log(sql);
    db.any(sql)
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
                    data_sellers: data,
                    message: 'Retrieved ONE vendedor'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_sellers: 'Não existe o vendedor ou houve algum problema',
                    message: 'Err: '+err
                });
    });
}

function recuperarVendedorPorCdSupervisor(req, res, next) {
    var cdsupervisor = req.body.cdsupervisor;
    var sql;
    /*if(cdsupervisor == undefined || cdsupervisor == ""){
        sql = "select * from vendedores";
    }else{
        sql = "select * from vendedores where nome like '%"+nome.toUpperCase()+"%' or CAST(codigo AS VARCHAR(250)) like '"+nome.toUpperCase()+"'";
    }*/
    console.log(sql);
    db.any("select v.* from vendedores v inner join supervisionados s on s.cdvendedor = v.codigo where s.cdsupervisor = "+cdsupervisor+" order by codigo")
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
                    data_sellers: data,
                    message: 'Retrieved List of vendedores'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_sellers: 'Não existe o vendedor ou houve algum problema',
                    message: 'Err: '+err
                });
    });
}

function inserirVendedores(req, res, next) {
    var vendedor;
    
    //var query_insert = "INSERT INTO vendedores(codigo,nome,endereco,municipio,bairro,uf,telefone,celular,email,idtabelapreco,nuultimopedido,precoliberado,descminmax,descavista,nudiasdescavista,permiteusargordura,reiniciadados) VALUES "
    var query_insert = "";

    //Percorre os clientes para salvar
    for (i in req.body) {
        vendedor = req.body[i];
        //console.log("vendedor: ", vendedor);
        //console.log("vendedor.codigo: ", vendedor.codigo);
        query_insert += "INSERT INTO vendedores(codigo,nome,endereco,municipio,bairro,uf,telefone,celular,email,idtabelapreco,nuultimopedido,precoliberado,descminmax,descavista,nudiasdescavista,permiteusargordura,reiniciadados) VALUES ("
                        + (vendedor.codigo == undefined || vendedor.codigo.toString().localeCompare('') == 0 ? null : vendedor.codigo.toString())
                        +","+ (vendedor.nome == undefined || vendedor.nome.localeCompare('') == 0 ? null : "'"+vendedor.nome+"'")
                        +","+ (vendedor.endereco == undefined || vendedor.endereco.localeCompare('') == 0 ? null : "'"+vendedor.endereco+"'")
                        +","+ (vendedor.municipio == undefined || vendedor.municipio.localeCompare('') == 0 ? null : "'"+vendedor.municipio+"'")
                        +","+ (vendedor.bairro == undefined || vendedor.bairro.localeCompare('') == 0 ? null : "'"+vendedor.bairro+"'")
                        +","+ (vendedor.uf == undefined || vendedor.uf.localeCompare('') == 0 ? null : "'"+vendedor.uf+"'")
                        +","+ (vendedor.telefone == undefined || vendedor.telefone.localeCompare('') == 0 ? null : "'"+vendedor.telefone+"'")
                        +","+ (vendedor.celular == undefined || vendedor.celular.localeCompare('') == 0 ? null : "'"+vendedor.celular+"'")
                        +","+ (vendedor.email == undefined || vendedor.email.localeCompare('') == 0 ? null : "'"+vendedor.email+"'")
                        +","+ (vendedor.idtabelapreco == undefined || vendedor.idtabelapreco.toString().localeCompare('') == 0 ? null : vendedor.idtabelapreco.toString()) //campo integer
                        +","+ (vendedor.nuultimopedido == undefined || vendedor.nuultimopedido.toString().localeCompare('') == 0 ? null : vendedor.nuultimopedido.toString()) //campo integer
                        +","+ (vendedor.precoliberado == undefined || vendedor.precoliberado.localeCompare('') == 0 ? null : "'"+vendedor.precoliberado+"'")
                        +","+ (vendedor.descminmax == undefined || vendedor.descminmax.localeCompare('') == 0 ? null : "'"+vendedor.descminmax+"'")
                        +","+ (vendedor.descavista == undefined || vendedor.descavista.toString().localeCompare('') == 0 ? null : vendedor.descavista.toString().split(',')[0])  //campo integer
                        +","+ (vendedor.nudiasdescavista == undefined || vendedor.nudiasdescavista.toString().localeCompare('') == 0 ? null : vendedor.nudiasdescavista.toString())
                        +","+ (vendedor.permiteusargordura == undefined || vendedor.permiteusargordura.localeCompare('') == 0 ? null : "'"+vendedor.permiteusargordura+"'")
                        //+","+ (vendedor.senha == undefined || vendedor.senha.localeCompare('') == 0 ? null : "'"+vendedor.senha+"'")
                        +","+ (vendedor.reiniciadados == undefined || vendedor.reiniciadados.localeCompare('') == 0 ? null : "'"+vendedor.reiniciadados+"'")
                        +") ON CONFLICT ON CONSTRAINT vendedores_pkey DO UPDATE SET "
                        +(vendedor.codigo == undefined || vendedor.codigo.toString().localeCompare('') == 0 || vendedor.codigo.toString().localeCompare(' ') == 0 ? '' : ("codigo = " +vendedor.codigo.toString()+",") )
                        +(vendedor.nome == undefined || vendedor.nome.localeCompare('') == 0 || vendedor.nome.localeCompare(' ') == 0 ? '' : ("nome = " +"'"+vendedor.nome+"'"+",") )
                        +(vendedor.endereco == undefined || vendedor.endereco.localeCompare('') == 0 || vendedor.endereco.localeCompare(' ') == 0 ? '' : ("endereco = " +"'"+vendedor.endereco+"'"+",") )
                        +(vendedor.municipio == undefined || vendedor.municipio.localeCompare('') == 0 || vendedor.municipio.localeCompare(' ') == 0 ? '' : ("municipio = " +"'"+vendedor.municipio+"'"+",") )
                        +(vendedor.bairro == undefined || vendedor.bairro.localeCompare('') == 0 || vendedor.bairro.localeCompare(' ') == 0 ? '' : ("bairro = " +"'"+vendedor.bairro+"'"+",") )
                        +(vendedor.uf == undefined || vendedor.uf.localeCompare('') == 0 || vendedor.uf.localeCompare(' ') == 0 ? '' : ("uf = " +"'"+vendedor.uf+"'"+",") )
                        +(vendedor.telefone == undefined || vendedor.telefone.localeCompare('') == 0 || vendedor.telefone.localeCompare(' ') == 0 ? '' : ("telefone = " +"'"+vendedor.telefone+"'"+",") )
                        +(vendedor.celular == undefined || vendedor.celular.localeCompare('') == 0 || vendedor.celular.localeCompare(' ') == 0 ? '' : ("celular = " +"'"+vendedor.celular+"'"+",") )
                        +(vendedor.email == undefined || vendedor.email.localeCompare('') == 0 || vendedor.email.localeCompare(' ') == 0 ? '' : ("email = " +"'"+vendedor.email+"'"+",") )
                        +(vendedor.idtabelapreco == undefined || vendedor.idtabelapreco.toString().localeCompare('') == 0 || vendedor.idtabelapreco.toString().localeCompare(' ') == 0 ? '' : ("idtabelapreco = " +vendedor.idtabelapreco.toString()+",") )
                        +(vendedor.nuultimopedido == undefined || vendedor.nuultimopedido.toString().localeCompare('') == 0 || vendedor.nuultimopedido.toString().localeCompare(' ') == 0 ? '' : ("nuultimopedido = " +vendedor.nuultimopedido.toString()+",") )
                        +(vendedor.precoliberado == undefined || vendedor.precoliberado.localeCompare('') == 0 || vendedor.precoliberado.localeCompare(' ') == 0 ? '' : ("precoliberado = " +"'"+vendedor.precoliberado+"'"+",") )
                        +(vendedor.descminmax == undefined || vendedor.descminmax.localeCompare('') == 0 || vendedor.descminmax.localeCompare(' ') == 0 ? '' : ("descminmax = " +"'"+vendedor.descminmax+"'"+",") )
                        +(vendedor.descavista == undefined || vendedor.descavista.toString().localeCompare('') == 0 || vendedor.descavista.toString().localeCompare(' ') == 0 ? '' : ("descavista = " +vendedor.descavista.toString().split(',')[0]+",") )
                        +(vendedor.nudiasdescavista == undefined || vendedor.nudiasdescavista.toString().localeCompare('') == 0 || vendedor.nudiasdescavista.toString().localeCompare(' ') == 0 ? '' : ("nudiasdescavista = " +vendedor.nudiasdescavista.toString()+",") )
                        +(vendedor.permiteusargordura == undefined || vendedor.permiteusargordura.localeCompare('') == 0 || vendedor.permiteusargordura.localeCompare(' ') == 0 ? '' : ("permiteusargordura = " +"'"+vendedor.permiteusargordura+"'"+",") )
                        //+(vendedor.senha == undefined || vendedor.senha.localeCompare('') == 0 || vendedor.senha.localeCompare(' ') == 0 ? '' : ("senha = " +"'"+vendedor.senha+"'"+",") )
                        +(vendedor.reiniciadados == undefined || vendedor.reiniciadados.localeCompare('') == 0 || vendedor.reiniciadados.localeCompare(' ') == 0 ? '' : ("reiniciadados = " +"'"+vendedor.reiniciadados+"'"+",") )
                        
                        query_insert = query_insert.substring(0, query_insert.length-1)+";";
    }

    //query_insert = query_insert.substring(0, query_insert.length-2)+";"; 

    db.none(query_insert)
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Inserted all vendedores'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_sellers: 'Erro: '+err,
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function deletarVendedores(req, res, next) {
    db.any('delete from vendedores')
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Deleted ALL vendedores'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_sellers: 'Houve algum problema.',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function deletarVendedorPorCodigo(req, res, next) {
    var codigo = parseInt(req.body.codigo);
    db.any('delete from vendedores where codigo = $1', codigo)
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Deleted ONE vendedor'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_sellers: 'Id inexistente ou houve algum problema.',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function atualizarVendedor(req, res, next){
	const param = req.body;

    if(param.codigo == undefined || param.codigo == ''){
        return res.status(400).json({error: '(codigo) obrigatorio no corpo da requisicao'});
    }
	
    db.any("update vendedores set nuultimopedido = "+param.nuultimopedido+" where codigo = "+param.codigo+
        " and "+param.nuultimopedido+" > (select nuultimopedido from vendedores where codigo = "+param.codigo+")")
		.then(data =>  {
	        // success
	        // data = as returned from the task's callback
			//console.log("Pedido rejeitado com sucesso");

			return res.status(200)
				.json({
					status: 'success',
					data_pedidos: data,
					message: 'Vendedor atualizado com sucesso'
				});

		}).catch(error => {
			console.log("Ocorreu um erro ao atualizar o Vendedor  \n", error);
		
			return res.status(500)
			.json({
				status: 'Warning',
				data_pedidos: 'Houve algum problema',
				message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador'
			});
            
	    });
	
}

module.exports = {
    recuperarVendedores: recuperarVendedores,
    recuperarVendedorPorCodigo: recuperarVendedorPorCodigo,
    recuperarVendedorPorNome: recuperarVendedorPorNome,
    recuperarVendedorPorNomeCodigo: recuperarVendedorPorNomeCodigo,
    recuperarVendedorPorCdSupervisor: recuperarVendedorPorCdSupervisor,
    inserirVendedores: inserirVendedores,
    atualizarVendedor:atualizarVendedor,
    deletarVendedores: deletarVendedores,
    deletarVendedorPorCodigo: deletarVendedorPorCodigo
};
