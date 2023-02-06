const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const dataFile = path.join(__dirname, "data.json");

// const { Storage } = require('@google-cloud/storage');

// Creates a client
// const storage = new Storage();

// Reference to the data file in Google Cloud Storage
// const bucketName = 'lv4-skin-selector.appspot.com';
// const dataFile = 'data.json';

// Support POSTing form data with uRL encoded
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
});

// Public folder
app.use(express.static(__dirname+ '/views'));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname) + '/views/index.html');
});

app.get("/poll", async (req, res) => {
    
    // Local file-read
    let data = JSON.parse(await fs.readFile(dataFile, "utf-8"));
    
    // Cloud file-read
    // let [cloudJson] = await storage.bucket(bucketName).file(dataFile).download();
    // let data = JSON.parse(cloudJson, "utf-8");
    
    const totalVotes = Object.values(data).reduce((total, n) => total += n, 0);

    data = Object.entries(data).map(([label, votes]) => {
        return {
            label,
            percentage: ((100 * votes / totalVotes) || 0).toFixed(0)
        }
    });

    console.log('get' + data);
    console.log(totalVotes);

    res.json(data);
});

app.post("/poll", async (req, res) => {
    // let [cloudJson] = await storage.bucket(bucketName).file(dataFile).download();
    // const data = JSON.parse(await (cloudJson, "utf-8"));
    // console.log('retrieved' + data);

    // Local version
    const data = JSON.parse(await fs.readFile(dataFile, "utf-8"));
    
    data[req.body.add]++;
    console.log('added vote for ' + req.body.add);

    // Local file-write
    await fs.writeFile(dataFile, JSON.stringify(data));

    // const file = storage.bucket(bucketName).file(dataFile);

    // first attempt at cloud file-write
    // await file.save(JSON.stringify(data), {
    //     metadata: {
    //         contentType: 'application/json'
    //     }
    // }).then(() => {
    //     console.log('saved to cloud');
    // });

    // const saveJSON = (data) => {
    //     const file = storage.bucket(bucketName).file(dataFile);
    //     const contents = JSON.stringify(data);
    //     return file.save(contents)
    // }

    res.end();
});

const PORT = parseInt(process.env.PORT) || 3000;
app.listen(PORT, () => console.log("Server is running …"));