/* 
  The original code defines a middleware function called syntaxError, which is intended to handle SyntaxError instances in an HTTP request.
  However, there are a few issues in the code that need to be addressed.
*/

const syntaxError = (err, req, res, next) => {
  if (
    err instanceof SyntaxError &&
    err.status === 400 &&
    "body" in err &&
    err.type === "entity.parse.failed"
  ) {
    // The condition "err.status === 400" is incorrect because SyntaxError instances do not have a "status" property.
    // Instead, we should check if the error message includes "JSON" to identify a JSON parsing error.
    // Also, the "body" property does not exist on SyntaxError instances, so we should remove that check.
    // We should update the response status to 400 and send a JSON response with the error message.
    res.status(400).json({ message: "JSON malformed" });
  } else {
    // If the error does not match the specified conditions, we should call the next middleware in the chain.
    next();
  }
};

module.exports = syntaxError;
