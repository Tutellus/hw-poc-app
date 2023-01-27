export const config = {
  "5": {
    rpc: 'https://goerli.infura.io/v3/34208e804a1947cb9e37992a4de47a06',
    forwardPolicies: '0x29270cBA568927605F86C80B3B795cd6be1a3b91',
    proxyFactory: '0x6ad2de512C5ebe425bdf847a48553c6172b95141',
    safeProxyFactory: '0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2',
    safeSingleton: '0xd9db270c1b5e3bd161e8c8503c55ceabee709552',
    safeFallbackHandler: '0xf48f2b2d2a534e402487b3ee7c18c33aec0fe5e4',
  },
  mongo: {
    local: 'mongodb://localhost:27017/smw',
    development: 'mongodb://localhost:27017/smw',
    production: 'mongodb://localhost:27017/smw',
  },
}