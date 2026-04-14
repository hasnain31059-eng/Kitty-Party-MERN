import mongoose from 'mongoose'
const committee_cycle_schema=new mongoose.Schema({
    committee_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"shared_committees"
    },
    cycle_number:{
        type:Number,
        default:1
    },
    start_date:{
        type:Date
    },
    deadline_date:{
        type:Date
    },
    end_date:{
        type:Date
    },
    active:{
        type:Boolean,
        default:true
    },
    cycle_winner_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"committee_members",
        default:null
    }
})

const committee_cycles=mongoose.model('committee_cycle',committee_cycle_schema);
export default committee_cycles;