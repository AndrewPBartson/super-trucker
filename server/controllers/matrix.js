function createMatrix(req, res, next) {
  console.log('************** matrix.createMatrix() ***************');
  console.log('req.payload.data.trip.params :>> ', req.payload.data.trip.params);
  return req
}

module.exports = {
  createMatrix
}