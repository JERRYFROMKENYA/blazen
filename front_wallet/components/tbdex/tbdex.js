import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { TbdexHttpClient } from '@tbdex/http-client';
import { DidDht } from '@web5/dids';
import { Jwt, PresentationExchange } from '@web5/credentials';

const mockProviderDids = {
  aquafinance_capital: {
    uri: 'did:dht:3fkz5ssfxbriwks3iy5nwys3q5kyx64ettp9wfn1yfekfkiguj1y',
    name: 'AquaFinance Capital',
    description: 'Provides exchanges with the Ghanaian Cedis: GHS to USDC, GHS to KES',
    currencies: ["GHS_USDC", "NGN_USDC", "KES_USD", "USD_KES"]
  },
  flowback_financial: {
    uri: 'did:dht:zkp5gbsqgzn69b3y5dtt5nnpjtdq6sxyukpzo68npsf79bmtb9zy',
    name: 'Flowback Financial',
    description: 'Offers international rates with various currencies - USD to GBP, GBP to CAD.',
    currencies: ["USD_EUR", "EUR_USD", "USD_GBP", "USD_BTC"]
  },
  vertex_liquid_assets: {
    uri: 'did:dht:enwguxo8uzqexq14xupe4o9ymxw3nzeb9uug5ijkj9rhfbf1oy5y',
    name: 'Vertex Liquid Assets',
    description: 'Offers currency exchanges between African currencies - MAD to EGP, GHS to NGN.',
    currencies: ["EUR_USD", "EUR_USDC", "USD_EUR", "EUR_GBP"]
  },
  titanium_trust: {
    uri: 'did:dht:ozn5c51ruo7z63u1h748ug7rw5p1mq3853ytrd5gatu9a8mm8f1o',
    name: 'Titanium Trust',
    description: 'Provides offerings to exchange USD to African currencies - USD to GHS, USD to KES.',
    currencies: ["USD_AUD", "USD_GBP", "USD_KES", "USD_MXN"]
  }
};

const useStore = () => {
  const [balance, setBalance] = useState(parseFloat(localStorage.getItem('walletBalance')) || 100);
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [pfiAllowlist, setPfiAllowlist] = useState(Object.keys(mockProviderDids).map(key => ({
    pfiUri: mockProviderDids[key].uri,
    pfiName: mockProviderDids[key].name,
    pfiDescription: mockProviderDids[key].description,
  })));
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [offering, setOffering] = useState(null);
  const [payinCurrencies, setPayinCurrencies] = useState([]);
  const [payoutCurrencies, setPayoutCurrencies] = useState([]);
  const [offerings, setOfferings] = useState([]);
  const [customerDid, setCustomerDid] = useState(null);
  const [customerCredentials, setCustomerCredentials] = useState([]);

  useEffect(() => {
    const fetchOfferings = async () => {
      try {
        const allOfferings = [];
        for (const pfi of pfiAllowlist) {
          const pfiUri = pfi.pfiUri;
          const offerings = await TbdexHttpClient.getOfferings({ pfiDid: pfiUri });
          allOfferings.push(...offerings);
        }
        setOfferings(allOfferings);
        updateCurrencies(allOfferings);
      } catch (error) {
        // console.error('Failed to fetch offerings:', error);
      }
    };

    const initializeDid = async () => {
      try {
        const storedDid = localStorage.getItem('customerDid');
        if (storedDid) {
          setCustomerDid(await DidDht.import({ portableDid: JSON.parse(storedDid) }));
        } else {
          const newDid = await DidDht.create({ options: { publish: true } });
          setCustomerDid(newDid);
          const exportedDid = await newDid.export();
          localStorage.setItem('customerDid', JSON.stringify(exportedDid));
        }
      } catch (error) {
        // console.error('Failed to initialize DID:', error);
      }
    };

    const loadCredentials = () => {
      const storedCredentials = localStorage.getItem('customerCredentials');
      if (storedCredentials) {
        setCustomerCredentials(JSON.parse(storedCredentials));
      } else {
        console.log('No credentials exist');
      }
    };

    fetchOfferings();
    initializeDid();
    loadCredentials();
  }, [pfiAllowlist]);

  useEffect(() => {
    localStorage.setItem('walletBalance', balance.toString());
  }, [balance]);

  const updateCurrencies = (offerings) => {
    const payinCurrencies = new Set();
    const payoutCurrencies = new Set();

    offerings.forEach(offering => {
      payinCurrencies.add(offering.data.payin.currencyCode);
      payoutCurrencies.add(offering.data.payout.currencyCode);
    });

    setPayinCurrencies(Array.from(payinCurrencies));
    setPayoutCurrencies(Array.from(payoutCurrencies));
  };

  const createExchange = async (offering, amount, payoutPaymentDetails) => {
    const selectedCredentials = [];
    const rfq = {};

    try {
      // Verify offering requirements with RFQ
    } catch (e) {
      console.log('Offering requirements not met', e);
    }

    try {
      // Submit RFQ message to the PFI
    } catch (error) {
      // console.error('Failed to create exchange:', error);
    }
  };

  const fetchExchanges = async (pfiUri) => {
    try {
      const exchanges = [];
      const mappedExchanges = formatMessages(exchanges);
      return mappedExchanges;
    } catch (error) {
      // console.error('Failed to fetch exchanges:', error);
    }
  };

  const addClose = async (exchangeId, pfiUri, reason) => {
    const close = {};

    try {
      // Send Close message
    } catch (error) {
      // console.error('Failed to close exchange:', error);
    }
  };

  const addOrder = async (exchangeId, pfiUri) => {
    const order = {};

    try {
      // Send order message
    } catch (error) {
      // console.error('Failed to submit order:', error);
    }
  };

  const pollExchanges = () => {
    const fetchAllExchanges = async () => {
      if (!customerDid) return;
      const allExchanges = [];
      try {
        for (const pfi of pfiAllowlist) {
          const exchanges = await fetchExchanges(pfi.pfiUri);
          allExchanges.push(...exchanges);
        }
        updateExchanges(allExchanges.reverse());
        setTransactionsLoading(false);
      } catch (error) {
        // console.error('Failed to fetch exchanges:', error);
      }
    };

    fetchAllExchanges();
    setInterval(fetchAllExchanges, 5000);
  };

  const formatMessages = (exchanges) => {
    return exchanges.map(exchange => {
      const latestMessage = exchange[exchange.length - 1];
      const rfqMessage = exchange.find(message => message.kind === 'rfq');
      const quoteMessage = exchange.find(message => message.kind === 'quote');
      const status = generateExchangeStatusValues(latestMessage);
      const fee = quoteMessage?.data['payin']?.['fee'];
      const payinAmount = quoteMessage?.data['payin']?.['amount'];
      const payoutPaymentDetails = rfqMessage.privateData?.payout.paymentDetails;
      return {
        id: latestMessage.metadata.exchangeId,
        payinAmount: (fee ? Number(payinAmount) + Number(fee) : Number(payinAmount)).toString() || rfqMessage.data['payinAmount'],
        payinCurrency: quoteMessage.data['payin']?.['currencyCode'] ?? null,
        payoutAmount: quoteMessage?.data['payout']?.['amount'] ?? null,
        payoutCurrency: quoteMessage.data['payout']?.['currencyCode'],
        status,
        createdTime: rfqMessage.createdAt,
        expirationTime: latestMessage.kind === 'quote' ? quoteMessage.data['expiresAt'] : null,
        from: 'You',
        to: payoutPaymentDetails?.address || payoutPaymentDetails?.accountNumber + ', ' + payoutPaymentDetails?.bankName || payoutPaymentDetails?.phoneNumber + ', ' + payoutPaymentDetails?.networkProvider || 'Unknown',
        pfiDid: rfqMessage.metadata.to
      };
    });
  };

  const generateExchangeStatusValues = (exchangeMessage) => {
    if (exchangeMessage instanceof Close) {
      if (exchangeMessage.data.reason.toLowerCase().includes('complete') || exchangeMessage.data.reason.toLowerCase().includes('success')) {
        return 'completed';
      } else if (exchangeMessage.data.reason.toLowerCase().includes('expired')) {
        return exchangeMessage.data.reason.toLowerCase();
      } else if (exchangeMessage.data.reason.toLowerCase().includes('cancelled')) {
        return 'cancelled';
      } else {
        return 'failed';
      }
    }
    return exchangeMessage.kind;
  };

  const renderOrderStatus = (exchange) => {
    const status = generateExchangeStatusValues(exchange);
    switch (status) {
      case 'rfq':
        return 'Requested';
      case 'quote':
        return 'Quoted';
      case 'order':
      case 'orderstatus':
        return 'Pending';
      case 'completed':
        return 'Completed';
      case 'expired':
        return 'Expired';
      case 'cancelled':
        return 'Cancelled';
      case 'failed':
        return 'Failed';
      default:
        return status;
    }
  };

  const selectTransaction = (transaction) => {
    setSelectedTransaction(transaction);
  };

  const deductAmount = (amount) => {
    const numericAmount = parseFloat(amount);
    if (!isNaN(numericAmount) && numericAmount > 0) {
      setBalance(prevBalance => prevBalance - numericAmount);
    }
  };

  const formatAmount = (amount) => {
    if (Math.abs(amount) >= 1) {
      return amount.toFixed(2);
    }
    const precision = Math.abs(amount) >= 0.01 ? 4 : 6;
    return parseFloat(amount.toFixed(precision)).toString();
  };

  const getOfferingById = (offeringId) => {
    const selectedOffering = offerings.find(offering => offering.id === offeringId);
    return selectedOffering;
  };

  const updateExchanges = (newTransactions) => {
    const existingExchangeIds = transactions.map(tx => tx.id);
    const updatedExchanges = [...transactions];

    newTransactions.forEach(newTx => {
      const existingTxIndex = updatedExchanges.findIndex(tx => tx.id === newTx.id);
      if (existingTxIndex > -1) {
        updatedExchanges[existingTxIndex] = newTx;
      } else {
        updatedExchanges.push(newTx);
      }
    });

    setTransactions(updatedExchanges);
  };

  return {
    state: {
      balance,
      transactions,
      transactionsLoading,
      pfiAllowlist,
      selectedTransaction,
      offering,
      payinCurrencies,
      payoutCurrencies,
      offerings,
      customerDid,
      customerCredentials
    },
    selectTransaction,
    setOffering,
    deductAmount,
    formatAmount,
    fetchOfferings,
    filterOfferings,
    satisfiesOfferingRequirements,
    addCredential,
    renderCredential,
    createExchange,
    fetchExchanges,
    renderOrderStatus,
    addOrder,
    addClose,
    getOfferingById,
    pollExchanges
  };
};

export default useStore;