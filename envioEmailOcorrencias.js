var db = require('./conexao').getDb();
const cron = require("node-cron");
const { format } = require('path');
var nodemailer = require('nodemailer');
const { options } = require('./app');
var utils = require('./utils');

var TIPOOCORRENCIA = "API-EMAIL-OCORRENCIAS";

cron.schedule("*/60 * * * * *", function() { 
    console.log("running a task EMAIL OCORRENCIAS every minute");

    var sql = "select * from ocorrencias_ws where linha > 0 and statusemail like 'A ENVIAR' order by nomearquivo";

    db.task('envio-email-ocorrencias', async t => {
        
        const occurrences = await t.any(sql);

        var bodies = [];
        var body = "";
        var filename = "";
        if(occurrences.length > 0){
            for(const occurrence of occurrences){
                if(filename == occurrence.nomearquivo){
                    body += "Erro na linha "+occurrence.linha+" na tag "+occurrence.tag+", "+
                        "Favor verificar a sintaxe nesta linha e reenvia-la somente.\n";
                }else if(filename != occurrence.nomearquivo){
                    filename = occurrence.nomearquivo;
                    if(body == ""){
                        body = "Olá CPD!\n\n"+
                            "Problema(s) ao processar o arquivo "+occurrence.nomearquivo+".\n\n"+
                            "Erro na linha "+occurrence.linha+" na tag "+occurrence.tag+", "+
                            "Favor verificar a sintaxe nesta linha e reenvia-la somente.\n";
                    }else{
                        body += "\nCaso houver alguma alteração na estrutura favor contactar o administrador.";
                        bodies.push({nomearquivo: occurrence.nomearquivo, body: body});
                        body = "Olá CPD!\n\n"+
                            "Problema(s) ao processar o arquivo "+occurrence.nomearquivo+".\n\n"+
                            "Erro na linha "+occurrence.linha+" na tag "+occurrence.tag+", "+
                            "Favor verificar a sintaxe nesta linha e reenvia-la somente.\n";
                    }
                }
            }

            body += "\nCaso houver alguma alteração na estrutura favor contactar o administrador.";
            body += "\n\n\n\nEste é um envio automático e não deve ser respondido!";
            bodies.push({nomearquivo: filename, body: body});

            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'suporte.lianealimentos@gmail.com',
                    pass: 'suportelianesfa'
                }
            });

            for(const body of bodies){
                var mailOptions = {
                    from: 'suporte.lianealimentos@gmail.com',
                    to: "grupoliane@gmail.com",
                    //to: "claudio_vieira@ymail.com",
                    subject: 'Erro ao processar arquivo!',
                    text: body.body
                };

                var res = await transporter.sendMail(mailOptions);

                if(res.accepted.length >= 1 && res.rejected.length == 0){
                    //console.log('Email sent Cliente: ' + info.response);
                    var sql_update = "update ocorrencias_ws set statusemail = 'ENVIADO' "+
                                    " where nomearquivo like '"+body.nomearquivo+"' and statusemail like 'A ENVIAR'";
                                    
                    await t.any(sql_update).then(function (sucess) {
                        console.log("Ocorrencia setada como enviada, arquivo: "+body.nomearquivo);
                    }).catch(function (err) {
                        console.log("Problema setar como enviada ocorrencia arquivo: "+body.nomearquivo);
                        console.log("ERRO: "+err);
                    });
                }else{
                    var msg = "Problema envio de email da ocorrencia, arquivo: "+body.nomearquivo+". ";

                    if(res.rejected.length > 0){
                        msg += "Emails rejeitados: ";
                        for(var j=0; j < res.rejected.length; j++){
                            msg += res.rejected[j]+" ";
                        }
                    }else{
                        msg += res.response;                        
                    }
                    utils.registrarOcorrencias(msg, TIPOOCORRENCIA, "ENVIAR EMAIL OCORRENCIAS", "", 0, "ERROR", false, "", db, "");
                }
            }
        }       
    })
    .then(data => {
        // success
        // data = as returned from the task's callback
        //console.log("Sucesso no envio de email das ocorrencias "+data);
    })
    .catch(error => {
        // error
        console.log("Problema envio de email das ocorrencias "+error);
    });

});