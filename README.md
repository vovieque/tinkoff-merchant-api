# Tinkoff Merchant API

Node.js implementation of [Tinkoff Merchant API](https://oplata.tinkoff.ru/documentation/).

## Installation

```
npn i tinkoff-merchant-api
```

## How to use

```js
const TinkoffMerchantAPI = require('tinkoff-merchant-api');
const bankApi = new TinkoffMerchantAPI(process.env.TINKOFF_TERMINAL_KEY, process.env.TINKOFF_SECRET_KEY);

// Pass params for API method except TerminalKey and Token (they will be added automatically)
bankApi.init({
    Amount: '200000',
    OrderId: '123',
    // For method Init: DATA should be object with DATA-params (DATA will be serialized (including urlencoding of values) automatically)
    DATA: {
        Email: 'user@ya.ru',
        Phone: '+71234567890'
    }
}).then(res => {
    console.log(res)
}).catch(err => {
    console.log(err.stack)
});
```

You can use another implemented [methods](index.js).

Also you can check if notification request is valid

```js
// Use Express req object or your own express-like object with ip and request params:
// const req = {
//     ip: '91.194.226.1',
//     body: {
//         "Amount":"100000",
//         "CardId":"751596",
//         "ErrorCode":"0",
//         "OrderId":"1",
//         "Pan":"430000******0777",
//         "PaymentId":"1671111",
//         "RebillId":"",
//         "Status":"AUTHORIZED",
//         "Success":"true",
//         "TerminalKey":"1234567890123",
//         "Token":"239ea18cfd5dfcc72423778c0634bcf90987af8600fc835b8f7d7657cc95c69b"
//     }
// };
const isValidNotificationRequest = bankApi.checkNotificationRequest(req).success;
console.log(isValidNotificationRequest);
```
