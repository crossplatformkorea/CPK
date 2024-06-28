module.exports = (message, key) => {
  if (key.includes('-')) {
    throw new SyntaxError('Key must use underbar(-) instead of hyphen(-)!');
  }
};
