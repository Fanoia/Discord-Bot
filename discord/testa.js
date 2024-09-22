const moment = require("moment");

const dateStr = "2024-09-24T13:46";
const dateObj = moment(dateStr);
const unixTimestamp = dateObj.unix();

console.log(unixTimestamp);