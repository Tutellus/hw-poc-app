const compareAddresses = (a, b) => {
  return a.toLowerCase() === b.toLowerCase()
}

const truncateAddress = (address, chars = 6) => {
  const parsed = address;
  return parsed.slice(0, chars+2).concat('...').concat(parsed.slice(-chars))
}

export {
  compareAddresses,
  truncateAddress,
}