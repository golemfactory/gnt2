export const getGasLimit = () => {
  if (process.env.NODE_ENV === 'test') {
    return undefined;
  }
  return 75000;
};
