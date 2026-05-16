import mongoose from 'mongoose';
const committee_payment_schema = new mongoose.Schema({
    cycle_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"committee_cycle"
        //foreign key committee_cycle    _id
    },
    member_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"committee_members"
        //foreign key committee_member   _id
    },
    payment_type:{
        type:String,
        default:'Not Paid yet' //cash or online
    },
    payment_img:{
        type:String,
        default:null
    },
    payment_status:{
        type:Boolean,
        default:false
    },
    approval:{
        type:Boolean,
        default:false
    }
})
const committee_payment=mongoose.model('committee_payment',committee_payment_schema);
export default committee_payment;