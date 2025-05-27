const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

const port = 3005;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const ALL_DATA_LENGTH = 1000000;
let sortedDataIndexMap = new Map();
let sortedData = Array.from({ length: ALL_DATA_LENGTH }, (_, i) => {
    const value = i + 1;
    sortedDataIndexMap.set(value, i);
    return value;
});

let selectedData = new Set();


// Маршруты API

app.get('/api/data', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const term = req.query.search;

    let data = sortedData;

    if (term) {
        const searchTerm = String(term).toLowerCase(); // Convert term to string and lowercase
        data = sortedData.filter(item => String(item).toLowerCase().includes(searchTerm)); // Use includes
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
    const { draggedItem, data } = req.body;


    if (search) {
        const toIndex = sortedDataIndexMap.get(data);
        const fromIndex = sortedDataIndexMap.get(draggedItem);

        if (toIndex === undefined || fromIndex === undefined) {
            console.error("Element not found in sortedDataIndexMap");
            return res.sendStatus(400);
        }
        [sortedData[fromIndex], sortedData[toIndex]] = [sortedData[toIndex], sortedData[fromIndex]];
        
        sortedDataIndexMap.set(data, fromIndex);
        sortedDataIndexMap.set(draggedItem, toIndex);

        const searchTerm = String(req.query.search).toLowerCase();
        const filteredData = sortedData.filter(item => String(item).toLowerCase().includes(searchTerm));

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const result = filteredData.slice(startIndex, endIndex);

        res.json({
            data: result,
            total: filteredData.length,
            selected: Array.from(selectedData)
        });
        return;

    } else {
        const { fromIndex, toIndex } = req.body;
        const temp = sortedData[fromIndex];
        sortedData[fromIndex] = sortedData[toIndex];
        sortedData[toIndex] = temp;
        sortedDataIndexMap.set(sortedData[fromIndex], fromIndex);
        sortedDataIndexMap.set(sortedData[toIndex], toIndex);
        res.sendStatus(200);
    }


});
app.get('/api/getSort', (req, res) => {
    res.json(sortedData);
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})