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
    const testABI = templates.exampleABI;

    let domParser = new DOMParser();

    document.getElementById("create").addEventListener("click", function () {
        let contractName = document.getElementById("contractName").value;
        let contractAddress = document.getElementById("contractAddress").value;
        //TODO change back
        let ABI = testABI; //document.getElementById("contractABI").value;
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
        setValuesFromABI(abi, xmlFile, contractAddress, contractName);
    }

    function setValuesFromABI(abi, xmlFile) {
        let attributesToAdd = [];
        let eventsToAdd = [];
        for(let func of abi) {
            switch(func.type) {
                case Types.FUNCTION:
                    attributesToAdd.push(parseFunctionToAttribute(func));
                    break;
                case Types.EVENT:
                    eventsToAdd.push(getEvent(func.name, contractName, contractAddress, func));
                    break;
                case Types.TUPLE:
                    break;
            }
        }
        appendAttributesToTS(attributesToAdd, xmlFile);
        appendEvents(eventsToAdd, xmlFile);
    }

    function appendAttributesToTS(attributes, xmlFile) {
        for(let attribute of attributes) {
            xmlFile.getElementsByTagName("attribute-types")[0].appendChild(attribute);
        }
    }

    function appendEvents(events, xmlFile) {
        for(let event of events) {
            xmlFile.appendChild(event);
        }
    }

    function getEvent(eventName, contractName, contractAddress, eventABI) {
        let eventParams = getEventParams(eventABI);
        return `<ts:contract name="${contractName}">
                    <ts:address network="1">${contractAddress}</ts:address>
                    <asnx:module name="${eventName}">
                      <sequence>
                        ${eventParams}
                      </sequence>
                    </asnx:module>
                </ts:contract>`;
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
        return `
            <ts:attribute-type id="${func.name}" syntax="${getSyntax(func.outputs)}">
                <ts:name>
                    <ts:string xml:lang="en">${func.name}</ts:string>
                </ts:name>
                <ts:origins>
                    <ts:ethereum function="${func.name}" contract="${contractName}" as="${getAS(func.outputs)}">
                        ${data}
                    </ts:ethereum>
                </ts:origins>
            </ts:attribute-type>`
    }

    function getData(func) {
        let data = "";
        let dataPrefix = "<ts:data>";
        let dataSuffix = "</ts:data>";
        for(let input of func.inputs) {
            data += `<ts:${input.type}></ts:${input.type}>`
        }
        if(data !== "") {
            data = dataPrefix + data + dataSuffix;
        }
        return data;
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

});
