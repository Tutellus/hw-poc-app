export const getExplorerUrl = (chainId = 5, type, data) => {
  switch(chainId) {
    case '0x5':
      return `https://goerli.etherscan.io/${type}/${data}`;
    case '0x61':
      return `https://testnet.bscscan.com/${type}/${data}`;
    default:
      return `https://etherscan.io/${type}/${data}`;
  }
}