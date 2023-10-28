const fs = require('fs');
const { parse } = require('csv-parse');
const client = require("./client");

const indexSettings = require('./index_settings.json');
const mappings = require('./mapping.json');
const { error } = require('console');
const { response } = require('../app');

const keywords = [
    {
        key: "poet",
        value: "Poet"
    },
    {
        key: "source_domain",
        value: "Source Domain of Metaphor"
    },
    {
        key: "target_domain",
        value: "Target Domain of Metaphor"
    },
    {
        key: "year",
        value: "Year"
    }
]

// serch by keyword
const search = async (req, res) => {
    const reqBody = req.body;

    if (reqBody == null) {
        return res.status(400).json({ "status": "failed", "error": "empty request body" })
    }

    const { term, keyword } = reqBody;

    let response = []

    try {

        switch (keyword) {
            case 'poet':
                response = await searchByPoet(term);
                break;
            case 'year':
                response = await searchByYear(term);
                break;
            case 'source_domain':
                response = await searchBySD(term);
                break;
            case 'target_domain':
                response = await searchByTD(term);
        }
        
        res.status(200).json({
            "status": "success",
            "count": response.hits.total.value,
            "data": response.hits.hits
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ "status": "failed" });
    }


}

// fetch available search keywords
const getSeacrchKeywrords = (req, res) => {

    res.status(200).json(keywords);
}

const index = async (req, res) => {
    try {
        // create index
        resIndex = await client.indices.create({
            "index": "metaphors",
            "body": {
                "settings": indexSettings,
                "mappings": mappings
            }
        });

        await indexData();

        res.status(200).json({
            "status": "success"
        })

    } catch (err) {
        console.log(error);
        res.status(400).json({
            "status": "failed",
            "error": error.message

        })
    }
}

// indexing data in csv file
const indexData = async () => {
    try {
        console.log("Reading data from the local CSV file");

        metaphors = []
        fs.createReadStream("./elasticsearch/corpus.csv")
            .pipe(parse({ delimiter: ",", from_line: 1 }))
            .on("data", function (row) {
                if (row[4] == 'Yes') {
                    console.log(row)
                    doc = {
                        'poem_name': row[0],
                        'poet': row[1],
                        'year': row[2],
                        'line': row[3],
                        'metaphor_term': row[6],
                        'source_domain': row[7],
                        'target_domain': row[8],
                        'interpretation': row[9]
                    }
                    metaphors.push(doc);
                }
            })
            .on("error", function (error) {
                console.log(error.message);
                
            })
            .on('finish', async function() {
                for (const record of metaphors) {
                    await client.index({
                        "index": "metaphors",
                        "body": record
                    });
                }
                console.log("Data has been indexed successfully!");
            })

    } catch (err) {
        console.log(err);
    }
};


const searchByPoet = async (term) => {
    return await client.search({
        index: 'metaphors',
        query: {
            match: {
                poet: term
            }
        }
    })
}


const searchByYear = async (term) => {
    return await client.search({
        index: 'metaphors',
        query: {
            match: {
                year: term
            }
        }
    })
}

const searchBySD = async (term) => {
    return await client.search({
        index: 'metaphors',
        query: {
            match: {
                source_domain: {
                    query: term,
                    analyzer: 'plain_with_synonyms'
                }
            }
        }
    })
}

const searchByTD = async (term) => {
    return await client.search({
        index: 'metaphors',
        query: {
            match: {
                target_domain: {
                    query: term,
                    analyzer: 'plain_with_synonyms'
                }
            }
        }
    })
}


module.exports = {
    search,
    index,
    getSeacrchKeywrords
}