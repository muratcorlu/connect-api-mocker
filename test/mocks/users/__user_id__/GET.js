module.exports = function (req, res) {
    res.json({
        id: req.params.user_id,
        method: 'GET'
    });
}
