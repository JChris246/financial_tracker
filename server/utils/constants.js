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

// technically don't need this if I have the below map
const CRYPTO_CURRENCIES = ["BTC", "ETH", "ADA", "BNB", "USDT", "XRP", "SOL", "DOT", "DOGE", "USDC", "UNI", "LINK", "LTC",
    "AAVE", "FRAX", "BCH", "ALGO", "WBTC", "ICP", "FIL", "TRX", "FTT", "XLM", "VET", "ATOM", "ETC", "THETA", "DAI", "XMR", "MANA",
    "ZEC", "TUSD", "AXS", "ONE", "CHZ", "GRT", "1INCH", "ENJ", "KSM", "SHIB", "LEO", "FLOW", "XTZ",
    "SAND", "KLAY", "MKR", "USDP", "XCH", "USDD", "BTT","SUI", "LUNC", "GUSD", "BAT", "NEO", "CAKE", "LRC", "DASH"];

// at this point, these aren't really friendly names, just ids used by coin gecko
const CRYPTO_CURRENCY_NAMES = {
    BTC: "Bitcoin",
    ETH: "Ethereum",
    ADA: "Cardano",
    BNB: "BinanceCoin",
    USDT: "Tether",
    XRP: "Ripple",
    SOL: "Solana",
    DOT: "Polkadot",
    DOGE: "Dogecoin",
    USDC: "USD-Coin",
    UNI: "Uniswap",
    LINK: "Chainlink",
    LTC: "Litecoin",
    AAVE: "Aave",
    FRAX: "Frax",
    BCH: "Bitcoin-Cash",
    ALGO: "Algorand",
    WBTC: "Wrapped-Bitcoin",
    ICP: "Internet-Computer",
    FIL: "Filecoin",
    TRX: "Tron",
    FTT: "FTX-Token",
    XLM: "Stellar",
    VET: "VeChain",
    ATOM: "Cosmos",
    ETC: "Ethereum-Classic",
    THETA: "Theta-Token",
    DAI: "Dai",
    XMR: "Monero",
    MANA: "Decentraland",
    ZEC: "Zcash",
    TUSD: "True-USD",
    AXS: "Axie-Infinity",
    ONE: "Harmony",
    CHZ: "Chiliz",
    GRT: "The-Graph",
    "1INCH": "1inch",
    ENJ: "EnjinCoin",
    KSM: "Kusama",
    SHIB: "Shiba-Inu",
    LEO: "LEO-Token",
    FLOW: "Flow",
    XTZ: "Tezos",
    SAND: "The-Sandbox",
    KLAY: "Klayr",
    MKR: "Maker",
    USDP: "paxos-standard",
    XCH: "Chia",
    USDD: "USDD",
    BTT: "BitTorrent",
    SUI: "Sui",
    LUNC: "terra-luna",
    GUSD: "Gemini-Dollar",
    BAT: "Basic-Attention-Token",
    NEO: "Neo",
    CAKE: "PancakeSwap-token",
    LRC: "Loopring",
    DASH: "Dash",
};

const STOCK_CURRENCIES = [];

const ASSET_CURRENCIES = {
    [ASSET_TYPE.CASH]: FIAT_CURRENCIES,
    [ASSET_TYPE.STOCK]: STOCK_CURRENCIES,
    [ASSET_TYPE.CRYPTO]: CRYPTO_CURRENCIES
};

const DEFAULT_CATEGORIES = ["groceries", "health", "transport", "rent", "other"];

module.exports = { ASSET_TYPE, FIAT_CURRENCIES, ASSET_CURRENCIES, STOCK_CURRENCIES, CRYPTO_CURRENCIES, DEFAULT_CATEGORIES, CRYPTO_CURRENCY_NAMES };