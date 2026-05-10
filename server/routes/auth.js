import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

//  SIGNUP


router.post("/signup",async(req,res) =>{
    try{
        const {name,email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if(existingUser) return res.status(400).json({msg : "User already exists"})
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await new User({name, email, password: hashedPassword }).save();
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
        res.status(201).json({ token}); 
    } 
    catch(err){
        res.status(500).json({ msg: err.message });
    }
}) 



router.post('/signup', async(req,res) =>{
    try{
       const {name,email,password} = req.body;
       const existingUser = User.findOne({email});
        if (existingUser) return res.status(400).json({msg : "User already exists "})

            const hashedPassword = await bcrypt.hash(password , 10);
            const newUser = await new User({name , email ,password: hashedPassword}).save();
            const token = jwt.sign


    }
    catch(err){

    }
})
//  LOGIN
// router.post('/login', async (req,res) =>{
//     try{
//         const {email, password} = req.body;
//         const user = await User.findOne({ email });
//         if ( !user) return res.status(400).json({msg: 'User not found '});

//         const isMatch = await bcrypt.compare(password,user.password);
//         if(!isMatch) return res.status(400).json({msg:'Invalid credentials'});

//         const token = jwt.sign({id: user._id} , process.env.JWT_SECRET);
//         res.status(200).json({token});
//     }
//      catch(err){
//         res.status(500).json({msg: err.message})
//      }
// })

router.post("/login", async (req, res) => {
try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.status(200).json({ token });
} catch (err) {
    res.status(500).json({ msg: err.message });
}
});

export default router;