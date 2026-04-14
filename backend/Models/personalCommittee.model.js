import mongoose from 'mongoose'
const personalCommitteeSchema = new mongoose.Schema({
    committee_admin_id: {
        type: String
    },
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
    total_cycle: {
        type: Number
    },

    enrollment_period: {
        type: Boolean,
        default: false
    }

})

const personalcommittees = mongoose.model('personalcommittees', personalCommitteeSchema);
export default personalcommittees;