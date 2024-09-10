// (1)// const asycHandler = (fn) => async (req, res, next) => {
// //   try {
// //     await fn(req, res, next);
// //   } catch (error) {
// //     res.send(err.code || 500).json({
// //       success: true,
// //       massage: err.massage,
// //     });
// //   }
// // };
// // export default asycHandler;

const asycHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export  {asycHandler}

