const db = require("../models");
const mongoose = require("mongoose");
const User = db.users;
var md5 = require('md5');
var jwt = require('jsonwebtoken');
var validator = require("email-validator");
const otpGenerator = require('otp-generator')
const { sendmail, forgotHtml, vrifyAccountHtml } = require('../config/mail.js');
const formidable = require('formidable');
const Item = db.items;
const fs = require('fs')
const ObjectId = mongoose.Types.ObjectId;



const userView = async (user) => {
    const object = {
        id: user.id,
        id_social: !!user.id_social ? user.id_social : "",
        user_name: !!user.user_name ? user.user_name : "",
        name: !!user.user_name ? user.user_name : "",
        email: !!user.email ? user.email : "",
        phone_number: !!user.phone_number ? user.phone_number : "",
        address: !!user.address ? user.address : "",
        social_type: !!user.social_type ? user.social_type : "",
        profile_photo: (!!user.userItem && user.userItem.length > 0) ? await itemLink(user.userItem[0]) : "",
        role: user.role,
        status: user.status
    }
    return object
}


const itemLink = (item) => {
    return process.env.IMAGEURL + '/' + item.name + '.' + item.ext
}



exports.register = async (req, res) => {
    if (!req.body.email || !req.body.password) {
        return res.status(400).send({
            message: "Please Enter Required Field"
        });
    }
    try {
        const otp = otpGenerator.generate(4, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
        const user = new User({
            email: req.body.email,
            password: md5(req.body.password),
            otp: md5(parseInt(otp)),
            role: req.body.role
        })
        const users = await user.save(user)
        const user_Data = {
            to: req.body.email,
            subject: 'Verify Email',
            html: await vrifyAccountHtml(otp)
        }
        const send = await sendmail(user_Data)
        var token = jwt.sign({ id: users.id }, 'tixzar_app', {
            expiresIn: 604800 // 7 days
        });
        var data = {
            status: true,
            message: "Successfully Register",
            token: token,
            data: await userView(users),
        }
        return res.send(data)
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            status: false,
            message: error.message || "Somthing Went To Wrong"
        });
    }
}

exports.login = async (req, res) => {
    if (!req.body.email || !req.body.password) {
        return res.status(400).send({
            message: "Please Enter User_name And Password"
        });
    }
    try {
        const findUser = await User.findOne({ email: req.body.email, password: md5(req.body.password), status: 'active' })
        if (!!findUser) {
            var token = jwt.sign({ id: findUser.id }, 'tixzar_app', {
                expiresIn: 604800 // 24 hours
            });
            const userObject = await userView(findUser)
            var data = {
                status: true,
                message: "Successfully Login",
                token: token,
                data: userObject,
            }
            return res.send(data)
        } else {
            return res.status(500).send({
                status: false,
                message: "Please Enter Correct User_name or Email And Password"
            });
        }
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            status: false,
            message: error.message || "Somthing Went To Wrong"
        });
    }
}

exports.socialLogin = async (req, res) => {
    if (!req.body.id_social || !req.body.social_type) {
        return res.status(400).send({
            message: "Please Enter Social ID"
        });
    }
    try {
        const findUser = await User.findOne({ id_social: req.body.id_social, social_type: req.body.social_type, status: 'active' })
        if (!!findUser) {
            var token = jwt.sign({ id: findUser.id }, 'tixzar_app', {
                expiresIn: 604800 // 24 hours
            });
            const userObject = await userView(findUser)
            var data = {
                status: true,
                message: "Successfully Login",
                token: token,
                data: userObject,
            }
            return res.send(data)
        } else {
            const user = new User({
                email: req.body.email,
                id_social: req.body.id_social,
                social_type: req.body.social_type,
                status: 'active',
                role: req.body.role
            })
            const users = await user.save(user)
            var token = jwt.sign({ id: users.id }, 'tixzar_app', {
                expiresIn: 604800 // 7 days
            });
            var data = {
                status: true,
                message: "Successfully Login",
                token: token,
                data: await userView(users),
            }
            return res.send(data)
        }
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            status: false,
            message: error.message || "Somthing Went To Wrong"
        });
    }
}

exports.forgotPassword = async (req, res) => {
    if (!req.body.email) {
        return res.status(400).send({
            message: "Please enter email!"
        });
    }
    try {
        var data;
        const findEmail = await User.findOne({ email: req.body.email, status: 'active' })
        if (!!findEmail) {
            const otp = otpGenerator.generate(4, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
            const userObject = await User.updateOne({ _id: findEmail.id }, { otp: md5(parseInt(otp)) })
            const user_Data = {
                to: req.body.email,
                subject: 'Forgot Password',
                html: await forgotHtml(otp)
            }
            const send = await sendmail(user_Data)
            const userDetail = await userView(findEmail)
            data = {
                status: true,
                message: `Succesfully sent otp ${req.body.email}`,
                data: userDetail,
            }
        } else {
            data = {
                status: false,
                message: "Please enter correct email",
            }
        }
        return res.send(data)
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            status: false,
            message: error.message || "Somthing went to wrong!"
        });
    }
}

exports.verifyOTP = async (req, res) => {
    if (!req.body.id || !req.body.otp) {
        return res.status(400).send({
            message: "Please enter required field!"
        });
    }
    try {
        var data
        const findUser = await User.findOne({ otp: md5(req.body.otp), _id: req.body.id })
        if (!!findUser) {
            const updateUser = await User.updateOne({ _id: findUser.id }, { status: 'active' })
            const userDetail = await userView(findUser)
            userDetail.status = 'active'
            var token = jwt.sign({ id: findUser.id }, 'tixzar_app', {
                expiresIn: 604800 // 7 days
            });
            data = {
                status: true,
                message: 'OTP verified succesfully!',
                token: token,
                data: userDetail,
            }
        } else {
            data = {
                status: false,
                message: "Please enter correct OTP!",
            }
        }
        return res.send(data)
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            status: false,
            message: error.message || "Somthing went to wrong!"
        });
    }
}

exports.createPassword = async (req, res) => {
    if (!req.body.id || !req.body.password) {
        return res.status(400).send({
            message: "Please enter required field!"
        });
    }
    try {
        if (req.body.id == req.userId) {
            const userUpdate = await User.updateOne({ _id: req.body.id }, { password: md5(req.body.password) })
            var data = {
                status: true,
                message: `Password created succesfully!`,
            }
        } else {
            var data = {
                status: false,
                message: `Please Enter Correct Data!`,
            }
        }
        return res.send(data)
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            status: false,
            message: error.message || "Somthing went to wrong!"
        });
    }
}

exports.upload = async (req, res) => {
    try {
        let form = new formidable.IncomingForm();
        form.keepExtensions = true;
        form.multiples = false;
        form.uploadDir = __dirname + '/../public'
        form.maxFileSize = process.env.UPLOAD_MAX_FILE_SIZE;
        form.on('file', async function (field, file) {
            var fExt1 = file.originalFilename.split(".");
            fs.rename(file.filepath, form.uploadDir + "/" + file.newFilename + '.' + fExt1[fExt1.length - 1], (err) => {
                if (err) {
                    console.log(err);
                }
            });
        });
        const files = await new Promise(async function (resolve, reject) {
            form.parse(req, async function (err, fields, files) {
                if (err) {
                    console.error("Error Reject Promise", err);
                    reject(err);
                } else {
                    resolve({ fields, files });
                }
            })
        });
        if (!!files.files.file) {
            var fExt = files.files.file.originalFilename.split(".");
            const itemData = new Item({
                name: files.files.file.newFilename,
                type: !!files.fields.type ? files.fields.type : "image",
                ext: fExt[fExt.length - 1],
                id_user: req.userId,
            })
            const item = await itemData.save(itemData)
            const itemObject = {
                id: item.id,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                status: item.status,
                name: item.name,
                type: item.type,
                ext: item.ext,
                id_user: item.id_user,
                itemUrl: await itemLink(item)
            }
            var data = {
                status: true,
                data: itemObject,
            }
            return res.send(data)
        } else {
            return res.status(500).send({
                status: false,
                message: "Please Uplaod File"
            });
        }
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            status: false,
            message: error.message || "Somthing Went To Wrong"
        });
    }
}



exports.viewProfile = async (req, res) => {
    if (!req.body.userId) {
        return res.status(500).send({
            status: false,
            message: 'Please Enter User ID'
        });
    }
    try {
        const user = await User.findOne({ _id: req.body.userId, status: 'active' })
        if (!!user) {
            const userObject = await userView(user)
            if (!!user.id_item_profile) {
                const findItem = await Item.findOne({ _id: user.id_item_profile })
                userObject.profile_photo = await itemLink(findItem)
            }
            var data = {
                status: true,
                message: "User Profile Fetched Successfully",
                data: userObject,
            }
            return res.send(data)
        } else {
            return res.status(500).send({
                status: false,
                message: "User Not Found"
            });
        }

    } catch (error) {
        console.log(error)
        return res.status(500).send({
            status: false,
            message: error.message || "Somthing Went To Wrong"
        });
    }
}



exports.editProfile = async (req, res) => {
    try {
        const updateUser = await User.updateOne({ _id: req.userId }, req.body)
        const findUser = await User.aggregate([
            { $match: { _id: ObjectId(req.userId), status: 'active' } },
            { $addFields: { imgIdObjId: { $toObjectId: '$id_item_profile' } } },
            {
                $lookup: {
                    from: 'items',
                    localField: 'imgIdObjId',
                    foreignField: '_id',
                    as: 'userItem'
                }
            }])
        var data = {
            status: true,
            data: await userView(findUser[0]),
            message: "Successfully Updated Personal Information",
        }
        return res.send(data)
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            status: false,
            message: error.message || "Somthing Went To Wrong"
        });
    }
}