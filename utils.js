'use strict';
const getCSVField = (cell) => {
    return cell ? cell.replace(/"/g,'""') : '';
}

const json2csv= (data, fields) => {
    let csv = fields.join() + '\n';
    csv += data.map((item)=>{
        let csvString = '"';
        for (let i=0;i<(fields.length-1);i++){
            csvString +=  getCSVField(item[fields[i]]) +'","';
        }
        csvString += getCSVField(item[fields[fields.length-1]]) +'"';
        return csvString;
    }).join('\n');

    return csv;
}

exports.json2csv = json2csv;
