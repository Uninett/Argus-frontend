module.exports = (req, res) => {
  return res.status(200).send({
    "token": "demoToken1234567890"
  });
}