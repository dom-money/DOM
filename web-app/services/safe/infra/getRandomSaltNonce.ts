const getRandomSaltNonce = () => {
  return (Date.now() * 1000 + Math.floor(Math.random() * 1000)).toString();
};

export default getRandomSaltNonce;
