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

    document.getElementById("create").addEventListener("click", () => {
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
        let domParser = new DOMParser();
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
        setValuesFromABI(erc, abi, xmlFile, contractAddress, contractName);
    }

    function setValuesFromABI(erc, abi, xmlFile, contractAddress, contractName) {
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
        let xmlAsString = new XMLSerializer().serializeToString(updatedXML);
        downloadFilesAsZip(erc, contractName, vkbeautify.xml(xmlAsString));
    }

    function downloadFilesAsZip(erc, contractName, xmlAsString) {
        let zip = new JSZip();
        let folder = zip.folder(contractName);
        folder.file(contractName + "-TokenScript.xml", xmlAsString, null);
        //CSS is the same for 721 and 20 but the user needs the paths to match in the entities
        let cssPromise = $.get("https://raw.githubusercontent.com/AlphaWallet/abi-to-TokenScript/gh-pages/samples/erc20/shared.css");
        folder.file("shared.css", cssPromise, null);
        let makeFilePromise = $.get("https://raw.githubusercontent.com/AlphaWallet/abi-to-TokenScript/gh-pages/samples/Makefile");
        folder.file("Makefile", makeFilePromise, null);
        switch(erc) {
            case ERC.ERC20:
                let aboutPromise20 = $.get("https://raw.githubusercontent.com/AlphaWallet/abi-to-TokenScript/gh-pages/samples/erc20/about.en.js");
                folder.file("about.en.js", aboutPromise20, null);
                let approvePromise20 = $.get("https://raw.githubusercontent.com/AlphaWallet/abi-to-TokenScript/gh-pages/samples/erc20/approve.en.js");
                folder.file("approve.en.js", approvePromise20, null);
                break;
            case ERC.ERC721:
                let aboutPromise721 = $.get("https://raw.githubusercontent.com/AlphaWallet/abi-to-TokenScript/gh-pages/samples/erc721/about.en.js");
                folder.file("about.en.js", aboutPromise721, null);
                let approvePromise721 = $.get("https://raw.githubusercontent.com/AlphaWallet/abi-to-TokenScript/gh-pages/samples/erc721/approve.en.js");
                folder.file("approve.en.js", approvePromise721, null);
                break;
        }
        zip.generateAsync({ type: "blob" }).then((content) => {
            saveAs(content, contractName + ".zip");
        });
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

    function setContractDetails(xmlFile, contractName, contractAddress) {
        xmlFile.getElementsByTagName("ts:name")[0].getElementsByTagName("ts:string")[0].innerHTML = contractName;
        xmlFile.getElementsByTagName("ts:contract")[0].attributes.name.value = contractName;
        xmlFile.getElementsByTagName("ts:contract")[0].children[0].value = contractAddress;
        xmlFile.getElementsByTagName("ts:cards")[0].getElementsByTagName("ts:action")[1]
            .getElementsByTagName("ts:transaction")[0].
        getElementsByTagName("ts:ethereum")[0].setAttribute("contract", contractName);
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
        let dataElement = document.createElement("ts:data");
        if(func.inputs.length !== 0) {
            for(let input of func.inputs) {
                let paramNode = document.createTextNode(`ts:${input.type}`);
                dataElement.appendChild(paramNode);
            }
            return dataElement;
        } else {
            return "";
        }
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
