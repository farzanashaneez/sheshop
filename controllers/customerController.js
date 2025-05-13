const userModel=require('../models/userModel')
const HTTP_STATUS = require('../utils/httpStatus'); 


const customerController={
   
    async get_users(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
    
            const users = await userModel.find({})
                .skip(skip)
                .limit(limit);
    
            const totalUsers = await userModel.countDocuments();
            const totalPages = Math.ceil(totalUsers / limit);
    
            res.status(HTTP_STATUS.OK).render('customers', { 
                users, 
                currentPage: page, 
                totalPages, 
                limit 
            });
        } catch (err) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: err.message });
        }
    },
    
    async postBlockorUnblock(req, res){
        const userId = req.params.userId;
        console.log(userId)
        try {
            const user = await userModel.findById(userId);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
    
            // Toggle the isblock status
            user.isBlock = !user.isBlock;
            await user.save();
            res.status(HTTP_STATUS.OK).json(user);
        } catch (error) {
            console.error('Error toggling user status:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Error toggling user status' });
        }
    },
    async delete_users(req,res){
        try {
            const users=await userModel.find({});
    
        } catch (err) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: err.message });
        }
        res.status(HTTP_STATUS.NO_CONTENT).render('customers');
    }

};
module.exports=customerController