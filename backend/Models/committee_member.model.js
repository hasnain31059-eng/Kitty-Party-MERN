import mongoose from 'mongoose'
const committee_member_schema=new mongoose.Schema({
    committee_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'shared_committees'
        //foreign key from the sharedCommittee table _id
    },
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users'
        //foreign key user table _id
    },
    user_rating:{
        type:Number,
        default:5
        //take this rating of all joined committees calculate average that reflect user.model.js rating.
    },
    got_the_committee:{
        type:Boolean,
        default:false
    },
    turn_number:{
        type:Number  //this is equal to the number of member in the shared committee.
    },
    active:{
        type:Boolean,
        default:true
    }
})

const committee_members=mongoose.model('committee_members',committee_member_schema);
export default committee_members