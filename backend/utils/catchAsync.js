module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next); // Catches any async error and passes it to Express's error handler
  };
};