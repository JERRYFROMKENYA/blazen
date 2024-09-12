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
  const PocketBase = (await import('pocketbase')).default;
  const { Close, Order, Rfq, TbdexHttpClient } = await import('@tbdex/http-client');
  const { Jwt, PresentationExchange } = await import('@web5/credentials');
  const pb = new PocketBase(process.env.POCKETBASE_URL);

  /*
  *Imports End here( I don't think any of your problems are above
  *  this line unless you are having problems with dot env)
  *
  *
  *Functions Start Here
  *
  *
  * */

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

   // Fetch the first list item from the collection
    const payinMethodItem = await pb.collection("internal_payment_methods").getFirstListItem(`name="${offering.data.payin.methods[0].kind}"`);
    const payinMethod = payinMethodItem.payload;


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
          paymentDetails: payinMethod,
        },
        payout: {
          kind: offering.data.payout.methods[0].kind,
          paymentDetails: payoutPaymentDetails,
        },

        claims: selectedCredentials
      }
    });
    console.log(
        {
          kind: offering.data.payin.methods[0].kind,
          paymentDetails: payinMethod,
        }

    )

    try {
      await rfq.verifyOfferingRequirements(offering);
    } catch (e) {
      throw new Error ('Offering requirements not met', e)
      // console.log('Offering requirements not met', e);
    }

    await rfq.sign(customerDid);

    console.log('RFQ:', rfq);


    try {
      await TbdexHttpClient.createExchange(rfq);
      if(rfq){
        const cust_did_item = await pb.collection('customer_did').getFirstListItem(`did.uri="${cDid.uri}"`);
        const cust_did = cust_did_item.id;
        const pfi_did_item = await pb.collection('pfi').getFirstListItem(`did= "${offering.metadata.from}"`);
        const pfi_did = pfi_did_item.id;

        const data = {
          "did": cust_did,
          "pfi": pfi_did,
          rfq,
          "exchangeId": rfq.metadata.exchangeId,
          "reason": "pending",
          "status": "pending"
        };

        const record = await pb.collection('customer_quotes').create(data);
        if(record) console.log('Record created successfully:');
      }
      return rfq;
    } catch (error) {
      console.error('Failed to create exchange:', error);
      // return ('Failed to create exchange:', error)
      throw new Error('Failed to create exchange: ' + error.message);
    }
  };



  //fetch exchanges

  const FetchExchanges = async (customerDid, pfiUri) => {
    const custDid = await DidDht.import({ portableDid: customerDid })
    try {
      const exchanges = await TbdexHttpClient.getExchanges({
        pfiDid:pfiUri,
        did:custDid,
      });
      // const mappedExchanges =formatMessages(exchanges)
      return exchanges;
    }catch (e) {
      throw new Error('Failed to fetch exchanges: ' + e.message);
    }

  }



  const FetchExchange = async (customerDid, pfiUri, exId) => {
    const custDid = await DidDht.import({ portableDid: customerDid })
    try {
      const exchange = await TbdexHttpClient.getExchange({
        pfiDid:pfiUri,
        did:custDid,
        exchangeId:exId
      });

      return exchange;
    }catch (e) {
      throw new Error('Failed to fetch exchanges: ' + e.message);
    }

  }

const FetchAllExchanges = async (customerDid) => {
  const custDid = await DidDht.import({ portableDid: customerDid });
  const pfis = await pb.collection('pfi').getFullList();
  const exchanges = [];

  try {
    for (const pfi of pfis) {
      const pfiUri = pfi.did;
      const pfiName = pfi.name;
      const pfiExchanges = await TbdexHttpClient.getExchanges({
        pfiDid: pfiUri,
        did: custDid,
      });

      // Add PFI name to each exchange
      const modifiedExchanges = pfiExchanges.map(exchange => ({
        ...exchange,
        name: pfiName,
      }));

      exchanges.push(...modifiedExchanges);
    }

    return exchanges;
  } catch (e) {
    throw new Error('Failed to fetch exchanges: ' + e.message);
  }
};






  const AddClose = async (exchangeId, custDid, pfiUri,reason) => {
    const customerDid = await DidDht.import({ portableDid: custDid })
    try {
      const close = Close.create({
        metadata: {
          from: customerDid.uri,
          to: pfiUri,
          protocol: '1.0',
          exchangeId: exchangeId
        },
        data:{
          reason
        }
      });



      await close.sign(customerDid);



      await TbdexHttpClient.submitClose(close);
      const quote_item= await pb.collection('customer_quotes').getFirstListItem(`exchangeId= "${exchangeId}"`);
      const quote_id = quote_item.id;
      const data = {
        "reason": reason,
        "status": "cancelled"
      };

      const record = await pb.collection('customer_quotes').update(quote_id, data);
      if(record) console.log('Record updated successfully:');


      return close;
    } catch (e) {
      throw new Error('Failed to close exchange: ' + e.message);
    }
  }



  const AddOrder = async (exchangeId,custDid,  pfiUri) => {
    const customerDid = await DidDht.import({ portableDid: custDid })
    const order = Order.create({
      metadata: {
        from: customerDid.uri,
        to: pfiUri,
        protocol: '1.0',
        exchangeId: exchangeId
      }
        });

    await order.sign(customerDid);
    try{
        await TbdexHttpClient.submitOrder(order);
      // Use cDidString in the query
      const quote_item= await pb.collection('customer_quotes').getFirstListItem(`exchangeId= "${exchangeId}"`);
      const quote_id = quote_item.id;
      const data = {
        "reason": "success",
        "status": "completed"
      };

      const record = await pb.collection('customer_quotes').update(quote_id, data);
      if(record) console.log('Record updated successfully:');
        return order;
    }catch (e) {
        throw new Error('Failed to submit order: ' + e.message);
    }

  }



  /*Functions End Here
  *
  *
  * Endpoints Start Here
  * */


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
  app.get('/mock-dids-data', async (req, res) => {
    try {
      const offerings = await fetchOfferings();
      const filteredOfferings = await Promise.all(
          offerings.map(async offering => {
                // const pfi = await pb.collection('pfi').getFirstListItem(`did= "${offering.metadata.from}"`);
                return {
                  // name: pfi.name,
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
                };
              })
      );

      console.log('Filtered offerings:', filteredOfferings);
      res.status(200).json(filteredOfferings);
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

const filteredOfferings = await Promise.all(
  offerings
    .filter(offering =>
      offering.data.payin.currencyCode === payinCurrency &&
      offering.data.payout.currencyCode === payoutCurrency
    )
    .map(async offering => {
      const pfi = await pb.collection('pfi').getFirstListItem(`did= "${offering.metadata.from}"`);
      return {
        name: pfi.name,
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
      };
    })
);

console.log('Filtered offerings:', filteredOfferings);
res.status(200).json(filteredOfferings);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Endpoint to fetch offerings
  app.post('/offerings', async (req, res) => {
    const { offering,
      amount,
      payoutPaymentDetails,
      customerCredentials,
      customerDid,
      payinPaymentDetails } = req.body;

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





  // Endpoint to fetch exchanges
  app.post('/get-exchanges', async (req, res) => {

    const { customerDid, pfiUri } = req.body;


    if (!pfiUri || !customerDid) {
      return res.status(400).json({ error: 'All fields (pfiUri, customerDid) are required' });
    }

    try {
      const exchanges = await FetchExchanges(customerDid,pfiUri);
      console.log('Exchanges:', exchanges);
      res.status(200).json(exchanges);
    } catch (err) {
      console.log(err)
      res.status(500).json({ "error-offerings": err });
    }
  });



    // Endpoint to fetch exchange
  app.post('/get-exchange', async (req, res) => {

    const { customerDid, pfiUri, exchangeId } = req.body;


    if (!pfiUri || !customerDid ||!exchangeId) {
      return res.status(400).json({ error: 'All fields (pfiUri, customerDid, exchangeId) are required' });
    }

    try {
      const exchange = await FetchExchange(customerDid,pfiUri, exchangeId);
      console.log('Exchange:', exchange);
      res.status(200).json(exchange);
    } catch (err) {
      console.log(err)
      res.status(500).json({ "error-offerings": err });
    }
  });
  //all user exchanges
  app.post('/get-all-exchanges', async (req, res) => {

    const { customerDid} = req.body;


    if ( !customerDid ) {
      return res.status(400).json({ error: 'All fields ( customerDid) are required' });
    }

    try {
      const exchange = await FetchAllExchanges(customerDid);
      console.log('Exchange:', exchange);
      res.status(200).json(exchange);
    } catch (err) {
      console.log(err)
      res.status(500).json({ "error-offerings": err });
    }
  });

  // Endpoint to send a  close message to exchange

  app.post('/close', async (req, res) => {

    const { customerDid, pfiUri, exchangeId, reason } = req.body;


    if (!pfiUri || !customerDid ||!exchangeId) {
      return res.status(400).json({ error: 'All fields (pfiUri, customerDid, exchangeId) are required' });
    }

    try {
      const close = await AddClose(exchangeId, customerDid, pfiUri, reason||"");
      console.log('Close:', close);
      res.status(200).json(close);
    } catch (err) {
      console.log(err)
      res.status(500).json({ "error-offerings": err });
    }
  });

  app.post('/order', async (req, res) => {

    const { customerDid, pfiUri, exchangeId } = req.body;


    if (!pfiUri || !customerDid ||!exchangeId) {
      return res.status(400).json({ error: 'All fields (pfiUri, customerDid, exchangeId) are required' });
    }

    try {
      const order = await AddOrder(exchangeId, customerDid, pfiUri);
      console.log('Order:', order);
      res.status(200).json(order);
    } catch (err) {
      console.log(err)
      res.status(500).json({ "error-offerings": err });
    }
  });




  /*
  * Endpoints End Here
  *
  * Server Starts Serving Here
  * (If you are experiencing any problems I promise its not below this line)
  * */


  // Start the server
  app.listen(PORT, (error) => {
    if (error) {
      console.log('Error starting the server');
      return;
    }
    console.log(`Server is running on port ${PORT} 🚀\nPocketBase: ${process.env.POCKETBASE_URL}`);
  });
})();