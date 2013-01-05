exports.notFound = {
  message: 'Not found',
  statusCode: 404
};

exports.alreadyExists = {
  message: 'This resource already exists',
  statusCode: 409
};

exports.permissionRequired = {
  message: 'You do not have permission to create this resource',
  statusCode: 403
};

exports.authenticationFailed = {
  message: 'Failed to authenticate, please check your credentials',
  statusCode: 403
};

exports.badRequest = {
  message: 'Bad request',
  statusCode: 400
};