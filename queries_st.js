var db = require('./conexao').getDb();
var utils = require('./utils');

function recuperarST(req, res, next) {
    db.any('select * from substituicao_tributaria')
        .then(function (data) {
            data.forEach(function(value) {
                var items = Object.keys(value);
            });  
            res.status(200)
                .json({
                    status: 'success',
                    data_st: data,
                    message: 'Retrieved ALL ST'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_st: 'Não existem ST cadastrados ou houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function recuperarStPorVendedor(req, res, next) {
    var cdvendedor = parseInt(req.body.cdvendedor);

    db.any('SELECT * FROM substituicao_tributaria WHERE cdvendedor = $1', cdvendedor)
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
                    data_st: data,
                    message: 'Retrieved ONE ST'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_notafiscal: 'Não existe o ST ou houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

function inserirSt(req, res, next) {
    var st;
    var query_insert = "INSERT INTO substituicao_tributaria(cdvendedor,idfilial,uf,portecliente,cdproduto,icmsinterestadual,icmsestadual,"
                        +"margemst,percreducaobasest,percreducaoaliquotast,valorpauta) VALUES ";

    //Percorre os titulos para salvar
    for (i in req.body) {
        st = req.body[i];

        query_insert +=  
                        "("+(st.cdvendedor.localeCompare('') == 0 ? null : st.cdvendedor)
                        +","+(st.idfilial.localeCompare('') == 0 ? null : st.idfilial)
                        +","+(st.uf.localeCompare('') == 0 ? null : st.uf)
                        +","+(st.portecliente.localeCompare('') == 0 ? null : st.portecliente)
                        +","+(st.cdproduto.localeCompare('') == 0 ? null : st.cdproduto)
                        +","+(st.icmsinterestadual.localeCompare('') == 0 ? null : "'"+st.icmsinterestadual+"'")
                        +","+(st.icmsestadual.localeCompare('') == 0 ? null : st.icmsestadual)
                        +","+(st.margemst.localeCompare('') == 0 ? null : st.margemst)
                        +","+(st.percreducaobasest.localeCompare('') == 0 ? null : st.percreducaobasest)
                        +","+(st.percreducaoaliquotast.localeCompare('') == 0 ? null : st.percreducaoaliquotast)
                        +","+(st.valorpauta.localeCompare('') == 0 ? null : "'"+st.valorpauta+"'")
                        +"), ";
        if(error > 0){
            break;
        }
    }

    if(error > 0){
        res.status(400)
            .json({
                status: 'Warning',
                data_st: errorMsg,
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
                        message: 'Inserted all sts'
                    });
            })
        .catch(function (err) {
            //return next(err);
            res.status(400)
                .json({
                    status: 'Warning',
                    data_st: 'Erro: '+err,
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
        });
    }
}


function deletarSt(req, res, next) {
    db.any('DELETE FROM substituicao_tributaria')
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Deleted ALL substituicao_tributaria'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_st: 'Houve algum problema.',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

module.exports = {
    recuperarST: recuperarST,
    inserirSt: inserirSt,
    deletarSt: deletarSt,
	recuperarStPorVendedor : recuperarStPorVendedor
};