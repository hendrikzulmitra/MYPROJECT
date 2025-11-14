function errorHandler(err, req, res, next) {
  let status = 500;
  let message = 'Internal Server Error';

  console.log(err);

  switch (err.name) {
    case 'SequelizeValidationError':
    case 'SequelizeUniqueConstraintError':
      status = 400;
      message = err.errors[0].message;
      break;
    case 'JsonWebTokenError':
    case 'Unauthorized':
      status = 401;
      message = err.message || 'Invalid token';
      break;
    case 'Forbidden':
      status = 403;
      message = err.message;
      break;
    case 'NotFound':
      status = 404;
      message = err.message;
      break;
    case 'BadRequest':
      status = 400;
      message = err.message;
      break;
  }

  res.status(status).json({ message });
}

module.exports = errorHandler;