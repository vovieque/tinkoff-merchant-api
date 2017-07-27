# Tinkoff Merchant API

Node.js implementation of [Tinkoff Merchant API v2](https://oplata.tinkoff.ru/documentation/).

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
    DATA: {
        Email: 'user@ya.ru',
        Phone: '+71234567890'
    },
    Receipt: {
        Email: 'user@ya.ru',
        Phone: '+71234567890',
        Taxation: 'osn',
        Items: [
            {
                Name: 'Наименование товара 1',
                Price: 100.00,
                Quantity: 1.00,
                Amount: 100.00,
                Tax: 'vat10',
                Ean13: '0123456789'
            },
            {
                Name: 'Наименование товара 2',
                Price: 200.00,
                Quantity: 2.00,
                Amount: 400.00,
                Tax: 'vat18'
            }
        ]
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
### Debug
```
DEBUG=tinkoff-merchant
```
Also see [debug](https://www.npmjs.com/package/debug) module