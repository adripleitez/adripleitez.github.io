import { saveAs } from "file-saver";
import {message} from 'antd';

const convertJSONToTxt = (fileinfo, delimeter) => {
    let json = {};
    try {
        json = JSON.parse(fileinfo);
    } catch (error) {
        message.error("El texto leido no es un JSON");
        return;
    }
    var str = ""
    for (let key in json) {
        str += json[key].documento + delimeter
            + json[key]['primer-nombre'] + delimeter
            + json[key].apellido + delimeter
            + json[key]['credit-card'] + delimeter
            + json[key].tipo + delimeter
            + json[key].telefono + delimeter
    }
    const txt = str.slice(0, - 1)
    var file = new File([txt], "json-converted.txt", { type: "text/plain" });
    saveAs(file);
}

const convertXMLToTxT = (xml, delimeter) => {
    var parser, xmlDoc;

    parser = new DOMParser();
    xmlDoc = parser.parseFromString(xml, "text/xml");

    let size = xmlDoc.getElementsByTagName("cliente").length;
    let xml2text = '';
    for (let i = 0; i < size; i++) {
        xml2text += xmlDoc.getElementsByTagName("documento")[i].childNodes[0].nodeValue + delimeter +
            xmlDoc.getElementsByTagName("primer-nombre")[i].childNodes[0].nodeValue + delimeter +
            xmlDoc.getElementsByTagName("apellido")[i].childNodes[0].nodeValue + delimeter +
            xmlDoc.getElementsByTagName("credit-card")[i].childNodes[0].nodeValue + delimeter +
            xmlDoc.getElementsByTagName("tipo")[i].childNodes[0].nodeValue + delimeter +
            xmlDoc.getElementsByTagName("telefono")[i].childNodes[0].nodeValue;
        if(i !== (size - 1)){
            xml2text += `${delimeter}\n`;
        }
    }

    var file = new File([xml2text], "xml-converted.txt", { type: "text/plain" });
    saveAs(file);
}

export { convertJSONToTxt, convertXMLToTxT }