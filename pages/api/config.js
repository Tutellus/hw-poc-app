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
    safeProxyFactory: '0x4F6791BeCE9dF85A32fFA13b41c1EB2DC2Ee25A5',
    safeSingleton: '0x14Bc0Da61b53DEce71961258e91637e80ac91737',
    safeFallbackHandler: '0xf90A9fB2062aEc72eb7A26DB9251323971d595c4',
  },
  mongo: {
    test: 'mongodb://localhost:27017/smw',
    development: 'mongodb+srv://demo:tutellus@serverlessinstance0.gzvnc.mongodb.net/?retryWrites=true&w=majority',
    production: 'mongodb+srv://demo:tutellus@mongoserverless.gzvnc.mongodb.net/?retryWrites=true&w=majority',
  },
  gasPriceMultiplier: 2.5,
  gasLimitMultiplier: 1.5,
}