// Stub for Analytics & Export logic
const { Parser } = require('json2csv');

exports.exportToCSV = (data) => {
  try {
    const parser = new Parser();
    const csv = parser.parse(data);
    return csv;
  } catch (err) {
    console.error(err);
    return null;
  }
};
