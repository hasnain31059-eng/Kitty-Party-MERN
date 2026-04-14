import mongoose from 'mongoose'

const userSchema=new mongoose.Schema({
    name:{
        type:String
    },
    password:{
        type:String
    },
    monthly_income:{
        type:Number
    },
    phoneno:{
        type:String,
        unique:true  //when inserted a phoneno which already exist in db. db will send error.code===11000 which i have to handel manually.
    },
    profile_img:{
        type:String,
        default:'Signup/default-profile-image.jpg'
    },
    rating:{
        type:Number,
        default:5
    }
})
const users=mongoose.model("users",userSchema);
export default users;