const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const port = process.env.PORT || 3005;


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname)));  // Изменено

let allData = Array.from({ length: 100 }, (_, i) => i + 1);
let selectedData = new Set();
let sortedData = [...allData];

// Маршруты API

app.get('/api/data', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const term = req.query.search;

    let data = sortedData;

    if (term) {
        data = sortedData.filter(item => String(item).includes(term));
    }

    const result = data.slice(startIndex, endIndex);

    res.json({
        data: result,
        total: data.length,
        selected: Array.from(selectedData)
    });
});

app.get('/api/selected', (req, res) => {
    res.json(Array.from(selectedData));
});

app.post('/api/selected/add', (req, res) => {
    const id = req.body.id;
    selectedData.add(id);
    res.sendStatus(200);
});

app.post('/api/selected/remove', (req, res) => {
    const id = req.body.id;
    selectedData.delete(id);
    res.sendStatus(200);
});

app.post('/api/sort', (req, res) => {
    const search = req.body.search || false;
    const {draggedItem, data} = req.body;
    const toIndex = sortedData.indexOf(data)
    const fromIndex = sortedData.indexOf(draggedItem)
    if (search) {
        [sortedData[fromIndex], sortedData[toIndex]] = [sortedData[toIndex], sortedData[fromIndex]];
        res.json(sortedData)
    } else {
        const { fromIndex, toIndex, data } = req.body;
        sortedData.splice(fromIndex, 1, data)
        sortedData.splice(toIndex, 1, draggedItem)
        res.sendStatus(200);
    }

});
app.get('/api/getSort', (req, res) => {
    res.json(sortedData);
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});