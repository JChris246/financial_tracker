const ASSET_TYPE = {
    CASH: "cash",
    STOCK: "stock",
    CRYPTO: "crypto"
};

// ars, bif, cdf, cop, cve, ern, fkp, gip, gnf, hrk, idr, iqd, irr, khr, krw, kwd, lbp, mga, mmk, mnt, mwk, ngn, pyg, rwf, sll, ssp
// stn, syp, ugx, uzs, vef, vnd, vuv, wst, zwl
const FIAT_CURRENCIES = ["eur","aed","afn","xcd","all","amd","aoa","usd","aud","awg","azn","bam","bbd","bdt","xof","bgn","bhd","bmd",
    "bnd","bob","brl","bsd","btn","nok","bwp","byn","bzd","cad","xaf","chf","nzd","clp","cny","crc","cup","ang","djf","dkk","dop","dzd",
    "egp","mad","etb","fjd","gbp","gel","ghs","gmd","gtq","gyd","hkd","hnl","htg","huf","ils","inr","isk","jmd","jod","jpy","kes","kgs",
    "kmf","kyd","kzt","lkr","lrd","lsl","lyd","mdl","mkd","mop","mru","mur","mvr","mxn","myr","mzn","nad","xpf","nio","npr","omr","pab",
    "pen","pgk","php","pkr","pln","qar","ron","rsd","rub","sar","sbd","scr","sdg","sek","sgd","sos","srd","thb","tjs","tmt","tnd","top",
    "try","ttd","twd","uah","uyu","yer","zar","zmw"];

// TODO: map the full names
const CRYPTO_CURRENCIES = ["BTC", "ETH", "ADA", "BNB", "USDT", "XRP", "SOL", "DOT", "DOGE", "USDC", "UNI", "LUNA", "LINK", "AVAX", "LTC", "BUSD",
    "AAVE", "FRAX", "HBAR", "BCH", "ALGO", "WBTC", "ICP", "POL", "FIL", "TRX", "FTT", "XLM", "VET", "ATOM", "ETC", "THETA", "DAI", "XMR", "MANA",
    "ZEC", "TUSD", "EOS", "AXS", "ONE", "EGLD", "CHZ", "GRT", "1INCH", "INJ", "ENJ", "KSM", "CRO", "SHIB", "LEO", "NEAR", "BTCB", "FLOW", "XTZ",
    "KCS", "SAND", "KLAY", "MKR", "USDP", "mBTC", "uBTC", "mETH", "XCH", "USDD", "BTT","SUI", "LUNC", "GUSD", "BAT", "NEO", "CAKE",
    "LRC", "DASH", "XDC"];

const STOCK_CURRENCIES = [];

const ASSET_CURRENCIES = {
    [ASSET_TYPE.CASH]: FIAT_CURRENCIES,
    [ASSET_TYPE.STOCK]: STOCK_CURRENCIES,
    [ASSET_TYPE.CRYPTO]: CRYPTO_CURRENCIES
};

const DEFAULT_CATEGORIES = ["groceries", "health", "transport", "rent", "other"];

module.exports = { ASSET_TYPE, FIAT_CURRENCIES, ASSET_CURRENCIES, STOCK_CURRENCIES, CRYPTO_CURRENCIES, DEFAULT_CATEGORIES };