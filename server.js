const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const dataFile = path.join(__dirname, "data.json");

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

    // Local version
    const data = JSON.parse(await fs.readFile(dataFile, "utf-8"));
    
    data[req.body.add]++;
    console.log('added vote for ' + req.body.add);

    // Local file-write
    await fs.writeFile(dataFile, JSON.stringify(data));

    res.end();
});

const PORT = parseInt(process.env.PORT) || 3000;
app.listen(PORT, () => console.log("Server is running …"));