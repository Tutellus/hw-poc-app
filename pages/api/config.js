const config = {
  "0x13881": {
    rpc: 'https://rpc.ankr.com/polygon_mumbai',
    executePolicies: '0x62481f08285803FEaF94E2b66EbAEa6FCf781c0f',
    humanFactory: '0x1Fe4Bc538C29A52dFC8B2982a218746C3837ca55',
    beacon: '0xc2d9750c31eb53ec842c7b7604451eb544fab2b9',
    entryPoint: '0x6e24E57CC85B62d53b92097FAaa37A89C26a596D',
    factorySigner: {
      address: '0x46121e79942deF3008b1823cf990c262dad5b393',
      kPriv: '0xf917e4965fb7b827cfb50224859679ac43209a3a150ae05885632f1271608dc2',
    },
    serverSigner: {
      address: '0x44eEdBEE931A5dc22a5f4Ad441679FD5C0e38D38',
      kPriv: 'efd44239bde79731d052d6e19e07ac3a739dcd1f473be0cfed38182c63b77d86',
    }, // 2FA, per project??
    federationOwners: [
      "0xCD7669AAFffB7F683995E6eD9b53d1E5FE72c142",
      "0x30729B6910757042024304E56BEB015821462691",
      "0xDB970fD8Ed083D0Dc6000fa1e4973F27d8eDA2A9",
    ],
    defaultTimelock: 3600,
    defaultInactivityTime: 7200,
    projectId: '63d3c3a83asfd551asd5sadsdafd8bfbsda6d502sd1',
  },
  mongo: {
    test: 'mongodb://localhost:27017/smw',
    development: 'mongodb+srv://demo:tutellus@serverlessinstance0.gzvnc.mongodb.net/?retryWrites=true&w=majority',
    production: 'mongodb+srv://demo:tutellus@mongoserverless.gzvnc.mongodb.net/?retryWrites=true&w=majority',
  },
  gasPriceMultiplier: 2.5,
  gasLimitMultiplier: 2,
}

module.exports = { config }