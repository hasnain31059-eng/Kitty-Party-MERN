import mongoose from 'mongoose'
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
import upload from './MiddleWare/multer.middleware.js'
import usermodel from './Models/user.model.js'
import personalCommittee from './Models/personalCommittee.model.js'
import sharedCommittee from './Models/shared_Committee.model.js'
import committeemember from './Models/committee_member.model.js'
import committeecycle from './Models/committee_cycle.model.js'
import notificationmodel from './Models/notification.model.js'
import committee_payment from './Models/committee_payment.model.js'
import committee_cycles from './Models/committee_cycle.model.js'
import sharedcommittees from './Models/shared_Committee.model.js'
import committee_members from './Models/committee_member.model.js'
import cycle_biddings from './Models/cycle_bidding.model.js'
import users from './Models/user.model.js'
import committee_refund from './Models/committee_refund.model.js'


const app = express();
dotenv.config();
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}
));
app.use('/Images', express.static('Images'));
app.use(cookieParser());//used to read cookies 


app.listen(process.env.PORT, () => {
    console.log("Server Started");
    committee_winners();
})

mongoose.connect(process.env.DBURL).then(() => {
    console.log("DataBase Connected");

})

app.get('/', (req, res) => {
    res.send("testing");
})
///////////////////////////////////////////////////////////Sign Up Page //////////////////////////////////////

app.post('/create_user', upload.single('profile_img'), async (req, res) => {
    try {
        let data = req.body;
        let singlefile = req.file;
        if (singlefile) {
            const newuser = new usermodel({
                name: data.name,
                password: data.password,
                monthly_income: data.monthly_income,
                phoneno: data.phoneno,
                profile_img: `http://localhost:8080/Images/${singlefile.filename}`
            });
            await newuser.save();
            res.send("user Created");
        }
        else {
            const newuser = new usermodel({
                name: data.name,
                password: data.password,
                monthly_income: data.monthly_income,
                phoneno: data.phoneno,
            });
            await newuser.save();
            res.send("user Created");
        }

    }
    catch (error) {
        if (error.code === 11000) {
            return res.send("account on this number already exists");
        }
        res.send(`Error in Creating New User`);
    }
})


////////////////////////////////////////Login Page/////////////////////////////////////////////


app.post('/login', async (req, res) => {
    try {
        let temp = req.body;
        let data = await usermodel.findOne({ 'phoneno': temp.phoneno, 'password': temp.password });
        if (data) {
            const token = jwt.sign({ "phoneno": temp.phoneno }, 'shhh');
            res.cookie("phoneno", token);//cookie name and data
            return res.send("User Found");
        }
        else {
            let tempphone = await usermodel.findOne({ "phoneno": temp.phoneno });
            if (tempphone) {
                res.send("Wrong Password");
            }
            else {
                res.send("No Account Found on This Number");
            }
        }
    }
    catch (error) {
        res.send(`Error ${error}`);
    }
})



app.post('/verify-login', (req, res) => {
    let acookie = req.cookies.phoneno;
    if (!acookie) {
        return res.send("No Cookie Found");
    }
    try {

        let error = jwt.verify(acookie, 'shhh');
        res.send("Authorized");
    }
    catch (error) {
        res.send("UnAuthorized =Cookie Expired or Altered");
    }
})

app.get('/logout', (req, res) => {
    try {
        res.clearCookie("phoneno");
        return res.send('Loging Out');
    }
    catch (error) {
        res.send("Error Loging Out");
    }
})

///////////////////////////////Profile/////////////////////////////
app.get('/getprofile', async (req, res) => {

    try {
        let cokie = req.cookies.phoneno;//take saved cookie mobilephoneno
        if (!cokie) {
            return res.send("No Cookie Found");
        }
        let decode = jwt.verify(cokie, 'shhh'); //decode={ phoneno: '123', iat: 1769410131 }
        const phoneno = decode.phoneno;
        let data = await usermodel.findOne({ 'phoneno': phoneno });
        res.send(data);
    }
    catch (error) {
        res.send(`Error occured=${error}`);
    }

})


app.put('/deleteprofileimg', async (req, res) => {
    try {
        let id = req.body._id;
        let data = await usermodel.updateOne({ "_id": id }, { $set: { "profile_img": "Signup/default-profile-image.jpg" } });
        res.send('profileimg deleted');
    }
    catch (error) {
        res.send({ "error": `${error} profileimg not deleted` });
    }
})

app.put('/updateprofileimg', upload.single('profile_img'), async (req, res) => {
    try {
        let id = req.body._id;
        let profile_img = req.file
        await usermodel.updateOne({ "_id": id }, { "profile_img": `http://localhost:8080/Images/${profile_img.filename}` });
        res.send('profileimg updated');
    }
    catch (error) {
        res.send({ "error": `${error} profileimg not deleted` });
    }
})


app.put('/update-user/:id', upload.single('profile_img'), async (req, res) => {
    try {
        let data = req.body;
        let singlefile = req.file;
        if (singlefile) {
            await usermodel.updateOne(
                { '_id': req.params.id }
                ,
                {//user change file
                    name: data.name,
                    password: data.password,
                    monthly_income: data.monthly_income,
                    phoneno: data.phoneno,
                    profile_img: `http://localhost:8080/Images/${singlefile.filename}`
                });
            let token = jwt.sign({ 'phoneno': data.phoneno }, 'shhh');
            res.clearCookie("phoneno");
            res.cookie('phoneno', token);
            res.send("updated");
        }
        else {
            await usermodel.updateOne(
                { '_id': req.params.id }
                ,
                {//if user dont chage the file
                    name: data.name,
                    password: data.password,
                    monthly_income: data.monthly_income,
                    phoneno: data.phoneno,
                });
            let token = jwt.sign({ 'phoneno': data.phoneno }, 'shhh');
            res.clearCookie("phoneno");
            res.cookie('phoneno', token);
            res.send("updated");
        }
    }
    catch (error) {
        res.send(error);
    }
})
//////////////////////////////Create Committee Pages/////////////////////////////////
/////////////////////////////////////////////////////personal Committee/////////////////////////////////////

app.post('/personal-committee', async (req, res) => {
    try {
        let data = req.body;//{committee_admin_id,committee_name,amount,start_date,days_gap,deadline_day,total_cycle}

        // SAVE the committee first
        const newpersonalcommittee = new personalCommittee(data);
        let pcommittee = await newpersonalcommittee.save();


        // Convert raw strings to proper types for the loop 
        const startDate = new Date(data.start_date);
        const deadlineDays = Number(data.deadline_day);
        const daysGap = Number(data.days_gap);
        const totalCycles = Number(data.total_cycle);

        for (let i = 0; i < totalCycles; i++) {
            let date_data = dates_calculator_function(
                startDate, // Pass the Date Object here
                deadlineDays,
                daysGap,
                i + 1
            );
            let new_cycle;
            if (i === totalCycles - 1) {//check the cycle is last cycle
                new_cycle = new committee_cycles({
                    'committee_id': pcommittee._id,
                    'cycle_number': i,
                    'start_date': date_data.start_date,
                    'deadline_date': date_data.deadline_date,
                    'end_date': date_data.end_date,
                    'cycle_winner_id': data.committee_admin_id
                });
            }
            else {
                new_cycle = new committee_cycles({
                    'committee_id': pcommittee._id,
                    'cycle_number': i,
                    'start_date': date_data.start_date,
                    'deadline_date': date_data.deadline_date,
                    'end_date': date_data.end_date
                });
            }
            let current_cycle = await new_cycle.save();
            let newcommittee_payment = new committee_payment({
                'cycle_id': current_cycle._id,
                'member_id': data.committee_admin_id
            })
            await newcommittee_payment.save();
        }

        res.send("Committee Created");
    } catch (error) {
        res.status(500).send(`error occurred: ${error.message}`);
    }
});

app.get('/all-personal-committees/:id', async (req, res) => {
    try {
        let _id = req.params.id //user_id;
        let data = await personalCommittee.find({ 'committee_admin_id': _id });
        res.send(data);
    }
    catch (error) {
        console.log(error);
    }
})

app.get('/get-current-personal-cycle/:id', async (req, res) => {
    let committee_id = req.params;
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    let data = await committee_cycles.aggregate([
        {
            $match: {
                'committee_id': new mongoose.Types.ObjectId(committee_id),
                'start_date': { $lte: today },
                'end_date': { $gte: today }
            }
        }
        ,
        {
            $lookup: {
                from: 'committee_payments',
                localField: '_id',
                foreignField: 'cycle_id',
                as: 'cycle_payment_details'
            }
        },
        {
            $unwind: "$cycle_payment_details"
        }
        ,
        {
            $match: {
                "cycle_payment_details.payment_status": false
            }
        }
    ]);
    res.send(data);
})
app.get('/verify-ending-date/:id', async (req, res) => {
    let committee_id = req.params.id;
    let current_date = new Date();
    current_date.setUTCHours(0, 0, 0, 0);
    let data = await committee_cycles.findOne({ committee_id, end_date: { $eq: current_date } });
    if (data) {
        res.send('Committee Ended')
    }
    res.send('Committee End Soon');
})
app.delete('/leave-personal-committee/:id', async (req, res) => {
    try {
        const committee_id = req.params.id;

        // 1. Find all cycles belonging to this committee to get their IDs
        const all_cycles = await committee_cycles.find({ committee_id: committee_id });

        // Extract just the IDs into an array: [id1, id2, id3...]
        const cycleIds = all_cycles.map(cycle => cycle._id);

        // 2. Delete all payments that match any of those cycle IDs
        // Using $in allows you to delete all matching payments in one command
        await committee_payment.deleteMany({
            cycle_id: { $in: cycleIds }
        });

        // 3. Now delete the cycles themselves
        await committee_cycles.deleteMany({ committee_id: committee_id });

        // 4. Finally, delete the main committee record
        await personalCommittee.deleteOne({ _id: committee_id });

        res.status(200).json({
            message: "Committee, related cycles, and payments deleted successfully"
        });

    } catch (error) {
        res.status(500).send(`Error occurred: ${error.message}`);
    }
});
app.put('/personal-payment', upload.single('payment_img'), async (req, res) => {
    let obj = req.body;
    if (obj.payment_type === 'cash') {
        await committee_payment.updateOne({ 'cycle_id': obj.cycle_id }
            ,
            { $set: { 'payment_type': obj.payment_type, 'payment_status': true, 'approval': true } }
        )
    }
    else {
        let file = req.file.filename;
        await committee_payment.updateOne({ 'cycle_id': obj.cycle_id }
            ,
            { $set: { 'payment_type': obj.payment_type, 'payment_status': true, 'approval': true, 'payment_img': file } }
        )
    }
    res.send("Payment SuccessFul")
})
/////////////////////////////////////////      Shared Committee //////////////////////////////////

let dates_calculator_function = (sd, dd, dg, cn) => {
    //start_date==sd   deadline_date===dd  days_gap===dg   cyclenumber>>number_of_member in committee==cn  
    let cycledate = new Date(sd);
    cycledate.setDate(cycledate.getDate() + ((cn - 1) * dg));
    let deadline_date = new Date(cycledate);
    deadline_date.setDate(cycledate.getDate() + dd);
    let end_date = new Date(cycledate);
    end_date.setDate(cycledate.getDate() + dg);
    return { "start_date": cycledate, "end_date": end_date, "deadline_date": deadline_date }

}
app.post('/shared-committee', async (req, res) => {
    try {
        let data = req.body;
        //creating shared committee
        const newsharedcommittee = new sharedCommittee(data);
        await newsharedcommittee.save();
        res.send("Committee Created");
    }
    catch (error) {
        res.send(`error connured=${error}`);
    }
})



/////////////////////////////////////////      invite-Member      ///////////////////////////
app.get('/invite-member/:phoneno', async (req, res) => {
    try {
        let number = req.params.phoneno;
        let singleuser = await usermodel.findOne({ 'phoneno': number });
        res.send(singleuser);
    }
    catch (error) {
        console.log(error);
    }
})

///////////////////////////////////////   Lobby Page   /////////////////////////////////////////////////////////   

app.get('/get-all-joined-committees/:id', async (req, res) => {
    try {
        let user_id = new mongoose.Types.ObjectId(req.params.id);
        let data = await committeemember.aggregate([//joining committee_members with committee_details table
            {
                $match: {
                    user_id: user_id,    //fetch all the members of specific userid       ///Work on left side table only
                    active: true
                }
            }
            ,
            {
                $lookup: {
                    from: "shared_committees",
                    localField: "committee_id",   ///join two table happens here
                    foreignField: "_id",
                    as: "committee_details"
                }
            },
            {
                $match: {
                    'committee_details': { $ne: [] } ///this is written after the join so work on the resulting joined table only.
                }
            },
            {
                $unwind: '$committee_details'
            }

        ]);
        res.send(data);
    }
    catch (error) {
        console.log(error);
    }

})
app.get('/get-all-committees-of-admin/:id', async (req, res) => {
    let id = req.params.id;
    let data = await sharedcommittees.find({ 'admin_id': id });
    res.send(data);
})


////////////////////////////////////////////////// Committee details /////////////////////////////////////////////////
app.post('/this-month-dues', async (req, res) => {
    const today = new Date(req.body.today);
    today.setUTCHours(0, 0, 0, 0);

    const committee_id = new mongoose.Types.ObjectId(req.body.committee_id);
    const member_id = new mongoose.Types.ObjectId(req.body.committee_member_id);//joining the committee_cycle_table with the comittee_payments_table.

    let data = await committeecycle.aggregate([
        {//aggrigate work in step by step in {}'s
            //here i am applying condition to the first table 
            $match: {
                'committee_id': committee_id,
                'start_date': { $lte: today },
                'active': true
            }
        },
        {// here i join both table.
            $lookup: {
                from: 'committee_payments',
                localField: '_id',
                foreignField: 'cycle_id',
                as: 'payment_details'
            }
        },
        {//here i open the 2nd table array to do condition work on it
            $unwind: '$payment_details'
        },
        { //here i do condition work on the 2nd table.
            $match: {
                'payment_details.member_id': member_id,
                'payment_details.payment_status': false
            }
        }

    ])

    res.send(data);

});


async function committee_winners() {
    try {

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        //////////////////////////////////////////////////////////////////////////////saraa cycle jis k winner select karnaa ha
        let cycles = await committee_cycles.aggregate([
            {
                $match: { 'end_date': today, 'cycle_winner_id': null, 'active': true }
            },
            {
                $lookup: {
                    from: 'shared_committees',
                    localField: 'committee_id',
                    foreignField: '_id',
                    as: 'committee_detail'
                }
            },
            {
                $unwind: '$committee_detail'
            }
        ])
        ////////////////////////////////////////////////////////////////////////1 by 1 committee k member laow aur aur unaa sort  karoo.
        cycles.map(async (value, index) => {

            let committee_type = value.committee_detail.committee_type;//1:simple  2:bidding  3:spin
            let member_arrange_type = value.committee_detail.members_arrange_type;//1:arrrange by admin  2:arrange by alphabet
            let cycle_id = value._id;
            let committee_id = value.committee_id;
            let enrollment_period = value.committee_detail.enrollment_period;

            let all_members_of_current = [];

            if (member_arrange_type === '1') {
                all_members_of_current = await committee_members.aggregate([
                    {
                        $match: { 'committee_id': value.committee_id, 'got_the_committee': false, active: true }
                    },
                    //saraa member ko turn number sa sort kia .
                    {
                        $sort: { 'turn_number': 1 }
                    }
                ]);
            }
            else {
                all_members_of_current = await committee_members.aggregate([
                    {
                        $match: { 'committee_id': value.committee_id, 'got_the_committee': false, active: true }
                    },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'user_id',           // memebr table ko user table sa is lia join kia sort by name
                            foreignField: '_id',
                            as: 'user_detail'
                        }
                    },
                    {
                        $unwind: '$user_detail'
                    },
                    {
                        $sort: { 'user_detail.name': 1 }
                    }
                ]);
            }
            ////////////////////////////////////////////////////////////////////////////////////////////////ab inn member sa committee ka owner select karo.
            //jo k array k top par ha. ye simple k lia ha .

            let winner_id;///is ma member id daaloo ga jo k win kia ha ... inteeno if ka result is ma ha.
            if (committee_type === '1') {
                if (all_members_of_current.length > 0) {
                    winner_id = all_members_of_current[0]._id;
                }
                else {
                    console.log('committee has no members left who havent won yet')
                }
            }
            else if (committee_type === '2') {


                let all_bidders = await cycle_biddings
                    .find({ cycle_id: cycle_id })
                    .sort({ amount: -1 });

                if (all_bidders.length === 0) {
                    if (all_members_of_current.length > 0) {
                        winner_id = all_members_of_current[0]._id;
                    }
                    else {
                        console.log("No Member Left who dont get the committee")
                    }
                }
                else {
                    let winner_bidder = all_bidders[0];//{cycle_id,member_id,amount}
                    winner_id = winner_bidder.member_id;
                }

            }
            else if (committee_type === '3') {
                if (all_members_of_current.length === 0) {
                    console.log("all_members_of_current array is empty");
                } else {
                    const randomItem = all_members_of_current[Math.floor(Math.random() * all_members_of_current.length)];
                    winner_id = randomItem._id;
                }
            }

            ///////////////////////////////////////////////////////////////////////  yehaa ma winner save karoo ga.
            if (winner_id) {
                await committee_cycles.updateOne({ 'committee_id': committee_id, '_id': cycle_id }, { $set: { 'cycle_winner_id': winner_id } });
                await committeemember.updateOne({ '_id': winner_id }, { $set: { 'got_the_committee': true } });
                if (enrollment_period) {
                    await sharedCommittee.updateOne({ '_id': committee_id }, { $set: { 'enrollment_period': false } });
                }
            }

        })


    }
    catch (error) {
        console.log(error);
    }
}

app.post('/current-cycle-committee-winner', async (req, res) => {
    const date = new Date(req.body.today);
    let committee_id = new mongoose.Types.ObjectId(req.body.committee_id);
    date.setUTCHours(0, 0, 0, 0); //  Set the time to exactly 00:00:00.000 in UTC
    let data = await committeecycle.aggregate([
        {
            $match: {
                'committee_id': committee_id,
                'end_date': date,
            }
        }
        ,
        {
            $lookup: {
                from: 'committee_members',
                localField: 'cycle_winner_id',
                foreignField: '_id',
                as: 'member'
            }
        }
        ,
        {
            // preserveNullAndEmptyArrays ensures you don't lose the cycle if no winner is found
            $unwind: { path: '$member', preserveNullAndEmptyArrays: true }
        }
        ,
        {
            $lookup: {
                from: 'users',
                localField: 'member.user_id',
                foreignField: '_id',
                as: 'user_detail'
            }
        }
        ,
        {
            $unwind: '$user_detail'
        }

    ])

    res.send(data[0]);

})


app.get('/remaining-members/:id', async (req, res) => {
    const committee_id = new mongoose.Types.ObjectId(req.params.id);

    try {
        const data = await committeemember.aggregate([
            //  Remaining members only            joining the [committee_memebrs] [committee_cycle] [users]
            {
                $match: {
                    committee_id: committee_id,
                    got_the_committee: false,
                    active: true,
                }
            },

            {
                $lookup: {
                    from: 'users',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'user_detail'
                }
            }
            ,
            {
                $unwind: '$user_detail'
            }
            ,
            {
                $sort: { 'turn_number': 1 }
            }
        ]);

        res.send(data);
    } catch (err) {
        res.status(500).send(err.message);
    }
});


////////////////////////////////////////////////   join Committee   //////////////////////////////////////////////////

app.get('/committee-of-this-no/:number', async (req, res) => {
    let phoneno = req.params.number;
    let data = await usermodel.aggregate([
        {
            $match: { 'phoneno': phoneno }
        },
        {
            $lookup: {
                from: 'shared_committees',
                localField: '_id',
                foreignField: 'admin_id',
                as: 'committee_detail'
            }
        },
        {
            $unwind: '$committee_detail'
        },
        {
            $match: { 'committee_detail.enrollment_period': true }
        }
    ])

    res.send(data);
})

////////////////////////////////////////////     Notification   ///////////////////////////////////////////////////
app.post('/create-notification', async (req, res) => {
    try {
        let notification_data = req.body;
        const newnotification = new notificationmodel(notification_data);
        await newnotification.save();
        res.send("Request Sent");
    }
    catch (error) {
        console.log(error);
    }
})

app.get('/all-notifications', async (req, res) => {
    try {
        let cookie = req.cookies.phoneno;
        let decode = jwt.verify(cookie, 'shhh');
        let phoneno = decode.phoneno;
        let user = await usermodel.findOne({ 'phoneno': phoneno });
        let data = await notificationmodel.find({ 'receiver_id': user._id });
        res.send(data);
    }
    catch (error) {
        console.log(error);
    }
})
//*********when a user request to join committee***********/
app.post('/reject-request/:id', async (req, res) => {
    try {
        let data = req.body;
        const newnotification = new notificationmodel(data);
        await newnotification.save();
        await notificationmodel.deleteOne({ '_id': req.params.id });
        res.send("rejected");
    }
    catch (error) {
        console.log(error);
    }

})

app.post('/accept-request/:id', async (req, res) => {
    let data = req.body;
    ///first i check enrollment period is true ..because if admin accept the request late the program not crash.
    let committee_details = await sharedCommittee.findOne({ '_id': data.committee_id });
    if (committee_details.enrollment_period === true) {

        for (let i = 0; i < data.number_of_committee; i++) {
            await sharedCommittee.updateOne(
                { '_id': data.committee_id },
                { $inc: { 'number_of_member': 1 } }
            );//increment member by 1 so i can easily calculate the cycle details.
            committee_details = await sharedCommittee.findOne({ '_id': data.committee_id });//again fetch the updated committee details so i can use them .

            const newmember = new committeemember({
                'committee_id': data.committee_id,
                'user_id': data.user_id,
                'turn_number': committee_details.number_of_member
            });
            let nmember = await newmember.save();//create new member of the committee

            //start_date==sd   deadline_date===dd  days_gap===dg   cyclenumber>>number_of_member in committee==cn  
            let calculated_dates = dates_calculator_function(committee_details.start_date, committee_details.deadline_day, committee_details.days_gap, committee_details.number_of_member);
            const newcycle = new committeecycle({
                'committee_id': data.committee_id,
                'amount': committee_details.amount,
                'cycle_number': committee_details.number_of_member,
                'start_date': calculated_dates.start_date,
                'end_date': calculated_dates.end_date,
                'deadline_date': calculated_dates.deadline_date
            });
            let ncycle = await newcycle.save();
            //get create payments of all the cycle for new member.

            let array_of_all_cycles = await committee_cycles.find({ 'committee_id': data.committee_id })


            for (let value of array_of_all_cycles) {
                let newpayment = new committee_payment({ 'member_id': nmember._id, 'cycle_id': value._id });
                await newpayment.save();
            }


            //create payment of all members with the ids of previous members.

            let array_of_already_joined_committee = await committeemember.find({ '_id': { $ne: nmember.id },'committee_id':data.committee_id ,'active': true });
            //now i will create payment to all already joined memeber of new cycle except that one that i currently saved
            //beacuse i have already created all the payment of his.

            for (let value of array_of_already_joined_committee) {
                let newpayment = new committee_payment({ 'member_id': value._id, 'cycle_id': ncycle._id });
                await newpayment.save();
            }

        }
        await notificationmodel.deleteOne({ '_id': req.params.id });
        res.send("Member Added");
    }
    else {
        res.send("Enrollment Closed");
    }

})
//*******************   used when handle payment notification     ************************/
app.delete('/clear-payment-notification/:id', async (req, res) => {
    let notification_id = req.params.id;
    await notificationmodel.deleteOne({ '_id': notification_id });
    res.send('Notification Cleared')
})


//*********************************************** */
app.delete('/clear-notification/:id', async (req, res) => {
    try {
        await notificationmodel.deleteOne({ '_id': req.params.id });
        res.send('cleared');
    }
    catch (error) {
        console.log(error);
    }
});

//////////////////////////////////////////    Bidding   //////////////////////////////////////////////
app.get('/get-details-of-committee/:id', async (req, res) => {
    let id = req.params.id;
    let committee_detail = await sharedcommittees.findOne({ '_id': id });
    res.send(committee_detail);
})
app.post('/current-bidding-cycle', async (req, res) => {
    try {

        let obj = req.body;//{committee_id,member_id,amount}
        let date = new Date();
        date.setUTCHours(0, 0, 0, 0);
        let cycle_data = await committee_cycles.findOne({
            'committee_id': obj.committee_id,
            'active': true,
            'cycle_winner': null,
            'start_date': { $lte: date },
            'end_date': { $gt: date }
        })
        if (cycle_data) {
            const newBidding = new cycle_biddings({ 'cycle_id': cycle_data._id, 'member_id': obj.member_id, 'amount': obj.amount });
            await newBidding.save();
            res.send('Bid Successful');
        }
        else {
            res.send("You Cannot Bid Today Try again Tommorow");
        }

    } catch (error) {
        console.log(error);
    }


})
app.get('/current-cycle-winner-bidder-of-committee/:id', async (req, res) => {
    try {
        let id = new mongoose.Types.ObjectId(req.params.id);

        let date = new Date();
        date.setUTCHours(0, 0, 0, 0);

        let cycle_data = await committee_cycles.findOne({
            committee_id: id,
            active: true,
            cycle_winner: null,
            start_date: { $lte: date },
            end_date: { $gt: date }
        });

        if (!cycle_data) {
            return res.status(404).send({ message: "No active cycle found" });
        }

        let all_bidders = await cycle_biddings
            .find({ cycle_id: cycle_data._id })
            .sort({ amount: -1 });

        if (all_bidders.length === 0) {
            return res.status(404).send({ message: "No bidders found" });
        }

        let winner_bidder = all_bidders[0];

        let user = await committee_members.aggregate([
            { $match: { _id: winner_bidder.member_id } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'user_detail'
                }
            },
            { $unwind: '$user_detail' }
        ]);

        if (user.length === 0) {
            return res.status(404).send({ message: "User not found" });
        }

        res.send({
            member_id: winner_bidder.member_id,
            name: user[0].user_detail.name,
            amount: winner_bidder.amount
        });

    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Server Error" });
    }
});


/////////////////////////////////////////     Transfer Admin   //////////////////////////////////
app.post('/get-all-member-comittee', async (req, res) => {
    //this contain all member except the committee admin
    try {
        let { committee_id, admin_id } = req.body;

        const data = await committee_members.aggregate([
            {
                $match: {
                    committee_id: new mongoose.Types.ObjectId(committee_id),
                    user_id: { $ne: new mongoose.Types.ObjectId(admin_id) }
                }
            },
            {
                $group: { _id: "$user_id" }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: "$user" }
        ]);

        res.send(data);
    }
    catch (error) {
        console.log(error)
    }

});

app.post('/new-committee-admin', async (req, res) => {
    try {

        let { committee_id, old_admin_id, new_admin_id } = req.body;
        await sharedCommittee.updateOne(
            {
                _id: new mongoose.Types.ObjectId(committee_id),
                admin_id: new mongoose.Types.ObjectId(old_admin_id)
            },
            {
                $set: {
                    admin_id: new mongoose.Types.ObjectId(new_admin_id)
                }
            }
        );
        res.send('admin Switched')

    } catch (error) {
        console.log(error);
    }
})

app.delete('/delete-committee/:id', async (req, res) => {
    try {
        let committee_id = req.params.id;
        await sharedcommittees.deleteOne({ '_id': committee_id });
        await committee_members.deleteMany({ 'committee_id': committee_id });
        let all_cycle_id = await committee_cycles.find({ 'committee_id': committee_id }, { '_id': 1 })//[{_id:23123},{}]
        all_cycle_id.forEach(async (value, index) => {
            await committee_payment.deleteMany({ 'cycle_id': value._id });
            await cycle_biddings.deleteMany({ 'cycle_id': value._id });
            await committee_cycles.deleteOne({ '_id': value._id });
        })
        await committee_refund.deleteMany({ 'committee_id': committee_id });
        await notificationmodel.deleteMany({ committee_id });
        res.send('committee_deleted');
    }
    catch (error) {
        console.log(error)
    }

})

app.get('/get-all-members-of-committee/:id', async (req, res) => {
    //this contain all the members including the committee admin
    let committee_id = new mongoose.Types.ObjectId(req.params.id);

    let data = await committee_members.aggregate([
        {
            $match: {
                'committee_id': committee_id,
                'active': true
            }
        }
        ,
        {
            $lookup: {
                from: 'users',
                localField: 'user_id',
                foreignField: '_id',
                as: 'user_detail'
            }
        }
        ,
        {
            $unwind: '$user_detail'
        }
    ])
    res.send(data);

})



app.put('/increment-member-rating', async (req, res) => {
    try {
        const { user_id, member_id } = req.body;

        // Increment only if rating is less than 5
        const updateResult = await committee_members.updateOne(
            { _id: member_id, user_rating: { $lt: 5 } },
            { $inc: { user_rating: 1 } }
        );

        if (updateResult.modifiedCount === 0) {
            return res.send("Rating already at maximum (5)");
        }

        // Recalculate average
        const all_ratings = await committee_members.find(
            { user_id: user_id },
            { user_rating: 1 }
        );

        const count = all_ratings.length;

        const sum = all_ratings.reduce(
            (total, item) => total + item.user_rating,
            0
        );

        let rating_avg = count > 0
            ? Math.round(sum / count)
            : 1;  // minimum 1


        await users.updateOne(
            { _id: user_id },
            { $set: { rating: rating_avg } }
        );

        res.send("Rating incremented");

    } catch (error) {
        res.send(error);
    }
});


app.put('/decrement-member-rating', async (req, res) => {
    try {
        const { user_id, member_id } = req.body;

        // Decrement only if rating is greater than 1
        const updateResult = await committee_members.updateOne(
            { _id: member_id, user_rating: { $gt: 1 } },
            { $inc: { user_rating: -1 } }
        );

        if (updateResult.modifiedCount === 0) {////modifiedCount is the mongodb result.how many documents are modified.
            return res.send("Rating already at minimum (1)");
        }

        // Recalculate average so i can update the actual user value.
        const all_ratings = await committee_members.find(
            { user_id: user_id },
            { user_rating: 1 }
        );

        const count = all_ratings.length;

        const sum = all_ratings.reduce(
            (total, item) => total + item.user_rating,
            0 //initial value
        );

        let rating_avg = count > 0
            ? Math.round(sum / count)
            : 1;

        await users.updateOne(
            { _id: user_id },
            { $set: { rating: rating_avg } }
        );

        res.send("Rating decremented");

    } catch (error) {
        console.log(error);
    }
});

app.get('/all-cycle-till-now-committee/:id', async (req, res) => {
    let committee_id = req.params.id;
    let todayDate = new Date();
    todayDate.setUTCHours(0, 0, 0, 0);
    let data = await committee_cycles.find({ 'committee_id': committee_id, 'active': true, 'start_date': { $lte: todayDate } }, { 'cycle_number': 1 });
    res.send(data);
})

app.get('/get-payment-of-cycle/:id', async (req, res) => {
    let cycle_id = req.params.id;
    let data = await committee_payment.aggregate([
        {
            $match: {
                'cycle_id': new mongoose.Types.ObjectId(cycle_id)
            }
        }
        ,
        {
            $lookup: {
                from: 'committee_members',
                localField: 'member_id',
                foreignField: '_id',
                as: 'member_detail'
            }
        }
        ,
        {
            $unwind: '$member_detail'
        }
        ,
        {
            $lookup: {
                from: 'users',
                localField: 'member_detail.user_id',
                foreignField: '_id',
                as: 'user_detail'
            }
        }
        ,
        {
            $unwind: '$user_detail'
        }
    ])

    res.send(data);
})

let payment_notification = async (member_id, cycle_id, committee_detail, payment_type) => {
    let user_detail;
    let temp = await committee_members.aggregate([
        {
            $match: { '_id': new mongoose.Types.ObjectId(member_id) }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'user_id',
                foreignField: '_id',
                as: 'user_detail'
            }
        },
        {
            $unwind: '$user_detail'
        }
    ]);
    user_detail = temp[0].user_detail;


    let notification_obj = {
        'receiver_id': committee_detail.admin_id,
        'committee_id': committee_detail._id,
        'user': user_detail,
        'committee_detail': { ...committee_detail },
        'member_id': member_id,
        'cycle_id': cycle_id,
        'payment_type': payment_type,
        'notification_type': 4
    }
    return notification_obj
}

app.post('/payment-handle', upload.single('payment_img'), async (req, res) => {
    try {
        // 1. Destructure the text fields
        let { payment_type, cycle_id, member_id, committee_detail } = req.body;
        // 2. Parse the object back from the string
        let committee = JSON.parse(committee_detail);
        let notification_obj = await payment_notification(member_id, cycle_id, committee, payment_type);
        let newnotification = new notificationmodel(notification_obj);
        await newnotification.save();

        if (payment_type === 'cash') {
            await committee_payment.updateOne(
                { cycle_id, member_id },
                { $set: { 'payment_type': payment_type, 'payment_status': true } });
        }
        else {
            let payment_img = req.file.filename;
            await committee_payment.updateOne(
                { cycle_id, member_id },
                { $set: { 'payment_type': payment_type, 'payment_status': true, payment_img } });
        }
        res.send("Approvel Send to committee Admin");
    }
    catch (error) {
        console.log(error)
    }

})

app.put('/approve-payment', async (req, res) => {
    try {
        let obj = req.body;//{cycle_id,member_id}
        await committee_payment.updateOne({ 'cycle_id': obj.cycle_id, 'member_id': obj.member_id }, { $set: { 'approval': true } });
        await notificationmodel.deleteOne({ 'cycle_id': obj.cycle_id, 'member_id': obj.member_id, 'notification_type': 4 });
        res.send('payment approved');
    }
    catch (error) {
        console.log(error);
    }
})

app.put('/reject-payment', async (req, res) => {
    let obj = req.body;//{ cycle_id, member_id, user_id,committee_id, message }
    await committee_payment.updateOne({ cycle_id: obj.cycle_id, member_id: obj.member_id },
        { $set: { payment_type: 'Not Paid yet', payment_img: null, payment_status: false, approval: false } });
    let newnotification = notificationmodel({
        receiver_id: obj.user_id,
        committee_id: obj.committee_id,
        member_id: obj.member_id,
        cycle_id: obj.cycle_id,
        message: obj.message,
        notification_type: 5
    });
    await newnotification.save();
    res.send('Payment Reject Successfully');
})

app.put('/admin-pay-member-payment', async (req, res) => {
    let obj = req.body //{member_id,cycle_id}
    await committee_payment.updateOne(
        { member_id: obj.member_id, cycle_id: obj.cycle_id },
        {
            $set: {
                payment_type: 'cash',
                payment_status: true,
                approval: true,
            }
        }
    )
    res.send("You have Successfull paid payment of a member.")
})
//////////////////////////////////////////////////
app.post('/exit-committee', async (req, res) => {
    try {
        const data = req.body;

        // 1. Extract and Clean Variables
        const committee_id = data.committee_id;
        const user_id = data.user_id;
        const member_id = data._id;
        
        
        // Convert to Number to ensure "1" === 1 doesn't fail
        const committee_leaving_type = Number(data.committee_details?.committee_leaving_type);
        const member_got_committee = data.got_the_committee;

        // 2. Fetch required details 
        const committee_admin_details = await usermodel.findOne({ _id: data.committee_details.admin_id });
        const committee_exitter_details = await usermodel.findOne({ _id: user_id });

        const number_of_cycle_paid = await committee_payment.countDocuments({
            member_id: member_id,
            approval: true
        });

        const return_amount = number_of_cycle_paid * Number(data.committee_details.amount);

        // 3. Logic for Committee Leaving Type 1
        if (committee_leaving_type === 1) {
            if (member_got_committee) {
                if (return_amount > 0) {
                    const userNotif = new notificationmodel({
                        receiver_id: user_id,
                        committee_id: committee_id,
                        notification_type: 6,
                        committee_detail: data.committee_details,
                        member_id: member_id,
                        amount: return_amount,
                        user: committee_admin_details,
                        message: "admin will divide this amount to members who dont got the kitty"
                    });
                    await userNotif.save();

                    const adminNotif = new notificationmodel({
                        receiver_id: data.committee_details.admin_id,
                        committee_id: committee_id,
                        notification_type: 7,
                        committee_detail: data.committee_details,
                        member_id: member_id,
                        user: committee_exitter_details
                    });
                    await adminNotif.save();

                    const newRefund = new committee_refund({
                        user_id: user_id,
                        committee_id: committee_id,
                        amount: return_amount,
                    });
                    await newRefund.save();
                }
            } else {
                // If member DID NOT get the committee
                const winners = await committee_members.find({
                    committee_id: committee_id,
                    got_the_committee: true
                });

                // Use Promise.all for better performance in loops
                await Promise.all(winners.map(item => {
                    const winNotif = new notificationmodel({
                        receiver_id: item.user_id,
                        committee_id: item.committee_id,
                        notification_type: 8,
                        committee_detail: data.committee_details,
                        member_id: item._id,
                        amount: data.committee_details.amount,
                        user: committee_admin_details,
                        message: "admin will give back this amount to the member who exits the committee"
                    });
                    return winNotif.save();
                }));

                const adminNotif = new notificationmodel({
                    receiver_id: data.committee_details.admin_id,
                    committee_id: committee_id,
                    notification_type: 7,
                    committee_detail: data.committee_details,
                    member_id: member_id,
                    user: committee_exitter_details
                });
                await adminNotif.save();
            }
        }

        // 4. Logic for Committee Leaving Type 2
        else if (committee_leaving_type === 2) {
            if (member_got_committee) {
                if (return_amount > 0) {
                    const userNotif = new notificationmodel({
                        receiver_id: user_id,
                        committee_id: committee_id,
                        notification_type: 6,
                        committee_detail: data.committee_details,
                        member_id: member_id,
                        amount: return_amount,
                        message: "admin will divide this amount to every member",
                        user: committee_admin_details
                    });
                    await userNotif.save();

                    const adminNotif = new notificationmodel({
                        receiver_id: data.committee_details.admin_id,
                        committee_id: committee_id,
                        notification_type: 7,
                        committee_detail: data.committee_details,
                        member_id: member_id,
                        user: committee_exitter_details
                    });
                    await adminNotif.save();

                    const newRefund = new committee_refund({
                        user_id: user_id,
                        committee_id: committee_id,
                        amount: return_amount,
                    });
                    await newRefund.save();
                }
            } else {
                const adminNotif = new notificationmodel({
                    receiver_id: data.committee_details.admin_id,
                    committee_id: committee_id,
                    notification_type: 7,
                    committee_detail: data.committee_details,
                    member_id: member_id,
                });
                await adminNotif.save();

                const calcAmount = Math.round(data.committee_details.amount) / (data.committee_details.number_of_member - 1);
                const temp_amount = data.committee_details.amount + calcAmount;
                await sharedcommittees.updateOne({ committee_id: committee_id }, { $set: { amount: temp_amount } });
            }
        }

        // 5. Cleanup and Status Updates
        await committee_members.updateOne(
            { _id: member_id, committee_id: committee_id },
            { $set: { active: false } }
        );

        await sharedCommittee.updateOne(
            { _id: committee_id },
            { $inc: { number_of_member: -1 } }
        );

        await committee_payment.deleteMany({
            member_id: member_id,
            payment_status: false
        });

        // FIX: Find the cycle first and check if it exists before using its ID
        const updated_cycle = await committee_cycles.findOneAndUpdate(
            { committee_id: committee_id },
            { $set: { active: false } },
            { sort: { cycle_number: -1 }, new: true }
        );

        if (updated_cycle) {
            await committee_payment.deleteMany({
                cycle_id: updated_cycle._id,
                payment_status: false
            });
        }
        await cycle_biddings.deleteMany({'member_id':member_id});

        res.status(200).send("Exit Successful");

    } catch (error) {
        console.error("Exit Committee Error:", error);
        res.status(500).send("An error occurred during exit process.");
    }
});

app.get('/get-all-refunds/:id', async (req, res) => {
    let committee_id = new mongoose.Types.ObjectId(req.params.id);
    let data = await committee_refund.find({ committee_id });
    res.send(data);
})

app.put('/pay-refund', upload.single('payment_img'), async (req, res) => {
    let obj = req.body;
    //{committee_id
    // ,user_id {who pay the return amount}
    // ,payment_type
    // ,message
    // ,committee_admin_id,
    // amount}
    let singlefile = req.file;
    if (singlefile) {
        await committee_refund.updateOne({ 'committee_id': obj.committee_id, 'user_id': obj.user_id }, {
            $set: {
                payment_type: obj.payment_type,
                payment_status: true,
                payment_img: singlefile.filename
            }
        })

    }
    else {
        await committee_refund.updateOne({ 'committee_id': obj.committee_id, 'user_id': obj.user_id }, {
            $set: {
                payment_type: obj.payment_type,
                payment_status: true
            }
        })
    }

    let adminnotification = await notificationmodel({//user_id  committee_id  amount message
        receiver_id: obj.committee_detail.admin_id,
        committee_id: obj.committee_details._id,
        member_id: obj.user_id,
        amount: obj.amount,
        message: obj.message,
        notification_type: 9
    })
    adminnotification.save();
    res.send("Approval Sent to Admin.");
})

app.put('/reject-refund', async (req, res) => {
    let obj = req.body;//{committee_id,user_id,message} message for reason of rejection
    console.log(obj);
    await committee_refund.updateOne({ 'committee_id': obj.committee_id, 'user_id': obj.user_id }, {
        $set: {
            payment_type: 'Not Paid yet',
            payment_status: false,
            approval: false,
            payment_img: null
        }
    })

    let newnotif = new notificationmodel({
        receiver_id: obj.user_id,
        member_id: obj.user_id,
        committee_id: obj.committee_id,
        message: obj.message,
        notification_type: 5
    })
    await newnotif.save();
    res.send("Refud Rejected")
})
app.put('/approve-refund', async (req, res) => {
    let obj = req.body;//{whole refund obj}
    if (obj.payment_type === 'Not Paid yet') {
        await committee_refund.updateOne({ '_id': obj._id }, { $set: { 'payment_status': true, 'approval': true, 'payment_type': 'cash' } });
    }
    else {
        await committee_refund.updateOne({ '_id': obj._id }, { $set: { 'approval': true } });
    }
    res.send("refund Accepted");
})

app.get('/get-refund-of-user/:id', async (req, res) => {
    let user_id = req.params.id; //user_id
    let data = await committee_refund.find({ user_id, approval: false });
    res.send(data);
})

app.post('/swap-request', async (req, res) => {
    try {
        let data = req.body;
        //{swaping_member_id    is ko committee chiyaa.
        // ,winner_member_id,   joo committee jeet gayaa ha.
        // committee_id,
        //cycle_id        jis cycle ka winner swap krnaa haa.
        //}


        //1:sub sa palaa ma notification send karoo ga jis ko committee mili haa.
        let winner_user_id = await committee_members.findById(data.winner_member_id, "user_id");

        //2.jo switch krnaa chataa ha is ki details notification ma show krnaa k lia.
        let temp = await committee_members.aggregate([
            {
                $match: {
                    '_id': new mongoose.Types.ObjectId(data.swaping_member_id)
                }
            }
            ,
            {
                $lookup: {
                    from: 'users',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'user_detail'
                }
            }
            ,
            {
                $unwind: '$user_detail'
            }
        ])


        let new_notif = new notificationmodel({
            'receiver_id': winner_user_id.user_id,//is ko committee mili hoi haa.
            'committee_id': data.committee_id,
            'user': temp[0].user_detail, // is ka name show kroo ga notification ma 
            'member_id': data.swaping_member_id,//is ko committee chiyaa
            'cycle_winner_member_id': data.winner_member_id,//is k pass comittee haa.
            'cycle_id': data.cycle_id,
            'notification_type': 10
        })

       
        await new_notif.save();
        res.send("Request Sent");
    }
    catch (error) {
        console.log(error);
    }
})

app.post('/swap-reject', async (req, res) => {
    try {
        let data = req.body;
        //{
        //recever_id     who dont got the committee and whose swap request is rejected this is user_id.
        //committee_id   
        //notification_id   jis na swap request baji this uss k notification delete krnaa ha iss sa 
        //}

        await notificationmodel.deleteOne({ '_id': data.notification_id });

        let new_noti = new notificationmodel({
            'receiver_id': data.receiver_id,
            'committee_id': data.committee_id,
            'notification_type': 11
        })

        await new_noti.save();

        res.send("Swap Rejected Successfully");
    }
    catch (error) {
        console.log(error)
    }

})

app.put('/swap-accepted', async (req, res) => {
    try {
        let data = req.body;
        //{cycle_winner_member_id             jis ko committee mili hoi ha
        //member_id            jis ko committee chiyaa.
        //committee_id,cycle_id  }
        console.log(data);
        //1st i change that person winning
        await committee_members.updateOne({ '_id':new mongoose.Types.ObjectId( data.cycle_winner_member_id)}, { $set: { 'got_the_committee': false } });
        await committee_members.updateOne({ '_id':new mongoose.Types.ObjectId( data.member_id )}, { $set: { 'got_the_committee': true } });
        await committee_cycles.updateOne({ '_id': data.cycle_id }, { $set: { 'cycle_winner_id': data.member_id } });
        await notificationmodel.deleteOne({"_id":data.notification_id});
        res.send("Swap Successful")
    } catch (error) {
        console.log(error)
    }

})

