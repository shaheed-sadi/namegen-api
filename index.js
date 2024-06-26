const express = require('express')
const fs = require('fs')
const path = require('path')
const config = require('./config.js')
const app = express()
const port = config.PORT

const os = require('os')

app.get('/:cat?/:page?',  async (req, res) =>  {


    var extra = req.query.extra || '';

    var cat = req.params.cat ?? '';

    var names = await loadNames(cat);

    res.json(names)
})

async function loadNames(cat) {
    var names = [];
    if (fs.existsSync(config.CONTENT_DIR)) {
        var fileName = path.join(config.CONTENT_DIR, cat + '.txt');

        if (fs.existsSync(fileName)) {
            names = readFileAsObjectArray(fileName)
        }
        else {
            // combine content of all files
            var allFiles = fs.readdirSync(config.CONTENT_DIR, {
                withFileTypes: true,
                recursive: false
            })

            allFiles.forEach(async file => {
                if (file.name.endsWith('.txt')) {
                    var catFileName = path.join(file.path, file.name);
                    
                    var moreNames = readFileAsObjectArray(catFileName)
                    moreNames.forEach(name => names.push(name))   
                }
            })
        }
    }
    
    return names;
}

function nameToObject(val){
    var name = val.split(':')[0]
    var desc = val.split(':')[1]

    return {
        name, 
        description: desc
    }
}

function readFileAsObjectArray(fileName) {
    var content = fs.readFileSync(fileName, 'utf-8');
    var names = content.split(os.EOL).map(val => val.trim());
    return names.map(name => nameToObject(name));
}

app.listen(port, () => {
  console.log(`Example app listening on ${config.NODE_ENV} port ${port}`)
})