const userModel=require('../models/userModel')


const customerController={
    
    async get_users(req,res){
        try {
            const users=await userModel.find({});
            console.log(users)
            res.render('customers',{users});
        } catch (err) {
            res.status(500).json({ message: err.message });
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
    
            console.log(user)
            res.json(user);
        } catch (error) {
            console.error('Error toggling user status:', error);
            res.status(500).json({ message: 'Error toggling user status' });
        }
    },
    async delete_users(req,res){
        try {
            const users=await userModel.find({});
            console.log(users)
    
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
        res.render('customers');
    }

};
module.exports=customerController