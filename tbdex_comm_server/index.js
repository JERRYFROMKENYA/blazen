// Import necessary modules
require('dotenv').config();
const express = require('express');
const { DidJwk, DidDht, BearerDid } = require('@web5/dids');

// Initialize Express app
const app = express();
const PORT = 3000;

// Middleware to parse JSON requests
app.use(express.json());

// IIFE to handle async imports and initialization
(async () => {
  // Import PocketBase dynamically
  const PocketBase = (await import('pocketbase')).default;
  const { Close, Order, Rfq, TbdexHttpClient } = await import('@tbdex/http-client');
  const { Jwt, PresentationExchange } = await import('@web5/credentials');
  const pb = new PocketBase(process.env.POCKETBASE_URL);

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
      const didDht = await DidDht.create({publish:true});
      return didDht.export();
    } catch (err) {
      throw new Error('Error creating DID: ' + err.message);
    }
  }

  // Function to fetch mock DIDs from PocketBase
  const fetchMockDids = async () => {
    try {
      const records = await pb.collection('pfi').getFullList();
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
        const offerings = await TbdexHttpClient.getOfferings({ pfiDid: pfiUri });
        allOfferings.push(...offerings);
      }
      return allOfferings;
    } catch (error) {
      console.error('Failed to fetch offerings:', error);
      throw error;
    }
  };

  // Function to update currencies (implementation not provided)
  const updateCurrencies = () => {
    // Update currencies logic here
  };

  // Create Exchange
  const CreateExchange = async (offering, amount, payoutPaymentDetails, customerCredentials, cDid, payinPaymentDetails) => {
    const customerDid = await DidDht.import({ portableDid: cDid })
    console.log(customerDid)
    const selectedCredentials = PresentationExchange.selectCredentials({
      vcJwts: customerCredentials,
      requiredClaims: offering.data.requiredClaims,
      presentationDefinition: offering.data.requiredClaims
    });

    const rfq = Rfq.create({
      metadata: {
        from: customerDid.uri,
        to: offering.metadata.from,
        protocol: '1.0'

      },
      data: {
        offeringId: offering.metadata.id,
        payin: {
          amount: amount.toString(),
          currencyCode: offering.data.payin.currencyCode,
          kind: offering.data.payin.methods[0].kind,
          paymentDetails: payinPaymentDetails,
        },
        payout: {
          kind: offering.data.payout.methods[0].kind,
          paymentDetails: payoutPaymentDetails,
        },

        claims: selectedCredentials
      }
    });

    try {
      await rfq.verifyOfferingRequirements(offering);
    } catch (e) {
      console.log('Offering requirements not met', e);
    }

    await rfq.sign(customerDid);

    console.log('RFQ:', rfq);

    try {
      await TbdexHttpClient.createExchange(rfq);
    } catch (error) {
      console.error('Failed to create exchange:', error);
      throw new Error('Failed to create exchange: ' + error.message);
    }
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
    if (!offering) {
      return res.status(400).json({ error: 'Offering is required' });
    }

    try {
      const offerings = await fetchOfferings();
      const [payinCurrency, payoutCurrency] = offering.split(':');
      console.log('Selected currencies:', payinCurrency, payoutCurrency);
      const filteredOfferings = offerings.filter(offering =>
        offering.data.payin.currencyCode === payinCurrency &&
        offering.data.payout.currencyCode === payoutCurrency
      ).map(offering => ({
        from: offering.metadata.from,
        offeringId: offering.metadata.id,
        description: offering.data.description,
        payoutUnitsPerPayinUnit: offering.data.payoutUnitsPerPayinUnit,
        payinCurrency: offering.data.payin.currencyCode,
        payoutCurrency: offering.data.payout.currencyCode,
        payinMethods: offering.data.payin.methods,
        payoutMethods: offering.data.payout.methods,
        requiredClaims: offering.data.requiredClaims,
        offering
      }));

      res.status(200).json(filteredOfferings);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Endpoint to fetch offerings
  app.post('/offerings', async (req, res) => {
    const { offering, amount, payoutPaymentDetails, customerCredentials, customerDid, payinPaymentDetails } = req.body;

    if (!offering || !amount || !payoutPaymentDetails || !customerCredentials || !customerDid) {
      return res.status(400).json({ error: 'All fields (offering, amount, payoutPaymentDetails, customerCredentials, customerDid) are required' });
    }

    try {
      const exchange = await CreateExchange(offering, amount, payoutPaymentDetails, customerCredentials, customerDid, payinPaymentDetails);
      console.log('Exchange:', exchange);
      res.status(200).json(exchange);
    } catch (err) {
      console.log(err)
      res.status(500).json({ "error-offerings": err });
    }
  });

  // Start the server
  app.listen(PORT, (error) => {
    if (error) {
      console.log('Error starting the server');
      return;
    }
    console.log(`Server is running on port ${PORT} 🚀\nPocketBase: ${process.env.POCKETBASE_URL}`);
  });
})();