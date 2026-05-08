import mongoose from "mongoose";
import bcrypt from "bcryptjs";


const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:[true,'Username is required'],
        unique:true,
        trim:true,
        minlength:[3,'Username must be at least 3 characters long']
    },
    email:{
        type:String,
        required:[true,'Email is required'],
        unique:true,
        lowercase:true,
        match:[/^\S+@\S+\.\S+$/,'Please provide a valid email address']
    },
    password:{
        type:String,
        required:[true,'Password is required'],
        minlength:[8,'Password must be at least 8 characters long'],
        select:false //do not return password field by default
    },
    profileImage:{
        type:String,
        default:null

    }
},{
    timestamps:true
});

// Use promise-based middleware only. Mixing async hooks with callback-style next()
// can produce "next is not a function" in newer Mongoose versions during signup.
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare passwords method
userSchema.methods.matchPassword=async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password);
};

// 
const User=mongoose.model('User',userSchema);
export default User;
