# 🚀 Server Endpoints

| Route | Method | Description |
| ----- | ------ | ----------- |
| /api/list/asset-type | GET | Return list of the supported asset types |
| /api/list/currency | GET | Return a map of currencies per asset type |
| /api/list/currency/:assetType | GET | Return list of currencies for a given asset type (`crypto`, `cash`, `stock`) |
| /api/list/category | GET | Return list transaction category options (soon deprecated) |
| |
| /api/:assetType/ | GET | Return a list of the prices/rate of some of the given asset type |
| /api/:assetType/:currency | GET | Return the price/rate of currency |
| |
| /api/balance | GET | Return the balances of the assets and their allocation info |
| |
| /api/transactions | GET | Return all transactions |
| /api/transactions | POST | Add a transaction |
| /api/transactions/all | POST | Add a list of transactions |
| /api/transactions/csv | POST | Take a csv list of transactions, transform to json, validate and return (with any errors) |
| /api/transactions/export/:format | GET | Return all transactions in the specified format (options: `json` or `csv`) |

TODO: use the table above to provide links to more info on each endpoint