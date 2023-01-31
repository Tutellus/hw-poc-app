export const config = {
  "5": {
    rpc: 'https://goerli.infura.io/v3/34208e804a1947cb9e37992a4de47a06',
    forwardPolicies: '0x1702967A62d6d9eb9a9b2FdcA811282955bc5136',
    proxyFactory: '0x2cfC40d39DF23668843972D4BE24aA27B32232ae',
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