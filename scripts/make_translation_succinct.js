const Axios = require('axios');
const YAML = require('js-yaml-parser');
const { Proskomma } = require('proskomma');

const transRecords = {
  uhb: [
    'unfoldingWord',
    'hbo',
    'uhb',
    'https://git.door43.org/unfoldingWord/hbo_uhb/raw/branch/master',
  ],
  ugnt: [
    'unfoldingWord',
    'grc',
    'ugnt',
    'https://git.door43.org/unfoldingWord/el-x-koine_ugnt/raw/branch/master',
  ],
  ust: [
    'unfoldingWord',
    'eng',
    'ust',
    'https://git.door43.org/unfoldingWord/en_ust/raw/branch/master',
  ],
  ult: [
    'unfoldingWord',
    'eng',
    'ult',
    'https://git.door43.org/unfoldingWord/en_ult/raw/branch/master',
  ],
};

const pk = new Proskomma();

const serializeDocuments = async (transId, verbose, serializeDir) => {
  verbose = verbose || false;
  if (verbose) console.log('Download USFM');
  const transRecord = transRecords[transId];
  if (!transRecord) {
    throw new Error(`No record found for transId '${transId}'`);
  }
  const [org, lang, abbr, baseURL] = transRecord;
  const selectors = {
    lang,
    abbr,
  };
  if (verbose) console.log(`  ${org}/${lang}/${abbr}`);
  const content = [];
  await Axios.request({
    method: 'get',
    url: `${baseURL}/manifest.yaml`,
  }).then(async (response) => {
    const manifest = YAML.safeLoad(response.data);
    const bookPaths = manifest.projects.map((e) => e.path.split('/')[1]);
    for (const bookPath of bookPaths) {
      const pathBook = bookPath.split('.')[0].split('-')[1];
      if (pathBook === 'FRT') {
        continue;
      }
      if (verbose) console.log(`    ${pathBook}`);
      try {
        await Axios.request({
          method: 'get',
          url: `${baseURL}/${bookPath}`,
        }).then((response) => {
          if (response.status !== 200) {
            throw new Error('Bad download status');
          }
          content.push(response.data);
        });
      } catch (err) {
        if (verbose)
          console.log(`Could not load ${bookPath} for ${lang}/${abbr}`);
      }
    }
  });
  if (content.length === 0) {
    if (verbose) console.log(`      Book ${book} not found`);
  }
  if (verbose) console.log(`      Downloaded`);
  const startTime = Date.now();
  pk.importDocuments(selectors, 'usfm', content, {});
  if (verbose) console.log(`      Imported in ${Date.now() - startTime} msec`);
  const path = require('path');
  const fse = require('fs-extra');
  const outDir = path.resolve(serializeDir);
  fse.mkdirs(outDir);
  fse.writeFileSync(
    path.join(
      outDir,
      `${Object.values(selectors).join('_')}_pkserialized.json`
    ),
    JSON.stringify(pk.serializeSuccinct(`${lang}_${abbr}`))
  );
};

serializeDocuments( process.argv[2], true, process.argv[3]);
