var db = require('./conexao').getDb();
var utils = require('./utils');

function recuperarProdutos(req, res, next) {
    db.any('select * from produtos')
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
                    data_produtos: data,
                    message: 'Retrieved ALL produtos'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_produtos: 'Houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function recuperarProdutoPorCodigo(req, res, next) {
    var codigo = parseInt(req.body.codigo);
    db.one('SELECT * FROM produtos WHERE codigo = $1', codigo)
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
                    data_produtos: data,
                    message: 'Retrieved ONE produto'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_produtos: 'Não existe o produto ou houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function personalSplit(val){
    var newVal = val.split(',')[0];
    if(newVal==''){
        console.log("trocou o 0.");
        newVal = 0;
    }
    return newVal;
}

function inserirProdutos(req, res, next) {
    var produto;
    var query_insert = "INSERT INTO produtos (codigo,descricao,unidade,estoque,cdgrupo,cdsubgrupo,link,"
                        +"ncm,ean13,dun14,pallet,altura,largura,profundidade,situacao,pesoliquido,"
                        +"pesobruto,especie,grupocondec,gruporecdesc,qtdembalagem,cdgrupovolume) VALUES ";



    //Percorre os produtos para salvar
    for (i in req.body) {
        produto = req.body[i];

        query_insert += "("+ (produto.codigo.localeCompare('') == 0 ? null : produto.codigo)
                        +","+ (produto.descricao.localeCompare('') == 0 ? null : "'"+produto.descricao+"'")
                        +","+ (produto.unidade.localeCompare('') == 0 ? null : "'"+produto.unidade+"'")
                        +","+ (produto.estoque.localeCompare('') == 0 ? null : produto.estoque)
                        +","+ (produto.cdgrupo.localeCompare('') == 0 ? null : produto.cdgrupo)
                        +","+ (produto.cdsubgrupo.localeCompare('') == 0 ? null : produto.cdsubgrupo)
                        +","+ (produto.link.localeCompare('') == 0 ? null : "'"+produto.link+"'")
                        +","+ (produto.ncm.localeCompare('') == 0 ? null : "'"+produto.ncm+"'")
                        +","+ (produto.ean13.localeCompare('') == 0 ? null : "'"+produto.ean13+"'")
                        +","+ (produto.dun14.localeCompare('') == 0 ? null : "'"+produto.dun14+"'")
                        +","+ (produto.pallet.localeCompare('') == 0 ? null : produto.pallet)
                        +","+ (produto.altura.localeCompare('') == 0 ? null : produto.altura.replace(/,/, '.'))
                        +","+ (produto.largura.localeCompare('') == 0 ? null : produto.largura.replace(/,/, '.'))
                        +","+ (produto.profundidade.localeCompare('') == 0 ? null : produto.profundidade.replace(/,/, '.'))
                        +","+ (produto.situacao.localeCompare('') == 0 ? null : produto.situacao)
                        +","+ (produto.pesoliquido.localeCompare('') == 0 ? null : produto.pesoliquido.replace(/,/, '.'))
                        +","+ (produto.pesobruto.localeCompare('') == 0 ? null : produto.pesobruto.replace(/,/, '.'))
                        +","+ (produto.especie.localeCompare('') == 0 ? null : produto.especie)
                        +","+ (produto.grupocondec.localeCompare('') == 0 ? null : produto.grupocondec)
                        +","+ (produto.gruporecdesc.localeCompare('') == 0 ? null : produto.gruporecdesc)
                        +","+ (produto.qtdembalagem.localeCompare('') == 0 ? null : produto.qtdembalagem)
                        +","+ (produto.cdgrupovolume.localeCompare('') == 0 ? null : produto.cdgrupovolume)
                        +"), ";
    }
    query_insert = query_insert.substring(0, query_insert.length-2)+";";
    //console.log("query: " + query_insert);

    db.none(query_insert)
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Inserted all produtos'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_produtos: 'Erro: '+err,
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function deletarProdutos(req, res, next) {
    db.any('DELETE FROM produtos')
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Deleted ALL produtos'
                });
        })
    .catch(function (err) {
        return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_produtos: 'Houve algum problema.',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function deletarProdutoPorCodigo(req, res, next) {
    var codigo = parseInt(req.body.codigo);
    db.any('DELETE FROM produtos WHERE codigo = $1', codigo)
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Deleted ONE produto'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_produtos: 'Id inexistente ou houve algum problema.',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

module.exports = {
    recuperarProdutos: recuperarProdutos,
    recuperarProdutoPorCodigo: recuperarProdutoPorCodigo,
    inserirProdutos: inserirProdutos,
    deletarProdutoPorCodigo: deletarProdutoPorCodigo,
    deletarProdutos: deletarProdutos
};