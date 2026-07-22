// backend/utils/serverError.js
//
// WHY: returning error.message to the browser leaks internals — Mongoose
// validation text, duplicate-key errors naming fields and values, driver
// messages. The real error still needs to reach the server log (Render
// captures stdout/stderr), so this logs it and replies with a safe,
// generic message.
export const sendServerError = (res, error) => {
  console.error(error);
  return res.status(500).json({
    success: false,
    message: "Something went wrong. Please try again.",
  });
};
