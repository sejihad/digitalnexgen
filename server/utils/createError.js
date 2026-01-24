const createError = (status, message) => {
  const err = new Error(message); // message constructor-এ pass করুন
  err.status = status;
  err.message = message;

  // Express compatible error
  err.isOperational = true;

  return err;
};

export default createError;
