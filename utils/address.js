const compareAddresses = (a, b) => {
  return a.toLowerCase() === b.toLowerCase()
}

const explorerLink = ({ value, type = "address" }) => {
  return `https://mumbai.polygonscan.com/${type}/${value}#tokentxns`
}

const truncateAddress = (
  { address = "", chars = 6, stringify = false, extend = false },
  noLink
) => {
  const valueStart = address.slice(0, chars)
  const valueEnd = address.slice(address.length - chars)
  const value = `${valueStart}...${valueEnd}`
  if (stringify) return value
  return noLink ? (
    extend ? (
      address
    ) : (
      `${valueStart}...${valueEnd}`
    )
  ) : (
    <a
      style={{ color: "white" }}
      href={explorerLink({ value: address })}
      target="_blank"
      rel="noopener noreferrer"
    >
      {extend ? address : value}
    </a>
  )
}

export { compareAddresses, truncateAddress, explorerLink }
