const sendSuccess = (res, statusCode, message, data, meta) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    meta
  });
};

module.exports = {
  sendSuccess
};
