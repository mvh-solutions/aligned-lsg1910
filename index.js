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
                "mappings-001.xml"
            )
        )
    ).toString()
);

const ret = [];
const childNodes = dom.documentElement.childNodes;
for (let i=0; i < childNodes.length; i++) {
    if (childNodes[i].nodeType !== 1) continue;
    const sourceLink = childNodes[i].getElementsByTagName("SourceLink")[0];
    const targetLink = childNodes[i].getElementsByTagName("TargetLink")[0].firstChild.nodeValue;
    const mappingJson = {
        glWord: sourceLink.getAttribute("Word"),
        strong: sourceLink.getAttribute("Strong"),
        targetLink,
        book: ptBookArray[parseInt(targetLink.substring(0,3)) - 1].code,
        chapter: parseInt(targetLink.substring(3,6)),
        verse: parseInt(targetLink.substring(6,9)),
        segment: parseInt(targetLink.substring(9,11)),
        word: parseInt(targetLink.substring(11,14)) / 2,
    };
    ret.push(mappingJson);
}
console.log(JSON.stringify(ret, null, 2));
