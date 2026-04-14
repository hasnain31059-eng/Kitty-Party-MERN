import mongoose from 'mongoose'
const cycle_bidding_Schema=new mongoose.Schema({
    cycle_id:{
        type:mongoose.Schema.Types.ObjectId
        //Foreign key committee_cycle.model.js          _id
    },
    member_id:{
        type:mongoose.Schema.Types.ObjectId
        //Foreign key user.model.js     _id
    },
    amount:{
        type:Number
    }
})
const cycle_biddings=mongoose.model('cycle_biddings',cycle_bidding_Schema);
export default cycle_biddings