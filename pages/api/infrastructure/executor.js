import { Executor } from "../models/Executor";

let infrastructure;

const init = () => {
  infrastructure = new Executor();
};

const execute = async ({
  to,
  data,
  value,
  signer,
}) => {

  if (!infrastructure) {
    init();
  }

  const result = await infrastructure.execute({
    to,
    data,
    value,
    signer,
  });

  return result;
}

export {
  init,
  execute,
};