const errorCont = {};

errorCont.buildIntentionalError = async function(req, res, next) {
    try {
        throw new Error("Intentional Error: Code 500");
    } catch (error) {
        next({status: 500, message: error})
    }
}

module.exports = errorCont;