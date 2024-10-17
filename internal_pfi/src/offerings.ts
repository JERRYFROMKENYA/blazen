import { OfferingsApi, Offering, OfferingData } from '@tbdex/http-server'
import { config } from './config.js'
// import fs from 'fs/promises'
import { PresentationExchange } from '@web5/credentials'
import { issuerDid } from './credential-issuer.js'
import { BearerDid } from '@web5/dids'

// load issuer's did from a file called issuer-did.txt
const issuer = issuerDid




export const offeringDataUSDToUSD: OfferingData = {
  description: `Send USD to a NexX User`,
  payoutUnitsPerPayinUnit: '1',
  payout: {
    currencyCode: 'USD',
    methods: [
      {
        kind: 'NexX Wallet',
        estimatedSettlementTime: 80, // 80 seconds
        requiredPaymentDetails: {
          '$schema': 'http://json-schema.org/draft-07/schema#',
          'title': 'NexX Username',
          'type': 'object',
          'required': ['address'],
          'additionalProperties': false,
          'properties': {
            'address': {
              'title': 'NexX Username',
              'description': 'NexX Username to send USD to',
              'type': 'string'
            },
          }
        }
      },
    ],
  },
  payin: {
    currencyCode: 'USD',
    methods: [
      {
        kind: 'STORED_BALANCE',
        requiredPaymentDetails: {},
      },
    ],
  },
  requiredClaims: {
    id: '7ce4004c-3c38-4853-968b-e411bafcd945',
    format: {
      jwt_vc: {
        alg: ['ES256K', 'EdDSA']
      }
    },
    input_descriptors: [
      {
        id: 'bbdb9b7c-5754-4f46-b63b-590bada959e0',
        constraints: {
          fields: [
            {
              path: ['$.type[*]'],
              filter: {
                type: 'string',
                const: 'KnownCustomerCredential',
              },
            },
            {
              path: ['$.issuer'],
              filter: {
                type: 'string',
                const: issuer,
              },
            },
          ],
        },
      },
    ],
  },
}

export const offeringDataEURToEUR: OfferingData = {
  description: `Send EUR to a NexX User`,
  payoutUnitsPerPayinUnit: '1',
  payout: {
    currencyCode: 'EUR',
    methods: [
      {
        kind: 'NexX Wallet',
        estimatedSettlementTime: 80, // 80 seconds
        requiredPaymentDetails: {
          '$schema': 'http://json-schema.org/draft-07/schema#',
          'title': 'NexX Username',
          'type': 'object',
          'required': ['address'],
          'additionalProperties': false,
          'properties': {
            'address': {
              'title': 'NexX Username',
              'description': 'NexX Username to send EUR to',
              'type': 'string'
            },
          }
        }
      },
    ],
  },
  payin: {
    currencyCode: 'EUR',
    methods: [
      {
        kind: 'STORED_BALANCE',
        requiredPaymentDetails: {},
      },
    ],
  },
  requiredClaims: {
    id: '8ce4004c-3c38-4853-968b-e411bafcd946',
    format: {
      jwt_vc: {
        alg: ['ES256K', 'EdDSA']
      }
    },
    input_descriptors: [
      {
        id: 'ccdb9b7c-5754-4f46-b63b-590bada959e1',
        constraints: {
          fields: [
            {
              path: ['$.type[*]'],
              filter: {
                type: 'string',
                const: 'KnownCustomerCredential',
              },
            },
            {
              path: ['$.issuer'],
              filter: {
                type: 'string',
                const: issuer,
              },
            },
          ],
        },
      },
    ],
  },
}

export const offeringDataGBPToGBP: OfferingData = {
  description: `Send GBP to a NexX User`,
  payoutUnitsPerPayinUnit: '1',
  payout: {
    currencyCode: 'GBP',
    methods: [
      {
        kind: 'NexX Wallet',
        estimatedSettlementTime: 80, // 80 seconds
        requiredPaymentDetails: {
          '$schema': 'http://json-schema.org/draft-07/schema#',
          'title': 'NexX Username',
          'type': 'object',
          'required': ['address'],
          'additionalProperties': false,
          'properties': {
            'address': {
              'title': 'NexX Username',
              'description': 'NexX Username to send GBP to',
              'type': 'string'
            },
          }
        }
      },
    ],
  },
  payin: {
    currencyCode: 'GBP',
    methods: [
      {
        kind: 'STORED_BALANCE',
        requiredPaymentDetails: {},
      },
    ],
  },
  requiredClaims: {
    id: '9ce4004c-3c38-4853-968b-e411bafcd947',
    format: {
      jwt_vc: {
        alg: ['ES256K', 'EdDSA']
      }
    },
    input_descriptors: [
      {
        id: 'dddb9b7c-5754-4f46-b63b-590bada959e2',
        constraints: {
          fields: [
            {
              path: ['$.type[*]'],
              filter: {
                type: 'string',
                const: 'KnownCustomerCredential',
              },
            },
            {
              path: ['$.issuer'],
              filter: {
                type: 'string',
                const: issuer,
              },
            },
          ],
        },
      },
    ],
  },
}

export const offeringDataJPYToJPY: OfferingData = {
  description: `Send JPY to a NexX User`,
  payoutUnitsPerPayinUnit: '1',
  payout: {
    currencyCode: 'JPY',
    methods: [
      {
        kind: 'NexX Wallet',
        estimatedSettlementTime: 80, // 80 seconds
        requiredPaymentDetails: {
          '$schema': 'http://json-schema.org/draft-07/schema#',
          'title': 'NexX Username',
          'type': 'object',
          'required': ['address'],
          'additionalProperties': false,
          'properties': {
            'address': {
              'title': 'NexX Username',
              'description': 'NexX Username to send JPY to',
              'type': 'string'
            },
          }
        }
      },
    ],
  },
  payin: {
    currencyCode: 'JPY',
    methods: [
      {
        kind: 'STORED_BALANCE',
        requiredPaymentDetails: {},
      },
    ],
  },
  requiredClaims: {
    id: '10ce4004c-3c38-4853-968b-e411bafcd948',
    format: {
      jwt_vc: {
        alg: ['ES256K', 'EdDSA']
      }
    },
    input_descriptors: [
      {
        id: 'eedb9b7c-5754-4f46-b63b-590bada959e3',
        constraints: {
          fields: [
            {
              path: ['$.type[*]'],
              filter: {
                type: 'string',
                const: 'KnownCustomerCredential',
              },
            },
            {
              path: ['$.issuer'],
              filter: {
                type: 'string',
                const: issuer,
              },
            },
          ],
        },
      },
    ],
  },
}

export const offeringDataCADToCAD: OfferingData = {
  description: `Send CAD to a NexX User`,
  payoutUnitsPerPayinUnit: '1',
  payout: {
    currencyCode: 'CAD',
    methods: [
      {
        kind: 'NexX Wallet',
        estimatedSettlementTime: 80, // 80 seconds
        requiredPaymentDetails: {
          '$schema': 'http://json-schema.org/draft-07/schema#',
          'title': 'NexX Username',
          'type': 'object',
          'required': ['address'],
          'additionalProperties': false,
          'properties': {
            'address': {
              'title': 'NexX Username',
              'description': 'NexX Username to send CAD to',
              'type': 'string'
            },
          }
        }
      },
    ],
  },
  payin: {
    currencyCode: 'CAD',
    methods: [
      {
        kind: 'STORED_BALANCE',
        requiredPaymentDetails: {},
      },
    ],
  },
  requiredClaims: {
    id: '11ce4004c-3c38-4853-968b-e411bafcd949',
    format: {
      jwt_vc: {
        alg: ['ES256K', 'EdDSA']
      }
    },
    input_descriptors: [
      {
        id: 'ccdb9b7c-5754-4f46-b63b-590bada959e4',
        constraints: {
          fields: [
            {
              path: ['$.type[*]'],
              filter: {
                type: 'string',
                const: 'KnownCustomerCredential',
              },
            },
            {
              path: ['$.issuer'],
              filter: {
                type: 'string',
                const: issuer,
              },
            },
          ],
        },
      },
    ],
  },
}

export const offeringDataAUDToAUD: OfferingData = {
  description: `Send AUD to a NexX User`,
  payoutUnitsPerPayinUnit: '1',
  payout: {
    currencyCode: 'AUD',
    methods: [
      {
        kind: 'NexX Wallet',
        estimatedSettlementTime: 80, // 80 seconds
        requiredPaymentDetails: {
          '$schema': 'http://json-schema.org/draft-07/schema#',
          'title': 'NexX Username',
          'type': 'object',
          'required': ['address'],
          'additionalProperties': false,
          'properties': {
            'address': {
              'title': 'NexX Username',
              'description': 'NexX Username to send AUD to',
              'type': 'string'
            },
          }
        }
      },
    ],
  },
  payin: {
    currencyCode: 'AUD',
    methods: [
      {
        kind: 'STORED_BALANCE',
        requiredPaymentDetails: {},
      },
    ],
  },
  requiredClaims: {
    id: '12ce4004c-3c38-4853-968b-e411bafcd950',
    format: {
      jwt_vc: {
        alg: ['ES256K', 'EdDSA']
      }
    },
    input_descriptors: [
      {
        id: 'ffdb9b7c-5754-4f46-b63b-590bada959e5',
        constraints: {
          fields: [
            {
              path: ['$.type[*]'],
              filter: {
                type: 'string',
                const: 'KnownCustomerCredential',
              },
            },
            {
              path: ['$.issuer'],
              filter: {
                type: 'string',
                const: issuer,
              },
            },
          ],
        },
      },
    ],
  },
}

export const offeringDataNZDToNZD: OfferingData = {
  description: `Send NZD to a NexX User`,
  payoutUnitsPerPayinUnit: '1',
  payout: {
    currencyCode: 'NZD',
    methods: [
      {
        kind: 'NexX Wallet',
        estimatedSettlementTime: 80, // 80 seconds
        requiredPaymentDetails: {
          '$schema': 'http://json-schema.org/draft-07/schema#',
          'title': 'NexX Username',
          'type': 'object',
          'required': ['address'],
          'additionalProperties': false,
          'properties': {
            'address': {
              'title': 'NexX Username',
              'description': 'NexX Username to send NZD to',
              'type': 'string'
            },
          }
        }
      },
    ],
  },
  payin: {
    currencyCode: 'NZD',
    methods: [
      {
        kind: 'STORED_BALANCE',
        requiredPaymentDetails: {},
      },
    ],
  },
  requiredClaims: {
    id: '13ce4004c-3c38-4853-968b-e411bafcd951',
    format: {
      jwt_vc: {
        alg: ['ES256K', 'EdDSA']
      }
    },
    input_descriptors: [
      {
        id: 'ggdb9b7c-5754-4f46-b63b-590bada959e6',
        constraints: {
          fields: [
            {
              path: ['$.type[*]'],
              filter: {
                type: 'string',
                const: 'KnownCustomerCredential',
              },
            },
            {
              path: ['$.issuer'],
              filter: {
                type: 'string',
                const: issuer,
              },
            },
          ],
        },
      },
    ],
  },
}

export const offeringDataCHFToCHF: OfferingData = {
  description: `Send CHF to a NexX User`,
  payoutUnitsPerPayinUnit: '1',
  payout: {
    currencyCode: 'CHF',
    methods: [
      {
        kind: 'NexX Wallet',
        estimatedSettlementTime: 80, // 80 seconds
        requiredPaymentDetails: {
          '$schema': 'http://json-schema.org/draft-07/schema#',
          'title': 'NexX Username',
          'type': 'object',
          'required': ['address'],
          'additionalProperties': false,
          'properties': {
            'address': {
              'title': 'NexX Username',
              'description': 'NexX Username to send CHF to',
              'type': 'string'
            },
          }
        }
      },
    ],
  },
  payin: {
    currencyCode: 'CHF',
    methods: [
      {
        kind: 'STORED_BALANCE',
        requiredPaymentDetails: {},
      },
    ],
  },
  requiredClaims: {
    id: '14ce4004c-3c38-4853-968b-e411bafcd952',
    format: {
      jwt_vc: {
        alg: ['ES256K', 'EdDSA']
      }
    },
    input_descriptors: [
      {
        id: 'hhdb9b7c-5754-4f46-b63b-590bada959e7',
        constraints: {
          fields: [
            {
              path: ['$.type[*]'],
              filter: {
                type: 'string',
                const: 'KnownCustomerCredential',
              },
            },
            {
              path: ['$.issuer'],
              filter: {
                type: 'string',
                const: issuer,
              },
            },
          ],
        },
      },
    ],
  },
}
export const offeringDataSGDToSGD: OfferingData = {
  description: `Send SGD to a NexX User`,
  payoutUnitsPerPayinUnit: '1',
  payout: {
    currencyCode: 'SGD',
    methods: [
      {
        kind: 'NexX Wallet',
        estimatedSettlementTime: 80, // 80 seconds
        requiredPaymentDetails: {
          '$schema': 'http://json-schema.org/draft-07/schema#',
          'title': 'NexX Username',
          'type': 'object',
          'required': ['address'],
          'additionalProperties': false,
          'properties': {
            'address': {
              'title': 'NexX Username',
              'description': 'NexX Username to send SGD to',
              'type': 'string'
            },
          }
        }
      },
    ],
  },
  payin: {
    currencyCode: 'SGD',
    methods: [
      {
        kind: 'STORED_BALANCE',
        requiredPaymentDetails: {},
      },
    ],
  },
  requiredClaims: {
    id: '15ce4004c-3c38-4853-968b-e411bafcd953',
    format: {
      jwt_vc: {
        alg: ['ES256K', 'EdDSA']
      }
    },
    input_descriptors: [
      {
        id: 'iidd9b7c-5754-4f46-b63b-590bada959e8',
        constraints: {
          fields: [
            {
              path: ['$.type[*]'],
              filter: {
                type: 'string',
                const: 'KnownCustomerCredential',
              },
            },
            {
              path: ['$.issuer'],
              filter: {
                type: 'string',
                const: issuer,
              },
            },
          ],
        },
      },
    ],
  },
}
export const offeringDataHKDToHKD: OfferingData = {
  description: `Send HKD to a NexX User`,
  payoutUnitsPerPayinUnit: '1',
  payout: {
    currencyCode: 'HKD',
    methods: [
      {
        kind: 'NexX Wallet',
        estimatedSettlementTime: 80, // 80 seconds
        requiredPaymentDetails: {
          '$schema': 'http://json-schema.org/draft-07/schema#',
          'title': 'NexX Username',
          'type': 'object',
          'required': ['address'],
          'additionalProperties': false,
          'properties': {
            'address': {
              'title': 'NexX Username',
              'description': 'NexX Username to send HKD to',
              'type': 'string'
            },
          }
        }
      },
    ],
  },
  payin: {
    currencyCode: 'HKD',
    methods: [
      {
        kind: 'STORED_BALANCE',
        requiredPaymentDetails: {},
      },
    ],
  },
  requiredClaims: {
    id: '16ce4004c-3c38-4853-968b-e411bafcd954',
    format: {
      jwt_vc: {
        alg: ['ES256K', 'EdDSA']
      }
    },
    input_descriptors: [
      {
        id: 'jjdb9b7c-5754-4f46-b63b-590bada959e9',
        constraints: {
          fields: [
            {
              path: ['$.type[*]'],
              filter: {
                type: 'string',
                const: 'KnownCustomerCredential',
              },
            },
            {
              path: ['$.issuer'],
              filter: {
                type: 'string',
                const: issuer,
              },
            },
          ],
        },
      },
    ],
  },
}
export const offeringDataKESToKES: OfferingData = {
  description: `Send KES to a NexX User`,
  payoutUnitsPerPayinUnit: '1',
  payout: {
    currencyCode: 'KES',
    methods: [
      {
        kind: 'NexX Wallet',
        estimatedSettlementTime: 80, // 80 seconds
        requiredPaymentDetails: {
          '$schema': 'http://json-schema.org/draft-07/schema#',
          'title': 'NexX Username',
          'type': 'object',
          'required': ['address'],
          'additionalProperties': false,
          'properties': {
            'address': {
              'title': 'NexX Username',
              'description': 'NexX Username to send KES to',
              'type': 'string'
            },
          }
        }
      },
    ],
  },
  payin: {
    currencyCode: 'KES',
    methods: [
      {
        kind: 'STORED_BALANCE',
        requiredPaymentDetails: {},
      },
    ],
  },
  requiredClaims: {
    id: '16ce4004c-3c38-4853-968b-e411bafcd954',
    format: {
      jwt_vc: {
        alg: ['ES256K', 'EdDSA']
      }
    },
    input_descriptors: [
      {
        id: 'jjdb9b7c-5754-4f46-b63b-590bada959e9',
        constraints: {
          fields: [
            {
              path: ['$.type[*]'],
              filter: {
                type: 'string',
                const: 'KnownCustomerCredential',
              },
            },
            {
              path: ['$.issuer'],
              filter: {
                type: 'string',
                const: issuer,
              },
            },
          ],
        },
      },
    ],
  },
}

const customOfferings = [
  { ...offeringDataUSDToUSD } ,
  { ...offeringDataEURToEUR } ,
  {  ...offeringDataGBPToGBP } ,
  {  ...offeringDataJPYToJPY } ,
  {  ...offeringDataCADToCAD  },
  {  ...offeringDataAUDToAUD  },
  { ...offeringDataNZDToNZD  },
  {  ...offeringDataCHFToCHF  },
  {  ...offeringDataSGDToSGD  },
  {  ...offeringDataHKDToHKD  },
  {  ...offeringDataKESToKES  }
]




// Function to create a randomized offering
async function createRandomOffering(index: number): Promise<Offering> {

  // const selectedExchangeRate = fakeExchangeRates[Math.floor(Math.random() * fakeExchangeRates.length)].toString()
  const customPFIIndex = 0 // 5 is number of hardcoded PFI DIDs
  const offering = Offering.create({
    metadata: {
      from: config.pfiDid[customPFIIndex].uri,  // Alternates between two URIs
      protocol: '1.0'
    },
    data: customOfferings[index] //chooseRandomOfferingData(customPFIIndex),
  })

  try {
    await offering.sign(config.pfiDid[customPFIIndex])
    // console.log('Offering signed')
  }
  catch (e) {
    console.log('error', e)
  }
  // offering.sign(config.pfiDid[index % 5])  // Sign with alternating URI

  offering.validate()
  PresentationExchange.validateDefinition({
    presentationDefinition: offering.data.requiredClaims
  })

  // console.log(`Offering ${index + 1} created and validated`)
  return offering
}

// Initialize an array of hardcoded offerings
const hardcodedOfferings: Offering[] = await Promise.all(Array.from({ length: 11 }, (_, i) => createRandomOffering(i)))

export class HardcodedOfferingRepository implements OfferingsApi {
  pfi: BearerDid
  pfiHardcodedOfferings: Offering[]

  constructor(pfi: BearerDid) {
    this.pfi = pfi
    this.pfiHardcodedOfferings = hardcodedOfferings.filter((offering) => offering.metadata.from === pfi.uri)
  }
  // Retrieve a single offering if found
  async getOffering(opts: { id: string }): Promise<Offering | undefined> {
    console.log('call for offerings')
    return this.pfiHardcodedOfferings.find((offering) => offering.id === opts.id)
  }

  // Retrieve a list of offerings
  async getOfferings(): Promise<Offering[] | undefined> {
    console.log('get PFI offerings')
    return this.pfiHardcodedOfferings
  }
}

// Export an instance of the repository
// export const OfferingRepository = new HardcodedOfferingRepository()
