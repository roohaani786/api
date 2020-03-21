
const fs = require('fs');
const drive = require("drive-db");

const SHEET = "1nzXUdaIWC84QipdVGUKTiCSc5xntBbpMpzLm6Si33zk";
const SHEET_TRAVEL_HISTORY = "opc5w4v"


const dir='./'
const filename = '/travel_history.json'

const tabs = {
  travel_history: SHEET_TRAVEL_HISTORY,
};

async function fetchData() {
  const data = await Promise.all(
    Object.keys(tabs).map(async tab => {
      return {
        [tab]: await drive({ sheet: SHEET, tab: tabs[tab] })
      };
    })
    );

  let mergedData = {};

  data.forEach(obj => {
    mergedData = { ...mergedData, ...obj };
  });

  return mergedData;
}

function sortObjByKey(value) {
  return (typeof value === 'object') ?
    (Array.isArray(value) ?
      value.map(sortObjByKey) :
      Object.keys(value).sort().reduce(
        (o, key) => {
          const v = value[key];
          o[key] = sortObjByKey(v);
          return o;
        }, {})
    ) :
    value;
}

async function writeData(data) {
  const fileContent = JSON.stringify(sortObjByKey(data),null,"\t");
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }
  return await fs.writeFileSync(dir+filename, fileContent);;
}

async function task() {
  console.log("Fetching data from sheets...");
  const data = await fetchData();
  console.log("Writing data to json file...");
  await writeData(data);
  console.log("Opertion completed!");
}


async function main() {
  console.log("Running task on start...");
  await task();
  console.log("Created Json File With Updated Contents");

}

main();

// source https://github.com/reustle/covid19japan/blob/master/scripts/cache-spreadsheet-data/cache-sheet.js , and made the changes accordingly
