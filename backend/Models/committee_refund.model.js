import mongoose from 'mongoose'
const refund_Schema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId
    },
    committee_id: {
        type: mongoose.Schema.Types.ObjectId
    },
    amount:{
        type:Number
    }
    ,
    payment_img: {
        type: String,
        default: null
    },
    payment_type:{
        type:String,
        default:'Not Paid yet'
    },
    payment_status: {
        type: Boolean,
        default: false
    },
    approval: {
        type: Boolean,
        default: false
    }
})

const refunds = mongoose.model('refunds', refund_Schema);
export default refunds