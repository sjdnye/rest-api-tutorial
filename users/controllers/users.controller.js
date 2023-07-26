const UserModel = require('../models/users.model');
const crypto = require('crypto');

exports.insert = (req, res) => {
    let salt = crypto.randomBytes(16).toString('base64');
    let hash = crypto.createHmac('sha512', salt).update(req.body.password).digest("base64");
    req.body.password = salt + "$" + hash;
    req.body.permissionLevel = 1;
    UserModel.createUser(req.body)
        .then((result) => {
            res.status(201).send({id: result._id});
        });
};

exports.list = (req, res) => {
    let limit = req.query.limit && req.query.limit <= 100 ? parseInt(req.query.limit) : 10;
    let page = 0;

    const returnFriendsData = req.query.additional === "friends" ? true : false;

    if (req.query) {
        if (req.query.page) {
            req.query.page = parseInt(req.query.page);
            page = Number.isInteger(req.query.page) ? req.query.page : 0;
        }
    }
    UserModel.list(limit, page, returnFriendsData)
        .then((result) => {
            res.status(200).send(result);
        })
};

exports.getById = (req, res) => {
    const returnFriendsData = req.query.additional === "friends" ? true : false;

    UserModel.findById(req.params.userId, returnFriendsData)
        .then((result) => {
            res.status(200).send(result);
        });
};
exports.patchById = (req, res) => {
    if (req.body.password) {
        let salt = crypto.randomBytes(16).toString('base64');
        let hash = crypto.createHmac('sha512', salt).update(req.body.password).digest("base64");
        req.body.password = salt + "$" + hash;
    }

    UserModel.patchUser(req.params.userId, req.body)
        .then((result) => {
            res.status(204).send({});
        });

};

exports.removeById = (req, res) => {
    UserModel.removeById(req.params.userId)
        .then((result)=>{
            res.status(204).send({});
        });
};

exports.handleAddddFriend = async(req, res) => {
    const userId = req.params.userId;
    const {friendId} = req.body;

    try{
        await UserModel.addFriend(userId,friendId)

        res.status(200).json({friendId: friendId,message: "User added to list successfully"})

    }catch(err){
        res.status(400).json({message: err})
    }
}

exports.handleRemoveFriend = async(req, res) => {
    const userId = req.params.userId;
    const {friendId} = req.body;

    try{
        await UserModel.removeFriend(userId,friendId)

        res.status(200).json({friendId: friendId ,message: "User removed from list successfully"})

    }catch(err){
        res.status(400).json({message: err})
    }

}