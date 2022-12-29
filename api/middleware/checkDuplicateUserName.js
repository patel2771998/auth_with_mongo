const db = require("../models");
const User = db.users;


checkDuplicateUserEmail = (req, res, next) => {
    User.find({ email: req.body.email, status: 'active' })
        .then(data => {
            if (data.length == 0) {
                next();
            } else {
                return res.status(400).send({
                    status: false,
                    message: "Failed! Username or Email Is Already In Use"
                });
            }
        })
        .catch(err => {
            return res.status(500).send({
                status: false,
                message: err.message || "Some Error Occurred While Retrieving Users."
            });
        });
};



const verificationUserName = {
    checkDuplicateUserEmail: checkDuplicateUserEmail
};

module.exports = verificationUserName;


