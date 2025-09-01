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

// sourced from https://gist.github.com/thor2/039f340e3482a1a319066e946dc71914#file-symbols-csv
const STOCK_CURRENCIES = ["MMM", "ARR", "ABT", "ABBV", "ABMD", "ACN", "ATVI", "ADBE", "AMD",  "AAP",  "AES",  "AFL",  "A",  "APD", "AKAM", "ALK", "ALB",
    "ARE", "ALXN", "ALGN", "ALLE", "AGN", "ADS", "LNT", "ALL", "GOOGL", "GOOG", "MO", "AMZN", "AMCR", "AEE", "AAL", "AEP", "AXP", "AIG", "AMT",
    "AWK", "AMP", "ABC", "AME", "AMGN",  "APH", "ADI", "ANSS", "ANTM", "AON", "AOS", "APA", "AIV", "AAPL", "AMAT", "APTV", "ADM", "ARNC", "ANET",
    "AJG", "AIZ", "ATO", "T", "ADSK", "ADP", "AZO", "AVB", "AVY", "BKR", "BLL", "BAC", "BK", "BAX", "BDX", "BRK.B", "BBY", "BIIB", "BLK", "BA",
    "BKNG","BWA", "BXP", "BSX", "BMY", "AVGO", "BR", "BF.B", "CHRW", "COG", "CDNS", "CPB", "COF", "CPRI", "CAH", "KMX", "CCL", "CAT", "CBOE", "CBRE",
    "CDW", "CE", "CNC", "CNP", "CTL", "CERN", "CF", "SCHW", "CHTR", "CVX", "CMG", "CB", "CHD", "CI", "XEC", "CINF", "CTAS", "CSCO", "C", "CFG",
    "CTXS", "CLX", "CME", "CMS", "KO", "CTSH", "CL", "CMCSA", "CMA", "CAG", "CXO", "COP", "ED", "STZ", "COO", "CPRT", "GLW", "CTVA", "COST", "COTY",
    "CCI", "CSX", "CMI", "CVS", "DHI","DHR", "DRI","DVA", "DE", "DAL", "XRAY", "DVN", "FANG", "DLR", "DFS", "DISCA", "DISCK", "DISH", "DG", "DLTR",
    "D", "DOV", "DOW", "DTE", "DUK", "DRE", "DD", "DXC", "ETFC", "EMN", "ETN", "EBAY", "ECL", "EIX", "EW", "EA", "EMR", "ETR", "EOG", "EFX", "EQIX",
    "EQR", "ESS", "EL", "EVRG", "ES", "RE", "EXC", "EXPE", "EXPD", "EXR", "XOM", "FFIV", "FB", "FAST", "FRT", "FDX", "FIS", "FITB", "FE", "FRC",
    "FISV", "FLT", "FLIR", "FLS", "FMC", "F", "FTNT","FTV", "FBHS", "FOXA", "FOX", "BEN", "FCX", "GPS", "GRMN", "IT", "GD","GE", "GIS", "GM", "GPC",
    "GILD", "GL", "GPN", "GS", "GWW", "HRB", "HAL", "HBI", "HOG", "HIG", "HAS", "HCA", "PEAK", "HP", "HSIC", "HSY","HES", "HPE", "HLT", "HFC",
    "HOLX", "HD", "HON", "HRL", "HST", "HPQ","HUM", "HBAN", "HII", "IEX", "IDXX","INFO", "ITW", "ILMN", "IR", "INTC", "ICE", "IBM", "INCY", "IP",
    "IPG", "IFF", "INTU", "ISRG", "IVZ", "IPGP", "IQV", "IRM", "JKHY", "J", "JBHT", "SJM","JNJ", "JCI", "JPM", "JNPR", "KSU", "K", "KEY", "KEYS",
    "KMB", "KIM", "KMI", "KLAC", "KSS", "KHC", "KR","LB", "LHX","LH", "LRCX", "LW", "LVS", "LEG", "LDOS", "LEN", "LLY", "LNC", "LIN", "LYV", "LKQ",
    "LMT", "L","LOW", "LYB", "MTB", "M", "MRO", "MPC", "MKTX", "MAR", "MMC", "MLM", "MAS", "MA", "MKC", "MXIM", "MCD", "MCK", "MDT","MRK", "MET",
    "MTD", "MGM", "MCHP", "MU", "MSFT", "MAA", "MHK", "TAP", "MDLZ", "MNST", "MCO", "MS", "MOS", "MSI", "MSCI", "MYL", "NDAQ", "NOV", "NTAP", "NFLX",
    "NWL", "NEM", "NWSA", "NWS", "NEE", "NLSN", "NKE", "NI", "NBL", "JWN", "NSC", "NTRS", "NOC", "NLOK", "NCLH", "NRG", "NUE", "NVDA", "NVR","ORLY",
    "OXY", "ODFL", "OMC", "OKE", "ORCL", "PCAR", "PKG", "PH", "PAYX", "PYPL", "PNR", "PBCT", "PEP", "PKI", "PRGO", "PFE", "PM", "PSX", "PNW", "PXD",
    "PNC", "PPG", "PPL", "PFG", "PG", "PGR", "PLD", "PRU", "PEG", "PSA", "PHM", "PVH", "QRVO", "PWR", "QCOM", "DGX", "RL","RJF", "RTN", "O", "REG",
    "REGN", "RF", "RSG", "RMD","RHI", "ROK", "ROL", "ROP", "ROST", "RCL", "SPGI", "CRM", "SBAC", "SLB", "STX","SEE", "SRE", "NOW", "SHW", "SPG",
    "SWKS", "SLG", "SNA", "SO", "LUV", "SWK", "SBUX", "STT", "STE", "SYK", "SIVB", "SYF", "SNPS", "SYY", "TMUS", "TROW", "TTWO", "TPR", "TGT", "TEL",
    "FTI", "TFX", "TXN", "TXT", "TMO", "TIF", "TJX", "TSCO", "TDG", "TRV", "TFC", "TWTR", "TSN", "UDR", "ULTA", "USB","UAA", "UA", "UNP", "UAL",
    "UNH", "UPS", "URI", "UTX", "UHS", "UNM", "VFC", "VLO", "VAR", "VTR", "VRSN", "VRSK", "VZ", "VRTX", "VIAC", "V", "VNO", "VMC","WRB", "WAB",
    "WMT", "WBA", "DIS", "WM", "WAT", "WEC", "WCG", "WFC", "WELL", "WDC", "WU", "WRK", "WY", "WHR","WMB","WLTW", "WYNN", "XEL","XRX", "XLNX", "XYL",
    "YUM", "ZBRA","ZBH", "ZION", "ZTS"
];

const ASSET_CURRENCIES = {
    [ASSET_TYPE.CASH]: FIAT_CURRENCIES.sort(),
    [ASSET_TYPE.STOCK]: STOCK_CURRENCIES.sort(),
    [ASSET_TYPE.CRYPTO]: CRYPTO_CURRENCIES.sort()
};

const DEFAULT_CATEGORIES = ["groceries", "health", "transport", "rent", "other"];
const DEFAULT_CURRENCIES = {
    [ASSET_TYPE.CASH]: ["EUR", "USD", "CAD", "JPY", "AUD"],
    [ASSET_TYPE.STOCK]: ["MSFT", "GOOG", "AAPL", "NVDA", "AMZN"],
    [ASSET_TYPE.CRYPTO]: ["BTC", "ETH", "LTC", "XRP", "ADA"]
}

const PAYMENT_FREQUENCY = {
    MONTHLY: "monthly",
    BIMONTHLY: "bi-monthly",
    QUARTERLY: "quarterly",
    SEMIANNUALLY: "semi-annually",
    ANNUALLY: "annually"
};

module.exports = { ASSET_TYPE, FIAT_CURRENCIES, ASSET_CURRENCIES, STOCK_CURRENCIES, CRYPTO_CURRENCIES,
    DEFAULT_CATEGORIES, CRYPTO_CURRENCY_NAMES, DEFAULT_CURRENCIES, PAYMENT_FREQUENCY };