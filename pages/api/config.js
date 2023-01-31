export const config = {
  "5": {
    rpc: 'https://goerli.infura.io/v3/34208e804a1947cb9e37992a4de47a06',
    forwardPolicies: '0xfA5BD9dCcE6dBCDd6695a540EdA9A743cF51a81B',
    proxyFactory: '0xa315d71886e843d6CC70280A1779079a45336EDf',
    safeProxyFactory: '0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2',
    safeSingleton: '0xd9db270c1b5e3bd161e8c8503c55ceabee709552',
    safeFallbackHandler: '0xf48f2b2d2a534e402487b3ee7c18c33aec0fe5e4',
  },
  mongo: {
    test: 'mongodb://localhost:27017/smw',
    development: 'mongodb+srv://demo:tutellus@serverlessinstance0.gzvnc.mongodb.net/?retryWrites=true&w=majority',
    production: 'mongodb+srv://demo:tutellus@mongoserverless.gzvnc.mongodb.net/?retryWrites=true&w=majority',
  },
}