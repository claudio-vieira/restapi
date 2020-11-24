var db = require('./conexao').getDb();
var utils = require('./utils');

function recuperarSaldoGorduraSupPorVendedor(req, res, next) {
    var cdvendedor = parseInt(req.body.cdvendedor);

    db.any("SELECT * FROM saldo_gordura_sup "+
            "INNER JOIN supervisionados on supervisionados.cdsupervisor = saldo_gordura_sup.cdsupervisor "+ 
            "WHERE supervisionados.cdvendedor = "+cdvendedor)
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
                    data_gorduras_sup: data,
                    message: 'Retrieved ONE saldo gordura sup'
                });
        })
    .catch(function (err) {
        //return next(err);
        res.status(400)
                .json({
                    status: 'Warning',
                    data_gorduras_sup: 'Não existe o pedido ou houve algum problema',
                    message: 'Verifique a sintaxe do Json, persistindo o erro favor contactar o administrador.'
                });
    });
}

module.exports = {
    recuperarSaldoGorduraSupPorVendedor: recuperarSaldoGorduraSupPorVendedor,
};