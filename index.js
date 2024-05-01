const express = require('express')
const fs = require('fs')
const path = require('path')
const app = express()
const port = 3000

const constants = require('./constants.js');
const os = require('os')

app.get('/names/:cat?/:page?',  async (req, res) =>  {


    var extra = req.query.extra || '';

    var cat = req.params.cat ?? '';

    var names = await loadNames(cat);

    res.json(names)
})

async function loadNames(cat) {
    var names = [];
    if (fs.existsSync(constants.CONTENT_DIR)) {

        var fileName = path.join(constants.CONTENT_DIR, cat + '.txt');

        if (fs.existsSync(fileName)) {
            names = await readFileAsArray(fileName)
        }
        else {
            // combine content of all files
            var allFiles = fs.readdirSync(constants.CONTENT_DIR, {
                withFileTypes: true,
                recursive: true
            })

            allFiles.forEach(async file => {
                if (file.name.endsWith('.txt')) {
                    var catFileName = path.join(file.path, file.name);
                    
                    var moreNames = await readFileAsArray(catFileName)
                    moreNames.forEach(name => names.push(name))   
                }
            })
        }
    }
    
    return names;
}

async function readFileAsArray(fileName) {
    var content = fs.readFileSync(fileName, 'utf-8');
    return content.split(os.EOL).map(val => val.trim());
}

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})