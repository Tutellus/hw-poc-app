export class Transaction {
  constructor({ projectId, chainId, to, data, value }) {
    this.projectId = projectId;
    this.chainId = chainId;
    this.to = to;
    this.data = data;
    this.value = value || 0;
  }
}
