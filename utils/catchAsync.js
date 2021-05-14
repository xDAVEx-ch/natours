/* The function inside (fn) is triggered by express, which pass down the parameters.
    catchAsync is called. If inside catchAsync we fire fn without a wrapper function,
    we will give the result, a promise and express can't handle that
*/
const catchAsync = (fn) =>{
    return (req, resp, next) => {
        fn(req, resp, next).catch(next);
    }
}

module.exports = catchAsync;