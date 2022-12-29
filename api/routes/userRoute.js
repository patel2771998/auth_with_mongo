const { authJwt, verificationUserName } = require("../middleware");

module.exports = app => {
    const users = require("../controllers/userController.js")

    app.post("/api/user/register",[verificationUserName.checkDuplicateUserEmail], users.register);

    app.post("/api/user/login", users.login);

    app.post("/api/user/social/login", users.socialLogin);

    app.post("/api/user/forgotpassword",users.forgotPassword);

    app.post("/api/user/verifyotp",users.verifyOTP);

    app.post("/api/user/password/create",[authJwt.verifyToken],users.createPassword);

    app.post("/api/upload/file", [authJwt.verifyToken], users.upload);

    app.post("/api/user/profile/view",[authJwt.verifyToken],users.viewProfile);

    app.post("/api/user/profile/edit",[authJwt.verifyToken],users.editProfile);


    
};

