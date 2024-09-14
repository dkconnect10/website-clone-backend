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

// const asyncHandler= (requestHandler) => {
//   return (req, res, next) => {
//     Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
//   };
// };

// export  {asyncHandler}

const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next))
      .catch((err) => {
        if (!(err instanceof Error)) {
          err = new Error(err.message || "Internal Server Error");
        }
        next(err);
      });
  };
};

export {asyncHandler}

