import mongoose from 'mongoose'
const admin_rating_schema=new mongoose.Schema({
    committee_id:{
        type:mongoose.Schema.Types.ObjectId,
      
    },
    admin_id:{
         type:mongoose.Schema.Types.ObjectId,
    },
    member_id:{
         type:mongoose.Schema.Types.ObjectId,
    },
    rating:{
        type:Number,
        default:5
    }
})

const admin_ratings=mongoose.model('admin_ratings',admin_rating_schema);
export default admin_ratings;