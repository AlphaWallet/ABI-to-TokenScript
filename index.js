document.addEventListener("DOMContentLoaded", () => {

    const Types = {
        FUNCTION: "function",
        TUPLE: "tuple",
        EVENT: "event"
    };

    const ERC = {
        ERC20: "erc20",
        ERC721: "erc721"
    };

    const templates = require("./templates");
    let domParser = new DOMParser();

    document.getElementById("create").addEventListener("click", function () {
        let contractName = document.getElementById("contractName").value;
        let contractAddress = document.getElementById("contractAddress").value;
        let ABI = JSON.parse(document.getElementById("contractABI").value);
        let erc20Checked = document.getElementById("erc20").checked;
        if(erc20Checked) {
            start(ERC.ERC20, ABI, contractAddress, contractName);
        } else {
            start(ERC.ERC721, ABI, contractAddress, contractName);
        }
    });


    function start(erc, abi, contractAddress, contractName) {
        let xmlFile;
        switch(erc) {
            case ERC.ERC20:
                xmlFile = domParser.parseFromString(templates.erc20XML, "application/xml");
                break;
            case ERC.ERC721:
                xmlFile = domParser.parseFromString(templates.erc721XML, "application/xml");
                break;
        }
        xmlFile = setContractDetails(xmlFile, contractName, contractAddress);
        setValuesFromABI(abi, xmlFile, contractAddress, contractName);
    }

    function setValuesFromABI(abi, xmlFile, contractAddress, contractName) {
        let attributesToAdd = [];
        let eventsToAdd = [];
        for(let func of abi) {
            switch(func.type) {
                case Types.FUNCTION:
                    let attribute = parseFunctionToAttribute(func, contractAddress);
                    if(attribute !== "") attributesToAdd.push(attribute);
                    break;
                case Types.EVENT:
                    let event = getEvent(func.name, contractName, contractAddress, func);
                    eventsToAdd.push(event);
                    break;
                case Types.TUPLE:
                    break;
            }
        }
        let updatedXML = appendToTS(attributesToAdd, eventsToAdd, xmlFile);
        let xmlAsString = new XMLSerializer().serializeToString(updatedXML).replace("xhtml:", "");
        download(contractName + "-TokenScript.xml", xmlAsString);
    }

    //TODO pass by ref rather than value
    function appendToTS(attributes, events, xmlFile) {
        let child = xmlFile.getElementsByTagName("ts:contract")[0];
        for(let attribute of attributes) {
            xmlFile.getElementsByTagName("ts:attribute-types")[0].appendChild(attribute);
        }
        for(let event of events) {
            xmlFile.getElementsByTagName("ts:token")[0].insertBefore(event, child);
        }
        return xmlFile;
    }

    //TODO set contract name for template approve function action
    function setContractDetails(xmlFile, contractName, contractAddress) {
        xmlFile.getElementsByTagName("ts:name")[0].getElementsByTagName("ts:string")[0].innerHTML = contractName;
        xmlFile.getElementsByTagName("ts:contract")[0].attributes.name.value = contractName;
        xmlFile.getElementsByTagName("ts:contract")[0].children[0].value = contractAddress;
        return xmlFile;
    }

    function getEventParams(eventAbi) {
        let eventParams = "";
        for(let eventInput of eventAbi.inputs) {
            eventParams += `<element name=${eventInput.name} ethereum:type=${eventInput.type} ethereum:indexed=${eventInput.indexed}/>\n`;
        }
        return eventParams;
    }

    function parseFunctionToAttribute(func, contractName) {
        if(func.stateMutability === "view" || func.stateMutability === "pure") {
            return getAttribute(func, contractName);
        } else {
            return "";
        }
    }

    function getAttribute(func, contractName) {
        let data = getData(func);
        let attributeTypeNode = document.createElement("ts:attribute-type");
        attributeTypeNode.setAttribute("id", func.name);
        attributeTypeNode.setAttribute("syntax", getSyntax(func.outputs));
        attributeTypeNode.innerHTML = `
            <ts:name>
                <ts:string xml:lang="en">${func.name}</ts:string>
            </ts:name>
            <ts:origins>
                <ts:ethereum function="${func.name}" contract="${contractName}" as="${getAS(func.outputs)}">
                    ${data}
                </ts:ethereum>
            </ts:origins>`;
        return attributeTypeNode;
    }

    function getEvent(eventName, contractName, contractAddress, eventABI) {
        let eventParams = getEventParams(eventABI);
        let eventTypeNode = document.createElement("ts:contract");
        eventTypeNode.setAttribute("name", contractName);
        eventTypeNode.innerHTML = `
                <ts:address network="1">${contractAddress}</ts:address>
                <asnx:module name="${eventName}">
                  <sequence>
                    ${eventParams}
                  </sequence>
                </asnx:module>`;
        return eventTypeNode;
    }

    function getData(func) {
        let data = "";
        let dataPrefix = "<ts:data>";
        let dataSuffix = "</ts:data>";
        for(let input of func.inputs) {
            data += `<ts:${input.type}></ts:${input.type}>`
        }
        return dataPrefix + data + dataSuffix;
    }

    function getAS(outputs) {
        if(outputs === []) {
            return "void";
        } else {
            return outputs[0].type;
        }
    }

    //This requires guess work...
    function getSyntax(outputs) {
        if(outputs === []) {
            return "void";
        } else if(outputs[0].type.includes("uint") || outputs[0].type.includes("int")) {
            return "1.3.6.1.4.1.1466.115.121.1.36";
        } else if(outputs[0].type.includes("string")) {
            return "1.3.6.1.4.1.1466.115.121.1.26";
        } else if(outputs[0].type.includes("byte")) {
            return "1.3.6.1.4.1.1466.115.121.1.6";
        } else {
            return "void";
        }
    }

    function download(filename, text) {
        let element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

});
