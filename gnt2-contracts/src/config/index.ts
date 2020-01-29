export const getGasLimit = () => {
  if (process.env.NODE_ENV === 'test') {
    return {};
  }
  return {
    gasLimit: 75000,
  };
};
