import { Executor } from "../models/Executor";

let infrastructure;

const init = () => {
  infrastructure = new Executor();
};

const execute = async (transaction) => {

  if (!infrastructure) {
    init();
  }

  const result = await infrastructure.execute(transaction);
  return result;
}

export {
  init,
  execute,
};