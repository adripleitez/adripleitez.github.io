import "antd/dist/antd.css";
import { Component } from 'react';
import { Form } from 'reactstrap';
import { ciphervigenere, decipheredvigenere } from './js/vigenere';
import { convertJSONToTxt, convertXMLToTxT } from './js/functions';
import { generateToken, verifyToken } from './js/jsonwebtoken'
import { Alert, Button, Input, Upload, message, Row, Col } from 'antd';
import { UploadOutlined} from '@ant-design/icons';
import { saveAs } from "file-saver";

const { Dragger } = Upload;
const initState = {
    key: "",
    ciphed: [],
    txt: "",
    infoFile: "",
    myfile: null,
    infoGenerated: "",
    jwt: {},
    delimeter: ";",
    flag: false,
    jwtRes: "",
    error: "ERROR",
}

const props = {
    name: 'file',
    accept: '.txt, .json, .xml',
    multiple: false,
    action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76'
};

class App extends Component {
    constructor(props) {
        super(props);
        this.state = ({ ...initState })
    }

    changeHandler = e => {
        this.setState({[e.target.id]: e.target.value})
    }

    uploadingFile = content => {
        const { status } = content.file;

        if (status === 'done') {
            const reader = new FileReader()
            reader.onload = async (content) => {
                const text = (content.target.result)
                this.state.infoFile = text
            };
            reader.readAsText(content.file.originFileObj)
            message.success(`${content.file.name} archivo subido exitosamente.`);
        } else if (status === 'error') {
            message.error(`${content.file.name} error de subida.`);
        }
    }

    convertTXTtoXML = (txt) => {
        if(txt===""){ this.setState({error:"El archivo está vacío", flag2:true}); return}

        let xml = '    <cliente>\n'
        let i = 0;
        let categories = ["<documento>", "</documento>", "<primer-nombre>", "</primer-nombre>", "<apellido>", "</apellido>", "<credit-card>", "</credit-card>", "<tipo>", "</tipo>", "<telefono>", "</telefono>"];
        
        //To read multiple objects
        let readed = txt.split(this.state.delimeter);
        let size = parseInt(readed.length / (categories.length/2));
        if(size > 0){
            for (let j = 0; j < size; j++) {
                categories = [...categories, ...categories];
            }
        }
        readed.forEach((param, k) => {
            if (categories[i]  === "<credit-card>") {
                //VIGENERE
                if (this.state.key === "") xml += '        ' + categories[i] + param.trim() + categories[i + 1] + '\n'
                else {
                    const creditCardChiped = ciphervigenere(param, this.state.key)
                    this.state.ciphed.push(creditCardChiped)
                    xml += '        ' + categories[i] + creditCardChiped + categories[i + 1] + '\n'
                }
            } else if (k === (readed.length - 1)){
                if (param.trim() !== '')
                    xml += '        ' + categories[i] + param.trim() + categories[i + 1] + '\n'
            } else if ((k + 1) % 6 === 0){
                xml += '        ' + categories[i] + param.trim() + categories[i + 1] + '\n    </cliente>\n    <cliente>\n'
            } else {
                xml += '        ' + categories[i] + param.trim() + categories[i + 1] + '\n'
            }
            i += 2
        })
        const final = '<clientes>\n' + xml + '    </cliente>\n</clientes>';
        this.setState({
            xml: final,
            infoGenerated: final
        })
    }

    convertTXTtoJSON = (txt) => {
        if(txt===""){ this.setState({error:"El archivo está vacío", flag2:true}); return}
        let arr = [];
        let json = {};
        let categories = ["documento", "primer-nombre", "apellido", "credit-card", "tipo", "telefono"];
        let readed = txt.split(this.state.delimeter);
        let size = parseInt(readed.length / categories.length);
        if(size > 0){
            for (let j = 0; j < size; j++) {
                categories = [...categories, ...categories];
            }
        }

        readed.forEach((param, i) => {
            if(categories[i] === 'documento')
                json = {};

            if (i === (readed.length - 1)){
                if (param.trim() !== '')
                    json[categories[i]] = param.trim();
            }else{
                json[categories[i]] = param.trim();
            }

            if(categories[i] === 'telefono' || (i === (readed.length - 1) && param.trim() !== ''))
                arr.push(json);
        })
        this.setState({ json: arr, infoGenerated: JSON.stringify(arr) })

        if (this.state.key !== "") {
            generateToken(json, this.state.key).then(jwt => {
                localStorage.setItem('jwtSesion', jwt);
                this.setState({ jwt })
            })
        } else { this.setState({ alert: true }) }
    }

    submitHandler = (e, target) => {
        e.preventDefault()
        var filetodownload;
        if (target === "descargarXml") {
            var newxml = this.state.xml
            for(let i=0; i < this.state.ciphed.length ; i++ ){
                newxml = newxml.replace(this.state.ciphed[i], decipheredvigenere(this.state.ciphed[i],this.state.key).trim())
            }

            filetodownload = new File([newxml], "xml-file-downloaded.xml", { type: "application/xml" });
        } else if (target === "descargarJson") {
            filetodownload = new File([JSON.stringify(this.state.json)], "json-file-downloaded.json", { type: "application/json" });
        }
        saveAs(filetodownload);
    }

    decipheredHandler = e => {
        e.preventDefault()
        const deciphered = []

        this.state.ciphed.forEach((c) => {
            deciphered.push(decipheredvigenere(c,this.state.key))
        })

        this.setState({
            displayCifrado: deciphered
        })
    }

    jwtValidation = e => {
        e.preventDefault()
        if (localStorage.getItem("jwtSesion")) {
            this.setState({ jwt: localStorage.getItem("jwtSesion") })
        }
        verifyToken(this.state.jwt.toString(), this.state.key).then((respuesta) => {
            if (respuesta.json != null) {
                this.setState({
                    jwtRes: respuesta.json,
                    flag: true
                })
            } else {
                this.setState({
                    flag2: true
                })
            }
        })
    }

    render() {

        return (

            <div className="App">
                {this.state.flag && <Alert
                    message="Jason web token validado exitosamente"
                    description={JSON.stringify(this.state.jwtRes)}
                    type="success"
                    showIcon
                    closable
                />}
                {this.state.flag2 && <Alert
                    message="Ha ocurrido un error"
                    description={this.state.error}
                    type="error"
                    showIcon
                    closable
                />}
                <header className="App-header">
                    <Dragger {...props} onChange={(content) => this.uploadingFile(content)} >
                        <p className="ant-upload-drag-icon">
                            <UploadOutlined />
                        </p>
                        <p className="ant-upload-text">Haz click aquí para depositar tu archivo</p>
                        <p className="ant-upload-hint">Solo se permiten archivos .txt .xml o .json</p>
                    </Dragger>
                    <Form className="form">
                        <div className="row">
                            <div className="col">
                                <p className="p-text">Delimitador:</p>
                                <Input maxLength={1} id="delimeter" placeholder="delimeter" onChange={this.changeHandler} value={this.state.delimeter} />
                            </div>
                            <div className="col">
                                <p className="p-text">Llave de cifrado:</p>
                                <Input id="key" placeholder="llave de cifrado" onChange={this.changeHandler} value={this.state.key.toLowerCase()} />
                            </div>
                        </div>
                        <Row justify="center" gutter={30}>
                            <Col className="gutter-row">
                                <Button type="primary" className="btn" id="generateXml" onClick={() => this.convertTXTtoXML(this.state.infoFile)} >General XML</Button>
                            </Col>
                            <Col className="gutter-row">
                                <Button type="primary" className="btn" id="descargarXml" onClick={(e) => this.submitHandler(e, "descargarXml")} >Descargar XML </Button>
                            </Col>
                        </Row>
                        <Row justify="center" gutter={30}>
                            <Col className="gutter-row">
                                <Button type="primary" className="btn" id="generateJson" onClick={() => this.convertTXTtoJSON(this.state.infoFile)}>Generar JSON</Button>
                            </Col>
                            <Col className="gutter-row">
                                <Button type="primary" className="btn" id="descargarJson" onClick={(e) => this.submitHandler(e, "descargarJson")} >Descargar JSON</Button>
                            </Col>
                        </Row>
                        <Row justify="center" gutter={30}>
                            <Col className="gutter-row">
                                <Button type="primary" className="btn" onClick={() => convertJSONToTxt(this.state.infoFile, this.state.delimeter)}>Convertir JSON A TXT</Button>
                            </Col>
                            <Col className="gutter-row">
                                <Button type="primary" className="btn" onClick={() => convertXMLToTxT(this.state.infoFile, this.state.delimeter)}>Convertir XML A TXT</Button>
                            </Col>
                        </Row>
                        <Row justify="center" gutter={30}>
                            <Col className="gutter-row">
                                <Button type="primary" className="btn btn-ciphed" onClick={this.decipheredHandler} >Decodificar Cifrado</Button>
                            </Col>
                            <Col className="gutter-row">
                                <Button type="primary" className="btn" onClick={this.jwtValidation} >Guardar JSON con JWT</Button>
                            </Col>
                        </Row>
                    </Form>
                </header>
                <div className="App-body">
                    <div className="container">
                        <h3>Contenido archivo de origen:</h3><br />
                        <div className="container-label"><label type="text">{this.state.infoFile}</label><br/></div>
                    </div>
                    <div className="container">
                        <h3>Contenido archivo generado:</h3><br />
                        <div className="container-label"><label type="text">{this.state.infoGenerated}</label><br/></div>
                    </div>
                    <div className="container">
                        <h3>Ver contenido cifrado:</h3><br />
                        <div className="container-label"><label type="text">{this.state.displayCifrado}</label><br/></div>
                    </div>
                </div>
                </div>
        )
    };
}

export default App;
