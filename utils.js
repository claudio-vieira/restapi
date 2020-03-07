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

module.exports = {
    convertDataDDMMYYYY:convertDataDDMMYYYY,
    convertDataDDMMYYYYSplitBar:convertDataDDMMYYYYSplitBar
};