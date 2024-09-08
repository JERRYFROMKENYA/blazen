

// Import necessary modules
const express = require('express');
const { DidJwk, DidDht } = require('@web5/dids');

// Initialize Express app
const app = express();
const PORT = 3000;

// Middleware to parse JSON requests
app.use(express.json());

// IIFE to handle async imports and initialization
(async () => {
  // Import PocketBase dynamically
  const PocketBase = (await import('pocketbase')).default;
  const { TbdexHttpClient } = await import('@tbdex/http-client'); // Use dynamic import for ES module

  const pb = new PocketBase(process.env.POCKETBASE_URL); // Use environment variable

  // Function to create a DID JWK document
  async function createDidJwkDocument() {
    try {
      const didJwk = await DidJwk.create();
      return didJwk.export();
    } catch (err) {
      throw new Error('Error creating DID: ' + err.message);
    }
  }

  // Function to create a DID DHT document
  async function createDidDhtDocument() {
    try {
      const didDht = await DidDht.create();
      return didDht.export();
    } catch (err) {
      throw new Error('Error creating DID: ' + err.message);
    }
  }

  // Function to fetch mock DIDs from PocketBase
  const fetchMockDids = async () => {
    try {

      const records = await pb.collection('pfi').getFullList(); // Replace 'mock_dids' with your collection name
      return records.reduce((acc, record) => {
        acc[record.id] = {
          did: record.did,
          name: record.name,
          description: record.description,
          offerings: record.offerings,
        };
        return acc;
      }, {});
    } catch (error) {
      throw new Error('Failed to fetch mock DIDs: ' + error.message);
    }
  };

  // Function to fetch offerings from tbDex SDK
  const fetchOfferings = async () => {
    try {
      const allOfferings = [];
      const mockDids = await fetchMockDids();
      console.log('Mock DIDs:', mockDids);
      for (const pfi of Object.values(mockDids)) {
        const pfiUri = pfi.did;
        // Fetch offerings from PFIs
        const offerings = await TbdexHttpClient.getOfferings({
          pfiDid: pfiUri
        });
        allOfferings.push(...offerings);
      }

      return { offerings: allOfferings };
    } catch (error) {
      console.error('Failed to fetch offerings:', error);
    }
  };

  // Function to update currencies (implementation not provided)
  const updateCurrencies = () => {
    // Update currencies logic here
  };

  // Endpoint to handle requests and return DID JWK document
  app.get('/jwk', async (req, res) => {
    try {
      const didDocument = await createDidJwkDocument();
      res.status(200).json(didDocument);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Endpoint to handle requests and return DID DHT document
  app.get('/dht', async (req, res) => {
    try {
      const didDocument = await createDidDhtDocument();
      res.status(200).json(didDocument);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Endpoint to fetch mock DIDs from PocketBase
  app.get('/mock-dids', async (req, res) => {
    try {
      const mockDids = await fetchMockDids();
      res.status(200).json(mockDids);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Endpoint to select PFI based on user's offering selection
  app.post('/select-pfi', async (req, res) => {
    const { offering } = req.body;
    console.log('Offering:', offering);
    if (!offering) {
      return res.status(400).json({ error: 'Offering is required' });
    }

    try {
      const offerings = await fetchOfferings();
      const [payinCurrency, payoutCurrency] = offering.split(':');
      const filteredOfferings = offerings.filter(offering =>
        offering.data.payin.currencyCode === payinCurrency &&
        offering.data.payout.currencyCode === payoutCurrency
      ).map(offering => ({
        // Extract relevant data from the offering
        from: offering.metadata.from,
        offeringId: offering.metadata.id,
        description: offering.data.description,
        payoutUnitsPerPayinUnit: offering.data.payoutUnitsPerPayinUnit,
        payinCurrency: offering.data.payin.currencyCode,
        payoutCurrency: offering.data.payout.currencyCode,
        payinMethods: offering.data.payin.methods,
        payoutMethods: offering.data.payout.methods,
        requiredClaims: offering.data.requiredClaims
      }));

      res.status(200).json(offerings);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Endpoint to fetch offerings
  app.get('/offerings', async (req, res) => {
    try {
      const offerings = await fetchOfferings();
      res.status(200).json(offerings);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Start the server
  app.listen(PORT, (error) => {
    if (error) {
      console.log('Error starting the server');
      return;
    }
    console.log(`Server is running on port ${PORT} 🚀`+"\n pocket base:"+process.env.POCKETBASE_URL);
  });
})();