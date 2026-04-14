import mongoose from 'mongoose'

const notificationSchema=new mongoose.Schema({
    receiver_id:{
        type:mongoose.Types.ObjectId  ///jis k number sa committees show ho gi. committe ka admin
    },
    committee_id:{
        type:mongoose.Types.ObjectId  // jo committee join karni ha.
    },
    user:{
     type:Object  //jis naa committee join karni ha.
    },
    committee_detail:{
        type:Object    //jb member invite karaa ga tb is ko use karaa gaa.
    },
    number_of_committee:{
        type:Number,
        default:1
    },
    member_id:{
        type:mongoose.Types.ObjectId   //this is only used for payment notification
    },
    amount:{
        type:Number
    },
    cycle_id:{
        type:mongoose.Types.ObjectId  //this is used for payemnt notification 
    },
    payment_type:{
        type:String
    },
    message:{
        type:String
    },
    notification_type:{
        type:Number       
          // 1:join a committee request from user to admin of committee.
          // 2: if admin reject the request.
          // 3: user invite a member to join a committee.
          // 4: user send the notification for the payment approval.
          // 5: admin send to user notification of rejection of the payment incuting the rejection message
          //6: user got the kitty and exit and give back the amount to admin
          
    }

})

const notifications=mongoose.model('notifications',notificationSchema);
export default notifications;