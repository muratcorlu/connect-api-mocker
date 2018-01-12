module.exports = function (req, res) {
    res.status(201).json({
        name: req.body.name
    });
}