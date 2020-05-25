module.exports = {

    header: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n",

    entities: "<!DOCTYPE token  [\n" +
        "        <!ENTITY style SYSTEM \"shared.css\">\n" +
        "        <!ENTITY about.en SYSTEM \"about.en.js\">\n" +
        "        <!ENTITY approve.en SYSTEM \"approve.en.js\">\n" +
        "        ]>\n",

    erc20XML: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
        "<!DOCTYPE token  [\n" +
        "        <!ENTITY style SYSTEM \"shared.css\">\n" +
        "        <!ENTITY about.en SYSTEM \"about.en.js\">\n" +
        "        <!ENTITY approve.en SYSTEM \"approve.en.js\">\n" +
        "        ]>\n" +
        "<ts:token xmlns:ts=\"http://tokenscript.org/2020/06/tokenscript\"\n" +
        "          xmlns:xhtml=\"http://www.w3.org/1999/xhtml\"\n" +
        "          xmlns:xml=\"http://www.w3.org/XML/1998/namespace\"\n" +
        "          xsi:schemaLocation=\"http://tokenscript.org/2020/06/tokenscript http://tokenscript.org/2020/06/tokenscript.xsd\"\n" +
        "          xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"\n" +
        "          xmlns:asnx=\"urn:ietf:params:xml:ns:asnx\"\n" +
        "          xmlns:ethereum=\"urn:ethereum:constantinople\"\n" +
        "          custodian=\"false\"\n" +
        ">\n" +
        "    <ts:label>\n" +
        "        <ts:string xml:lang=\"en\"></ts:string>\n" +
        "    </ts:label>\n" +
        "    <ts:contract interface=\"erc20\" name=\"\">\n" +
        "        <ts:address network=\"1\"></ts:address>     <!--mainnet-->\n" +
        "    </ts:contract>\n" +
        "\n" +
        "    <ts:origins>\n" +
        "        <!-- Define the contract which holds the token that the user will use -->\n" +
        "        <ts:ethereum contract=\"\"/> <!-- as above ts:contract name -->\n" +
        "    </ts:origins>\n" +
        "\n" +
        "    <ts:cards>\n" +
        "        <ts:card type=\"action\">\n" +
        "            <ts:label>\n" +
        "                <ts:string xml:lang=\"en\">About</ts:string>\n" +
        "            </ts:label>\n" +
        "            <ts:view xmlns=\"http://www.w3.org/1999/xhtml\" xml:lang=\"en\">\n" +
        "                <xhtml:style type=\"text/css\">&style;</xhtml:style>\n" +
        "                <xhtml:script type=\"text/javascript\">&about.en;</xhtml:script>\n" +
        "            </ts:view>\n" +
        "        </ts:card>\n" +
        "\n" +
        "        <ts:card type=\"action\">\n" +
        "            <ts:label>\n" +
        "                <ts:string xml:lang=\"en\">Approve</ts:string>\n" +
        "            </ts:label>\n" +
        "            <ts:attribute name=\"approvalAddress\">\n" +
        "                <ts:type>\n" +
        "                    <ts:syntax>1.3.6.1.4.1.1466.115.121.1.36</ts:syntax>\n" +
        "                </ts:type>\n" +
        "                <ts:label>\n" +
        "                    <ts:string xml:lang=\"en\">Approval Address</ts:string>\n" +
        "                </ts:label>\n" +
        "                <ts:origins>\n" +
        "                    <ts:user-entry as=\"address\"/>\n" +
        "                </ts:origins>\n" +
        "            </ts:attribute>\n" +
        "            <ts:transaction>\n" +
        "                <ethereum:transaction function=\"approve\" contract=\"\" as=\"uint\">\n" +
        "                    <ts:data>\n" +
        "                        <ts:address ref=\"approvalAddress\"/>\n" +
        "                        <ts:uint256>115792089237316195423570985008687907853269984665640564039457584007913129639935</ts:uint256>\n" +
        "                    </ts:data>\n" +
        "                </ethereum:transaction>\n" +
        "            </ts:transaction>\n" +
        "            <ts:view xmlns=\"http://www.w3.org/1999/xhtml\" xml:lang=\"en\">\n" +
        "                <xhtml:style type=\"text/css\">&style;</xhtml:style>\n" +
        "                <xhtml:script type=\"text/javascript\">&approve.en;</xhtml:script>\n" +
        "            </ts:view>\n" +
        "        </ts:card>\n" +
        "    </ts:cards>\n" +
        "</ts:token>\n",

    erc721XML: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
        "<!DOCTYPE token  [\n" +
        "        <!ENTITY style SYSTEM \"shared.css\">\n" +
        "        <!ENTITY about.en SYSTEM \"about.en.js\">\n" +
        "        <!ENTITY approve.en SYSTEM \"approve.en.js\">\n" +
        "        ]>\n" +
        "<ts:token xmlns:ts=\"http://tokenscript.org/2020/06/tokenscript\"\n" +
        "          xmlns:xhtml=\"http://www.w3.org/1999/xhtml\"\n" +
        "          xmlns:xml=\"http://www.w3.org/XML/1998/namespace\"\n" +
        "          xsi:schemaLocation=\"http://tokenscript.org/2020/06/tokenscript http://tokenscript.org/2020/06/tokenscript.xsd\"\n" +
        "          xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"\n" +
        "          xmlns:asnx=\"urn:ietf:params:xml:ns:asnx\"\n" +
        "          xmlns:ethereum=\"urn:ethereum:constantinople\"\n" +
        "          custodian=\"false\"\n" +
        ">\n" +
        "    <ts:label>\n" +
        "        <ts:string xml:lang=\"en\"></ts:string>\n" +
        "    </ts:label>\n" +
        "    <ts:contract interface=\"erc721\" name=\"\">\n" +
        "        <ts:address network=\"1\"></ts:address>     <!--mainnet-->\n" +
        "    </ts:contract>\n" +
        "\n" +
        "    <ts:origins>\n" +
        "        <!-- Define the contract which holds the token that the user will use -->\n" +
        "        <ts:ethereum contract=\"\"/> <!-- as above ts:contract name -->\n" +
        "    </ts:origins>\n" +
        "\n" +
        "    <ts:cards>\n" +
        "        <ts:card type=\"action\">\n" +
        "            <ts:label>\n" +
        "                <ts:string xml:lang=\"en\">About</ts:string>\n" +
        "            </ts:label>\n" +
        "            <ts:view xmlns=\"http://www.w3.org/1999/xhtml\" xml:lang=\"en\">\n" +
        "                <xhtml:style type=\"text/css\">&style;</xhtml:style>\n" +
        "                <xhtml:script type=\"text/javascript\">&about.en;</xhtml:script>\n" +
        "            </ts:view>\n" +
        "        </ts:card>\n" +
        "\n" +
        "        <ts:card type=\"action\">\n" +
        "            <ts:label>\n" +
        "                <ts:string xml:lang=\"en\">Approve</ts:string>\n" +
        "            </ts:label>\n" +
        "            <ts:attribute name=\"approvalAddress\">\n" +
        "                <ts:type>\n" +
        "                    <ts:syntax>1.3.6.1.4.1.1466.115.121.1.36</ts:syntax>\n" +
        "                </ts:type>\n" +
        "                <ts:label>\n" +
        "                    <ts:string xml:lang=\"en\">Approval Address</ts:string>\n" +
        "                </ts:label>\n" +
        "                <ts:origins>\n" +
        "                    <ts:user-entry as=\"address\"/>\n" +
        "                </ts:origins>\n" +
        "            </ts:attribute>\n" +
        "            <ts:transaction>\n" +
        "                <ethereum:transaction function=\"approve\" contract=\"\" as=\"uint\">\n" +
        "                    <ts:data>\n" +
        "                        <ts:address ref=\"approvalAddress\"/>\n" +
        "                        <ts:uint256 ref=\"tokenId\"/>\n" +
        "                    </ts:data>\n" +
        "                </ethereum:transaction>\n" +
        "            </ts:transaction>\n" +
        "            <ts:view xmlns=\"http://www.w3.org/1999/xhtml\" xml:lang=\"en\">\n" +
        "                <xhtml:style type=\"text/css\">&style;</xhtml:style>\n" +
        "                <xhtml:script type=\"text/javascript\">&approve.en;</xhtml:script>\n" +
        "            </ts:view>\n" +
        "        </ts:card>\n" +
        "    </ts:cards>\n" +
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
