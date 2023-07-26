const compareAddresses = (a, b) => {
  return a.toLowerCase() === b.toLowerCase()
}

const explorerLink = ({ value, type = "address" }) => {
  return `https://mumbai.polygonscan.com/${type}/${value}`
}

const truncateAddress = (
  { address = "", chars = 8, stringify = false, extend = false },
  noLink
) => {
  const value = address.slice(2, chars + 2).toUpperCase()
  if (stringify) return value
  return noLink ? (
    extend ? (
      address
    ) : (
      value
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
