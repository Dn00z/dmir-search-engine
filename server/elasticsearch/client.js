const {Client} = require("@elastic/elasticsearch");
const config = require("config");

const elasticConfig = config.get("elastic");


const client = new Client({
    cloud: {
        id: elasticConfig.cloudID
    },
    auth: {
        username: elasticConfig.username,
        password: elasticConfig.password
    }
});

client.ping()
    .then(res => console.log("Connected to ES :", res))
    .catch(err => console.error(err));

module.exports = client;