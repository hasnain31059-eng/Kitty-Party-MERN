import mongoose from 'mongoose'
const sharedCommitteeSchema = new mongoose.Schema({
    committee_name: {
        type: String
    },
    amount: {
        type: Number
    },
    start_date: {
        type: Date
    },
    days_gap: {
        type: Number
    },
    deadline_day: {
        type: Number
    },
    committee_leaving_type: {
        type: String
    },
    committee_type: {
        type: String
    },
    members_arrange_type: {
        type: String
    },
    enrollment_period: {
        type: Boolean,
        default: true
    },
    number_of_member: {
        type: Number,
        default: 0
    } ,
    admin_id: {
        type: mongoose.Schema.Types.ObjectId,
    }
})

const sharedcommittees = mongoose.model('shared_committees', sharedCommitteeSchema);
export default sharedcommittees;