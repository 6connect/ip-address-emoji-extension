(function () {

    //Wait 10ms before continuing, seems to work better than DOMContentLoaded listener.
    setTimeout(()=>{

        //un-compresses IPv6 addresses into their full length since our converter script doesn't support that yet.
        const expandIPv6Address = (address) => {
            let fullAddress = "",
            expandedAddress = "",
            validGroupCount = 8,
            validGroupSize = 4,
            ipv4 = "",
            extractIpv4 = /([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})/,
            validateIpv4 = /((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})/;

            // look for embedded ipv4
            if(validateIpv4.test(address))
            {
                groups = address.match(extractIpv4);
                for(let i=1; i<groups.length; i++)
                {
                    ipv4 += ("00" + (parseInt(groups[i], 10).toString(16)) ).slice(-2) + ( i==2 ? ":" : "" );
                }
                address = address.replace(extractIpv4, ipv4);
            }

            if(address.indexOf("::") == -1) // All eight groups are present.
                fullAddress = address;
            else // Consecutive groups of zeroes have been collapsed with "::".
            {
                let sides = address.split("::");
                let groupsPresent = 0;
                for(let i=0; i<sides.length; i++)
                {
                    groupsPresent += sides[i].split(":").length;
                }
                fullAddress += sides[0] + ":";
                for(let i=0; i<validGroupCount-groupsPresent; i++)
                {
                    fullAddress += "0000:";
                }
                fullAddress += sides[1];
            }
            let groups = fullAddress.split(":");
            for(let i=0; i<validGroupCount; i++)
            {
                while(groups[i].length < validGroupSize)
                {
                    groups[i] = "0" + groups[i];
                }
                expandedAddress += (i!=validGroupCount-1) ? groups[i] + ":" : groups[i];
            }
            return expandedAddress;
        }

        //Gets all text nodes using a "tree walker" this is how we get the raw text to search through for IP addresses
        const textNodesUnder = (el) => {
            let n, a=[], walk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,null,false);
            while(n=walk.nextNode()) a.push(n);
            return a;
        }

        //Search through all text nodes on the page
        const texts = textNodesUnder(document.body);
        for (let index = 0; index < texts.length; index++) {
            let text = texts[index].textContent//.split(' ');
            if (text.length < 10000) { //Scripts and stylesheets also show up as text nodes, to avoid performance issues lets generally skip over long text nodes.
                let newtext = '',
                changed = false,
                v4Tracker = 0;

                while (text.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/) !== null) {
                    changed = true;
                    
                    let match = text.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/)[0],
                    solution = ipemotes.encode(match);

                    const exp = new RegExp(match, 'ig');
    
                    v4Tracker++;
                    if (v4Tracker > 100) {
                        text = null;
                    }
    
                    text = text.replace(exp, solution);
                }
    
                let tracker = 0;
                while (text.match(/\b(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))((\b)|(\/))/) !== null) {
                    let match = text.match(/\b(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))((\b)|(\/))/)[0];
                    let append = '';
                    if (match.indexOf('/') > 0) append = '/';

                    changed = true;
                    let expanded_match = expandIPv6Address(match);
                    let v6 = expanded_match.split(':');
                    let solution = ipemotes.encode(v6.join(':'));
                    
    
                    const exp = new RegExp(match, 'ig');
                    text = text.replace(exp, solution+append);

                    tracker++;
                    if (tracker > 100) {
                        text = null;
                    }
                }
                
                if (changed){
                    texts[index].textContent = text//newtext;
                }
            }
        }

    }, 10);
})()

