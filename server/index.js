const csvtojson = require('csvtojson');

const generate = async () => {
    return await csvtojson().fromFile(__dirname + '/elasticsearch/corpus.csv');
}

generate().then(res => console.log(res)).catch(err => console.log(err))