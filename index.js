const {DOMParser} = require('xmldom');
const {ptBookArray}  = require('proskomma-utils');
const path = require('path');
const fse = require('fs-extra');

const dom = new DOMParser().parseFromString(
    fse.readFileSync(
        path.resolve(
            path.join(
                __dirname,
                "source_data",
                "alignment",
                "ptx",
                "mappings-056.xml"
            )
        )
    ).toString()
);

const ret = [];
const childNodes = dom.documentElement.childNodes;
for (let i=0; i < childNodes.length; i++) {
    if (childNodes[i].nodeType !== 1) continue;
    const mapping = childNodes[i].getAttribute('Reference');
    const sourceLink = childNodes[i].getElementsByTagName("SourceLink")[0];
    const targetLinkValue = childNodes[i].getElementsByTagName("TargetLink")[0].firstChild.nodeValue;
    const mappingJson = {
        source: {
            glWord: sourceLink.getAttribute("Word"),
            strong: sourceLink.getAttribute("Strong"),
            book: ptBookArray[parseInt(mapping.substring(0, 3)) - 1].code,
            chapter: parseInt(mapping.substring(3, 6)),
            verse: parseInt(mapping.substring(6, 9)),
            segment: parseInt(mapping.substring(9, 11)),
        },
        target: {
            targetLinkValue,
            book: ptBookArray[parseInt(targetLinkValue.substring(0, 3)) - 1].code,
            chapter: parseInt(targetLinkValue.substring(3, 6)),
            verse: parseInt(targetLinkValue.substring(6, 9)),
            segment: parseInt(targetLinkValue.substring(9, 11)),
            word: parseInt(targetLinkValue.substring(11, 14)) / 2,
        }
    };
    ret.push(mappingJson);
}
console.log(JSON.stringify(ret, null, 2));
