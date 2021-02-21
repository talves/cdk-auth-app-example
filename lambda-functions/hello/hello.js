const jwt = require("jsonwebtoken");

exports.handler = void 0;

const handler = async (event = {}) => {
  console.log("Starting hello handler.");

  const jwtHeaders = event.headers["Authorization"];
  const decoded = jwt.decode(jwtHeaders);
  const memberStatus = decoded["custom:member_status"];

  var responseBody = {
    message: "Hello API!",
    member_status: memberStatus,
  };

  const response = {
    statusCode: 200,
    headers: {
      demo_header: "message-test",
    },
    body: JSON.stringify(responseBody),
    isBase64Encoded: false,
  };

  return response;
};

exports.handler = handler;
