export const config = {
  "0x5": {
    rpc: 'https://goerli.infura.io/v3/2adb60007af7447b8e76552303197a66',
    forwardPolicies: '0xf87915387adedCD5A03180891374beB0D0F3717E',
    proxyFactory: '0x8c91E759dFE1DEa10156974b523C737702c9900E',
    safeProxyFactory: '0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2',
    safeSingleton: '0xd9db270c1b5e3bd161e8c8503c55ceabee709552',
    safeFallbackHandler: '0xf48f2b2d2a534e402487b3ee7c18c33aec0fe5e4',
  },
  "0x61": {
    rpc: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    forwardPolicies: '0xC1785E3E399890808EAd24dfF82C09136eC43e10',
    proxyFactory: '0xb1D187EcdC3FCc818aaB942625f4137a4A96E9c9',
    safeProxyFactory: '0x8fFE1D761154941835D1f29B604Db25Ed7dC30B7',
    safeSingleton: '0x3a1701e1182C300Eb3aC6d35fa606B587c189C05',
    safeFallbackHandler: '0xb47b0DE7fC1d9a162EA6366b1252fe32CFdf7372',
  },
  mongo: {
    test: 'mongodb://localhost:27017/smw',
    development: 'mongodb+srv://demo:tutellus@serverlessinstance0.gzvnc.mongodb.net/?retryWrites=true&w=majority',
    production: 'mongodb+srv://demo:tutellus@mongoserverless.gzvnc.mongodb.net/?retryWrites=true&w=majority',
  },
  gasPriceMultiplier: 2.5,
  gasLimitMultiplier: 1.5,
}