const express = require('express');
const { DidJwk, DidDht } = require('@web5/dids');

const app = express();
const PORT = 3000;

// Function to create a DID and return its document
async function createDidJwkDocument() {
    try {
        const didJwk = await DidJwk.create();
        return didJwk.export();
    } catch (err) {
        throw new Error('Error creating DID: ' + err.message);
    }
}

async function createDidDhtDocument() {
    try {
        const didDht = await DidDht.create();
        return didDht.export();
    } catch (err) {
        throw new Error('Error creating DID: ' + err.message);
    }
}

// Endpoint to handle requests and return DID document
app.get('/jwk', async (req, res) => {
    try {
        const didDocument = await createDidJwkDocument();
        res.status(200).json(didDocument);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint to handle requests and return DID document
app.get('/dht', async (req, res) => {
    try {
        const didDocument = await createDidDhtDocument();
        res.status(200).json(didDocument);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, (error) => {
    if (error) {
        console.log('Error starting the server');
        return;
    }
    console.log(`Server is running on port ${PORT}`);
});