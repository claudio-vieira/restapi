function convertDataDDMMYYYYSplitBar(data){
	var dataSplit = data.split('/');
	var newData = dataSplit[2] + "-" + dataSplit[1] + "-" + dataSplit[0];
	return newData;
}

function convertDataDDMMYYYY(data){
	var ano = data.substring(0, 4);
	var mes = data.substring(4, 6);
	var dia = data.substring(6, 8);
	var newData = ano + "-" + mes + "-" + dia;
	return newData;
}

/*
    Mensagem = Descricao ou mensagem da ocorrencia
    Tipo = CRON(C), A(API)
    Metodo = Nome do metodo onde ocorreu a ocorrencia
    Nomearquivo = Nome do arquivo que ocorreu a ocorrencia
    Linha = Numero da linha onde ocorreu o PROBLEMA(opcional)
    Data = Data da ocorrencia
    Situacao = S(sucess), W(warning), E(error)
*/
function registrarOcorrencias(mensagem, tipo, metodo, nomearquivo, linha, situacao, arquivoprocessado, tag, db, statusemail){

    let date_ob = new Date();
    // adjust 0 before single digit date
    let date = ("0" + date_ob.getDate()).slice(-2);
    // current month
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    // current year
    let year = date_ob.getFullYear();
    // current hours
    let hours = date_ob.getHours();
    // current minutes
    let minutes = date_ob.getMinutes();
    // current seconds
    let seconds = date_ob.getSeconds();

    dtocorrencia = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;

    mensagem = mensagem.replace(/'/g,"");

    var query_insert = "INSERT INTO ocorrencias_ws(mensagem,tipo,metodo,nomearquivo,linha,dtocorrencia,situacao,arquivoprocessado, tag, statusemail) VALUES "+
                "('"+mensagem+"','"+tipo+"','"+metodo+"','"+nomearquivo+"',"+linha+",'"+dtocorrencia+"','"+situacao+"',"+arquivoprocessado+",'"+tag+"','"+statusemail+"');";

    db.none(query_insert)
    .then(function () {
        console.log("Ocorrencia inserida");
    })
    .catch(function (err) {
        console.log("Erro insercao da ocorrencia: ",err);
    });
}

module.exports = {
    convertDataDDMMYYYY:convertDataDDMMYYYY,
	convertDataDDMMYYYYSplitBar:convertDataDDMMYYYYSplitBar,
	registrarOcorrencias: registrarOcorrencias
};