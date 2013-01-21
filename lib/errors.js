exports.NotFound = function NotFound () {
  Error.call(this);
  this.message = 'Not found';
  this.name = 'NotFound';
  this.statusCode = 404;
};
exports.NotFound.prototype.__proto__ = Error.prototype;

exports.AlreadyExists = function AlreadyExists() {
  Error.call(this);
  this.message = 'You do not have permission to access this resource';
  this.name = 'AlreadyExists';
  this.statusCode = 409;
};
exports.AlreadyExists.prototype.__proto__ = Error.prototype;

exports.PermissionRequired = function PermissionRequired() {
  Error.call(this);
  this.message = 'You do not have permission to access this resource';
  this.name = 'PermissionRequired';
  this.statusCode = 403;
};
exports.PermissionRequired.prototype.__proto__ = Error.prototype;

exports.AuthenticationFailed = function AuthenticationFailed() {
  Error.call(this);
  this.message = 'Failed to authenticate, please check your credentials';
  this.name = 'AuthenticationFailed';
  this.statusCode = 403;
};
exports.AuthenticationFailed.prototype.__proto__ = Error.prototype;

exports.BadRequest = function BadRequest() {
  Error.call(this);
  this.message = 'Bad request';
  this.name = 'BadRequest';
  this.statusCode = 400;
};
exports.BadRequest.prototype.__proto__ = Error.prototype;
