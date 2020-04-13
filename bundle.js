(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

},{"./templates":2}],2:[function(require,module,exports){
module.exports = {
    erc20XML: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
        "<!DOCTYPE token  []>\n" +
        "<ts:token xmlns:ts=\"http://tokenscript.org/2020/03/tokenscript\"\n" +
        "          xmlns:xhtml=\"http://www.w3.org/1999/xhtml\"\n" +
        "          xmlns:xml=\"http://www.w3.org/XML/1998/namespace\"\n" +
        "          xsi:schemaLocation=\"http://tokenscript.org/2020/03/tokenscript http://tokenscript.org/2020/03/tokenscript.xsd\"\n" +
        "          xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"\n" +
        "          custodian=\"false\"\n" +
        ">\n" +
        "    <ts:name>\n" +
        "        <ts:string xml:lang=\"en\"></ts:string>\n" +
        "    </ts:name>\n" +
        "    <ts:contract interface=\"erc20\" name=\"\">\n" +
        "        <ts:address network=\"1\"></ts:address>     <!--mainnet-->\n" +
        "    </ts:contract>\n" +
        "\n" +
        "    <ts:origins>\n" +
        "        <!-- Define the contract which holds the token that the user will use -->\n" +
        "        <ts:ethereum contract=\"\"> <!-- as above ts:contract name -->\n" +
        "        </ts:ethereum>\n" +
        "    </ts:origins>\n" +
        "\n" +
        "    <ts:cards>\n" +
        "    </ts:cards>\n" +
        "    <ts:attribute-types>\n" +
        "    </ts:attribute-types>\n" +
        "</ts:token>\n",

    erc721XML: "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>\n" +
        "<!DOCTYPE token  []>\n" +
        "<ts:token xmlns:ts=\"http://tokenscript.org/2020/03/tokenscript\"\n" +
        "          xmlns:xhtml=\"http://www.w3.org/1999/xhtml\"\n" +
        "          xmlns:xml=\"http://www.w3.org/XML/1998/namespace\"\n" +
        "          xsi:schemaLocation=\"http://tokenscript.org/2020/03/tokenscript http://tokenscript.org/2020/03/tokenscript.xsd\"\n" +
        "          xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"\n" +
        "          xmlns:asnx=\"urn:ietf:params:xml:ns:asnx\"\n" +
        "          xmlns:ethereum=\"urn:ethereum:constantinople\"\n" +
        "          custodian=\"false\"\n" +
        ">\n" +
        "    <ts:name>\n" +
        "        <ts:plurals xml:lang=\"en\">\n" +
        "            <ts:string quantity=\"one\"></ts:string>\n" +
        "        </ts:plurals>\n" +
        "    </ts:name>\n" +
        "    <ts:contract interface=\"erc721\" name=\"\">\n" +
        "        <ts:address network=\"1\"></ts:address>\n" +
        "    </ts:contract>\n" +
        "    <ts:origins>\n" +
        "        <!-- Define the contract which holds the token that the user will use -->\n" +
        "        <ts:ethereum contract=\"TimeToken\">\n" +
        "        </ts:ethereum>\n" +
        "    </ts:origins>\n" +
        "\n" +
        "    <ts:cards>\n" +
        "    </ts:cards>\n" +
        "\n" +
        "    <ts:attribute-types>\n" +
        "    </ts:attribute-types>\n" +
        "\n" +
        "</ts:token>\n",

    exampleABI: [
        {
            "inputs": [
                {
                    "internalType": "uint8",
                    "name": "_numProposals",
                    "type": "uint8"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "h1",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "no",
                    "type": "uint256"
                }
            ],
            "name": "test",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                }
            ],
            "name": "delegate",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "toVoter",
                    "type": "address"
                }
            ],
            "name": "giveRightToVote",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint8",
                    "name": "toProposal",
                    "type": "uint8"
                }
            ],
            "name": "vote",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "winningProposal",
            "outputs": [
                {
                    "internalType": "uint8",
                    "name": "_winningProposal",
                    "type": "uint8"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ]
};

},{}]},{},[1]);
