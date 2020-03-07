var db = require('./conexao').getDb();
var utils = require('./utils');

function recuperarVolumes(req, res, next) {
    db.any('select * from volumes')
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
                    data_volumes: data,
                    message: 'Retrieved ALL volumes'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_volumes: 'Houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function recuperarVolumePorVendedor(req, res, next) {
    var cdvendedor = parseInt(req.body.cdvendedor);
    db.any('SELECT * FROM volumes WHERE cdvendedor = $1', cdvendedor)
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
                    data_volumes: data,
                    message: 'Retrieved ONE volume'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_volumes: 'Não existe o volume ou houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function recuperarVolumePorCodigoEVendedor(req, res, next) {
    var codigo = parseInt(req.body.cdgrupovolume);
    db.one('SELECT * FROM volumes WHERE cdgrupovolume = $1', codigo)
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
                    data_volumes: data,
                    message: 'Retrieved ONE volume'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_volumes: 'Não existe o volume ou houve algum problema',
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

function personalSplit(val){
    var newVal = val.split(',')[0];
    if(newVal==''){
        newVal = 0;
    }
    return newVal;
}

function inserirVolumes(req, res, next) {
    var volume;
    var error = 0;

    var vendedor = retornaTabelaParaValidacao('vendedores');   
    vendedor.then(resVendedor => {

        var query_insert = "INSERT INTO volumes (cdvendedor,idtipotabela,cdgrupovolume,situacao,qtde1,percent1,"
                                                +"qtde2,percent2,qtde3,percent3,qtde4,percent4,qtde5,percent5,descricao) VALUES ";

        //Percorre os volumes para salvar
        for (i in req.body) {
            volume = req.body[i];

            /*for(var a=0; a < resVendedor.length; a++){
                if(volume.cdvendedor.localeCompare(resVendedor[a].codigo, undefined, {numeric: true}) == 0){
                    query_insert += "("+ (volume.cdvendedor.localeCompare('') == 0 ? null : volume.cdvendedor);
                    error -= a;
                    break;
                }else{ 
                    if(error <= 0)
                        errorMsg = "Vendedor '" + volume.cdvendedor + "' não cadastrado.";
                    error += 1;
                } 
            }*/

            query_insert +=  "("+ (volume.cdvendedor.localeCompare('') == 0 ? null : volume.cdvendedor)
                            +","+ (volume.idtipotabela.localeCompare('') == 0 ? null : volume.idtipotabela)
                            +","+ (volume.cdgrupovolume.localeCompare('') == 0 ? null : volume.cdgrupovolume)
                            +","+ (volume.situacao.localeCompare('') == 0 ? null : "'"+volume.situacao+"'")
                            +","+ (volume.qtde1.localeCompare('') == 0 ? null : personalSplit(volume.qtde1))
                            +","+ (volume.percent1.localeCompare('') == 0 ? null : personalSplit(volume.percent1))
                            +","+ (volume.qtde2.localeCompare('') == 0 ? null : personalSplit(volume.qtde2))
                            +","+ (volume.percent2.localeCompare('') == 0 ? null :personalSplit( volume.percent2))
                            +","+ (volume.qtde3.localeCompare('') == 0 ? null : personalSplit(volume.qtde3))
                            +","+ (volume.percent3.localeCompare('') == 0 ? null : personalSplit(volume.percent3))
                            +","+ (volume.qtde4.localeCompare('') == 0 ? null : personalSplit(volume.qtde4))
                            +","+ (volume.percent4.localeCompare('') == 0 ? null : personalSplit(volume.percent4))
                            +","+ (volume.qtde5.localeCompare('') == 0 ? null : personalSplit(volume.qtde5))
                            +","+ (volume.percent5.localeCompare('') == 0 ? null : personalSplit(volume.percent5))
                            +","+ (volume.descricao.localeCompare('') == 0 ? null : "'"+volume.descricao+"'")
                            +"), ";
            if(error > 0){
                break;
            }
        }

        if(error > 0){
            res.status(400)
                .json({
                    status: 'Warning',
                    data_volumes: errorMsg,
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
                            message: 'Inserted all volumes'
                        });
                })
            .catch(function (err) {
                //return next(err);
                res.status(400)
                    .json({
                        status: 'Warning',
                        data_volumes: 'Erro: '+err,
                        message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                    });
            });
        }
    }); 
}

function deletarVolumes(req, res, next) {
    db.any('DELETE FROM volumes')
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Deleted ALL volumes'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_volumes: 'Houve algum problema.',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function deletarVolumePorCodigo(req, res, next) {
    var codigo = parseInt(req.body.cdgrupovolume);
    db.any('DELETE FROM volumes WHERE cdgrupovolume = $1', codigo)
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Deleted ONE volume'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_volumes: 'Id inexistente ou houve algum problema.',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

module.exports = {
    recuperarVolumes: recuperarVolumes,
    recuperarVolumePorVendedor: recuperarVolumePorVendedor,
    recuperarVolumePorCodigoEVendedor: recuperarVolumePorCodigoEVendedor,
    inserirVolumes: inserirVolumes,
    deletarVolumePorCodigo: deletarVolumePorCodigo,
    deletarVolumes: deletarVolumes
};