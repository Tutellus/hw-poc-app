export const getExplorerUrl = (chainId = 5, type, data) => {
  switch(chainId) {
    case 1:
      return `https://etherscan.io/${type}/${data}`;
    case 3:
      return `https://ropsten.etherscan.io/${type}/${data}`;
    case 4:
      return `https://rinkeby.etherscan.io/${type}/${data}`;
    case 5:
      return `https://goerli.etherscan.io/${type}/${data}`;
    case 42:
      return `https://kovan.etherscan.io/${type}/${data}`;
    case 137:
      return `https://polygonscan.com/${type}/${data}`;
    case 80001:
      return `https://mumbai.polygonscan.com/${type}/${data}`;
    case 56:
      return `https://bscscan.com/${type}/${data}`;
    case 97:
      return `https://testnet.bscscan.com/${type}/${data}`;
    default:
      return `https://etherscan.io/${type}/${data}`;
  }
}