module.exports = function (req, res) {
    res.json({
        anyMethod: req.method
    });
}