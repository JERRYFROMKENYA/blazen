

<p align="center">
  <img src="https://i.imgur.com/VgfsXT7.png" alt="NexX Logo">
</p>

<h1 align="center"> NexX App </h1>

NexX is a decentralized financial app designed to empower users by giving full control over both digital and traditional currencies. Manage your funds effortlessly with a secure multi-currency wallet, send and receive money globally, and leverage our coin exchange technology powered by the tbDEX SDK. Whether you're an experienced trader or a first-time user, NexX simplifies decentralized finance and makes it accessible to everyone.

## 🧐 Key Features

- **Multi-Currency Wallets:** Store, manage, and exchange multiple currencies on one platform. Create new wallets or top up existing ones with ease.
- **Coin Exchange:** Trade currencies at competitive rates sourced directly from trusted Partnered Financial Institutions (PFIs). View live exchange rates and execute secure trades.
- **Money Transfers:** Send money globally with low fees and lightning-fast processing times. Stay updated with real-time transaction tracking.
- **Savings & Investments:** Convert savings into low-risk investments and earn interest.
- **User-Friendly Decentralization:** Manage Decentralized Identifiers (DIDs) and Verifiable Credentials (VCs) securely without technical knowledge.
- **Real-Time Ratings & Comments:** View aggregate ratings for financial institutions. Our backend system ensures only trusted providers are allow-listed for transactions.

## 🛠️ Tech Stack

- [Expo](https://expo.dev/)
- [Express.js](https://expressjs.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [React Native Paper](https://reactnativepaper.com/)
- [Pocketbase](https://pocketbase.io)

## 🔧 Installation Guide

### Install Dependencies

Ensure you use **Node.js**—Yarn may cause compatibility issues.

```bash
cd ./tbdex_comm_server
npm install
npm run start
cd ./front_wallet
npm install
npm run dev
```

### Install Binary

Currently available only for Android.

[Download Version 0.0.1](https://github.com/JERRYFROMKENYA/blazen/releases/tag/v0.0.1)

- Upon installation use email: "jerryanyumba@gmail.com" and password: "iwannagotothemoon"

## tbDEX Objectives and How NexX Achieves Them

### 1. Optionality
- **NexX** adapts to all **Preferred Financial Institutions (PFIs)**, allowing users to choose the PFI of their preference for every transaction, giving users the power of choice and flexibility.

### 2. Customer Management
- Users have full control over their **Decentralized Identifiers (DIDs)** and **Verifiable Credentials (VCs)**, giving them ownership of their identity and transactions.

### 3. Customer Satisfaction
- NexX includes a feedback mechanism that allows users to rate their experience at the end of each transaction (on a scale of 1 to 5), along with the option to leave a comment. This helps us continually improve the app and deliver the best possible user experience.

### 4. Profitability
- **Profitability** is achieved through transaction fees charged during money transfers, ensuring a sustainable model while providing value to the users.

## Additional Features

### Innovation
- **Bill Split**: The ability to create, join, and manage bills is a novel feature designed for ease of use, making bill splitting seamless for groups of friends, family, or colleagues.
- **Coin Exchange**: Changing currencies has never been easier, with PFIs facilitating secure and instant exchanges, giving customers a hassle-free experience.

### Stellar UI/UX
- Every function in NexX comes with a dedicated tab explaining what it does, making it intuitive for users to understand and use each feature.
- The user interface is designed for simplicity and effectiveness, ensuring that all controls are clear and easy to use.

### Functionality
- Every feature has been rigorously tested to ensure it works seamlessly, from sending money to exchanging coins. The straightforward controls make the app functional and accessible to all users.

## ➤ API Reference

Base URL: `http://138.197.89.72:3000/`

### Get DID DHT

```http
GET /dht
```
_No parameters required_

### GET DID JWT

```http
GET /jwk
```
_No parameters required_

### Get PFIs Using Currency Pairings

```http
POST /select-pfi
```

| Parameter   | Type     | Description                              |
| ----------- | -------- | ---------------------------------------- |
| `offering`  | `string` | **Required**. Selected currency pairings |

### Create Exchange

```http
POST /offerings
```

| Parameter             | Type     | Description                                     |
| --------------------- | -------- | ----------------------------------------------- |
| `offering`            | `string` | **Required**. PFI Offering Selected             |
| `amount`              | `string` | **Required**. Amount to be exchanged            |
| `payoutPaymentDetails`| `string` | **Required**. Payout details for this transaction |
| `customerDid`         | `string` | **Required**. Customer's Portable DID           |
| `customerCredentials` | `string` | **Required**. KCC in JWT form                   |

### Get Exchange Info

```http
POST /get-exchange
```

| Parameter      | Type     | Description                         |
| -------------- | -------- | ----------------------------------- |
| `pfiUri`       | `string` | **Required**. The PFI's DID URI     |
| `customerDid`  | `string` | **Required**. Customer's Portable DID |
| `exchangeId`   | `string` | **Required**. Exchange ID           |

### Get All User's Exchanges

```http
POST /get-all-exchanges
```

| Parameter      | Type     | Description                         |
| -------------- | -------- | ----------------------------------- |
| `customerDid`  | `string` | **Required**. Customer's Portable DID |

### Get User's Exchanges with a PFI

```http
POST /get-exchanges
```

| Parameter      | Type     | Description                         |
| -------------- | -------- | ----------------------------------- |
| `pfiUri`       | `string` | **Required**. The PFI's DID URI     |
| `customerDid`  | `string` | **Required**. Customer's Portable DID |

### Submit Order Message and Complete Transaction

```http
POST /order
```

| Parameter      | Type     | Description                         |
| -------------- | -------- | ----------------------------------- |
| `pfiUri`       | `string` | **Required**. The PFI's DID URI     |
| `customerDid`  | `string` | **Required**. Customer's Portable DID |
| `exchangeId`   | `string` | **Required**. Exchange ID           |

### Submit Close Message and Cancel a Transaction

```http
POST /close
```

| Parameter      | Type     | Description                         |
| -------------- | -------- | ----------------------------------- |
| `pfiUri`       | `string` | **Required**. The PFI's DID URI     |
| `customerDid`  | `string` | **Required**. Customer's Portable DID |
| `exchangeId`   | `string` | **Required**. Exchange ID           |
| `reason`       | `string` | **Required**. Reason for closing    |

## 🙇 Acknowledgements

- [tbDEX SDK](https://github.com/TBD54566975/tbdex-js)
- [tbDEX Documentation](https://developer.tbd.website/docs/tbdex/)
- [Build a Wallet Application with tbDEX](https://www.youtube.com/watch?v=KiJH2pgwh5U&feature=youtu.be)

## 🙇 Authors

- **Jerry Ochieng** - [Instagram](https://instagram.com/JERRYFROMKENYA)
- **Liz Wangui** - [Instagram](https://www.instagram.com/__kuuuiii_)

## ➤ License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

## 📷 Screenshots

<p align="center">
  <img src="https://i.imgur.com/zTah3Ot.png" alt="Screenshot 1">
  <img src="https://i.imgur.com/D8T5Dbl.png" alt="Screenshot 2">
  <img src="https://i.imgur.com/nx1aGa6.png" alt="Screenshot 3">
  <img src="https://i.imgur.com/k9cgL5a.png" alt="Screenshot 4">
  <img src="https://i.imgur.com/nx1aGa6.png" alt="Screenshot 5">
  <img src="https://i.imgur.com/kYNnA5N.png" alt="Screenshot 6">
  <img src="https://i.imgur.com/fGuJODK.png" alt="Screenshot 7">
  <img src="https://i.imgur.com/Z4URBmU.png" alt="Screenshot 8">
  <img src="https://i.imgur.com/d1llPEd.png" alt="Screenshot 9">
  <img src="https://i.imgur.com/IvheEzs.png" alt="Screenshot 10">
  <img src="https://i.imgur.com/beORde7.png" alt="Screenshot 11">
  <img src="https://i.imgur.com/np0GPDT.png" alt="Screenshot 12">
  <img src="https://i.imgur.com/s4cSdHE.png" alt="Screenshot 13">
  <img src="https://i.imgur.com/IMpp6xW.png" alt="Screenshot 14">
  <img src="https://i.imgur.com/mETUV7m.png" alt="Screenshot 15">
  <img src="https://i.imgur.com/Emnjg6P.png" alt="Screenshot 16">
  <img src="https://i.imgur.com/m7Jg2bE.png" alt="Screenshot 17">
  <img src="https://i.imgur.com/ipOPLkt.png" alt="Screenshot 18">
  <img src="https://i.imgur.com/sBfBR2a.png" alt="Screenshot 19">
  <img src="https://i.imgur.com/2l7yLgP.png" alt="Screenshot 20">
  <img src="https://i.imgur.com/AfL8QkF.png" alt="Screenshot 21">
  <img src="https://i.imgur.com/HRMYWY0.png" alt="Screenshot 22">
  <img src="https://i.imgur.com/m8Ji473.png" alt="Screenshot 23">
  <img src="https://i.imgur.com/3GdAN64.png" alt="Screenshot 24">
  <img src="https://i.imgur.com/6V4KVNt.png" alt="Screenshot 25">
  <img src="https://i.imgur.com/GOYZhdk.png" alt="Screenshot 26">
  <img src="https://i.imgur.com/aisIeZ4.png" alt="Screenshot 27">
  <img src="https://i.imgur.com/0Z0Z0Z0.png" alt="Screenshot 28">
  <img src="https://i.imgur.com/wTVXwGb.png" alt="Screenshot 29">
</p>


        
        
        
