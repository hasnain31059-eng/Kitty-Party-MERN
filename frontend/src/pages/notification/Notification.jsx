import './Notification.css'
import Navigation from '../../components/navigation/Navigation'
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios'

function Notification() {
    const location = useLocation();
    const [all_notifications, setall_notifications] = useState([]);
    const [payment_type, setpayment_type] = useState('cash');//used in notification no 6 and 8.
    const [return_img, setreturn_img] = useState('');

    let handlereject = async (notification_id, receiver_id, committee_id) => {
        await axios.post(`http://localhost:8080/reject-request/${notification_id}`, { receiver_id, committee_id, 'notification_type': 2 });
        getall_notifications();
    }

    let handleaccept = async (user_id, committee_id, notification_id, number_of_committee) => {
        await axios.post(`http://localhost:8080/accept-request/${notification_id}`, { user_id, committee_id, number_of_committee }).then((res) => {
            alert(res.data);
        })
        getall_notifications();
    }

    let handleclear = async (member_id) => {
        await axios.delete(`http://localhost:8080/clear-notification/${member_id}`);
        getall_notifications();
    }

    let getall_notifications = () => {
        axios.get('http://localhost:8080/all-notifications', { withCredentials: true }).then((res) => {
            setall_notifications(res.data);
        })
    }

    let payment_approve = (cycle_id, member_id, notification_id) => {
        axios.put('http://localhost:8080/approve-payment', { cycle_id, member_id, notification_id }).then((res) => {
            console.log(res.data);
            getall_notifications();
        })
    }

    let clear_payment_notification = (notification_id) => {
        axios.delete(`http://localhost:8080/clear-payment-notification/${notification_id}`).then((res) => {
            console.log(res.data);
            getall_notifications();
        })
    }

    let handlereturn = (notification_obj) => {
        const formdata = new FormData();
        formdata.append('committee_id', notification_obj.committee_id);
        formdata.append('user_id', notification_obj.receiver_id);//who pay the return amount
        formdata.append('payment_type', payment_type);
        formdata.append('message', notification_obj.message) //message for admin what he do to amount
        formdata.append('committee_admin_id', notification_obj.committee_detail.admin_id);
        formdata.append('amount', notification_obj.amount);
        formdata.append('payment_img',return_img);

        axios.put('http://localhost:8080/pay-refund',formdata).then((res)=>{
            alert(res.data);
        })
    }

    useEffect(() => {
        getall_notifications();
    }, [])
    return (
        <>
            <Navigation />
            <h1 className='font-medium text-xl text-center'>Notifications</h1>
            <div>
                {
                    all_notifications.map((value, index) => {//i use {} because switch only work inside the function.
                        switch (value.notification_type) {
                            case 1: return (
                                <div className='notification_div my-2 rounded-2xl p-2  sm:mx-auto ' key={value._id}>
                                    <div className='text-sm'>
                                        <div className='flex justify-evenly'>
                                            <div className='profile w-15'>
                                                <img src={value.user.profile_img} alt="profile_img" />
                                            </div>
                                            <div>
                                                <div className='stars'>
                                                    {
                                                        [...Array(Number(value.user.rating))].map((value, index) => (
                                                            <img src='/Global/star.png' key={index} />
                                                        ))
                                                    }
                                                </div>
                                                <h1>{value.user._id}</h1>
                                                <h1>{value.user.name}</h1>
                                                <h1>PhoneNo: {value.user.phoneno}</h1>
                                            </div>
                                        </div>
                                        <div className='text-center'>
                                            <p className='font-medium'>{value.user.name} wants to Join Committee Id {value.committee_id}</p>
                                            <h1>Number Of Committees :{value.number_of_committee}</h1>
                                        </div>
                                        <div className='flex justify-evenly my-2'>
                                            <button className='bg-[#61AB78] px-3 py-1 rounded-2xl hover:bg-[#2f884b] text-white'
                                                onClick={() => handlereject(value._id, value.user._id, value.committee_id)}>Reject</button>
                                            <button className='bg-[#D36556] px-3 py-1 rounded-2xl hover:bg-[#cc5040] text-white'
                                                onClick={() => handleaccept(value.user._id, value.committee_id, value._id, value.number_of_committee)}>Accept</button>
                                        </div>

                                    </div>
                                </div>
                            )


                            case 2: return (

                                <div className='notification_div my-2 rounded-2xl p-2  sm:mx-auto text-sm' key={value._id}>
                                    <h1 className='text-center'>Request to Join the committee id<span>{value.committee_id}</span>  has been rejected.</h1>
                                    <div className='flex justify-end pr-7'>
                                        <button className='bg-[#D36556] px-3 py-1 rounded-2xl hover:bg-[#cc5040] text-white'
                                            onClick={() => handleclear(value._id)}>Clear</button>
                                    </div>
                                </div>

                            )

                            case 3: return (
                                <div className='notification_div my-2 rounded-2xl p-2  sm:mx-auto ' key={value._id}>
                                    <div className=' text-sm'>
                                        <div className='flex justify-evenly'>
                                            <div>

                                                <h1>Id: {value.committee_id}</h1>
                                                <h1>Name: {value.committee_detail.committee_name}</h1>
                                                <h1> Committee Type:
                                                    {(() => {
                                                        switch (value.committee_detail.committee_type) {
                                                            case "1": return "Simple";
                                                            case "2": return "Bidding";
                                                            case "3": return "Spin";
                                                            default: return "Unknown";
                                                        }
                                                    })()}
                                                </h1>
                                            </div>
                                        </div>
                                        <div className='text-center'>
                                            <p className='font-medium'>You Are Invited to Join this Committee</p>
                                            <h1>Number Of Committees :{value.number_of_committee}</h1>
                                        </div>
                                        <div className='flex justify-evenly my-2'>
                                            <button className='bg-[#61AB78] px-3 py-1 rounded-2xl hover:bg-[#2f884b] text-white'
                                                onClick={() => handlereject(value._id, value.user._id, value.committee_id)}>Reject</button>
                                            <button className='bg-[#D36556] px-3 py-1 rounded-2xl hover:bg-[#cc5040] text-white'
                                                onClick={() => handleaccept(value.user._id, value.committee_id, value._id, value.number_of_committee)}>Accept</button>
                                        </div>

                                    </div>
                                </div>
                            )



                            case 4: return (
                                <div className='notification_div my-2 rounded-2xl p-2  sm:mx-auto ' key={value._id}>
                                    <div className=' text-sm'>
                                        <div className='flex justify-evenly items-center'>
                                            <div className='profile w-15'>
                                                <img src={value.user.profile_img} alt="profile_img" />
                                            </div>
                                            <div>
                                                <h1>{value.member_id}</h1>
                                                <h1>{value.user.name}</h1>
                                            </div>
                                        </div>
                                        <div className='text-center'>
                                            <p className='font-medium'>{value.user.name} has requested you to Approve Payment of Committee {value.committee_id}</p>
                                            <h1>Payment Type :{value.payment_type}</h1>
                                            <h1>Amount :{value.committee_detail.amount}</h1>
                                        </div>
                                        <div className='flex justify-evenly my-2'>
                                            <button className='bg-[#61AB78] px-3 py-1 rounded-2xl hover:bg-[#2f884b] text-white'
                                                onClick={() => clear_payment_notification(value._id)}>Clear</button>
                                            <button className='bg-[#D36556] px-3 py-1 rounded-2xl hover:bg-[#cc5040] text-white'
                                                onClick={() => payment_approve(value.cycle_id, value.member_id, value._id)}>Accept</button>
                                        </div>

                                    </div>
                                </div>
                            )



                            case 5: return (
                                <div className='notification_div my-2 rounded-2xl p-2  sm:mx-auto text-sm' key={value._id}>
                                    <h1 className='text-center font-medium'>Your payment request has been rejected by admin.</h1>
                                    <div className='text-center'>
                                        <h1><span className='font-medium text-[#61AB78]'>Committee_id:</span> {value.committee_id}</h1>
                                        <h1><span className='font-medium text-[#61AB78]'>Member_id:</span> {value.member_id}</h1>
                                        <h1><span className='font-medium text-[#61AB78]'>Reason:</span> {value.message}</h1>
                                    </div>
                                    <div className='flex justify-end pr-7'>
                                        <button className='bg-[#D36556] px-3 py-1 rounded-2xl hover:bg-[#cc5040] text-white'
                                            onClick={() => clear_payment_notification(value._id)}>Clear</button>
                                    </div>
                                </div>
                            )


                            case 6: return (
                                //notification for the member to return the committe of other member.
                                <div className='notification_div my-2 rounded-2xl p-2  sm:mx-auto text-sm text-center' key={value._id}>
                                    <h1>you Exitted <span>{value.committee_id}</span>.As you got the Committee.Due to the exit you have to return the share
                                        of other members of committee which is
                                    </h1>
                                    <h1 className='font-medium'>Amomunt: <span>{value.amount}</span></h1>
                                    <h1 className='font-medium'><span>to Admin</span></h1>
                                    <h1 className='font-medium'>Name :{value.user.name}</h1>
                                    <h1 className='font-medium'>Phoneno :{value.user.phoneno}</h1>
                                    <h1>pay by:</h1>
                                    <div className='px-5'>
                                        <input type='radio' name='payment' value='cash' className='mx-1' checked={payment_type === 'cash'} onChange={(e) => setpayment_type(e.target.value)} /> Cash
                                        <input type='radio' name='payment' value='online' className='mx-1' checked={payment_type === 'online'} onChange={(e) => setpayment_type(e.target.value)} /> Online
                                    </div>
                                    {
                                        payment_type === 'online' && (
                                            <div>
                                                <input type='file' className='bg-[#297a43e5] w-45 rounded-2xl px-2 py-1 my-2 text-white hover:bg-[#cc5040]' onChange={(e)=>{
                                                    let file=e.target.files[0];
                                                    setreturn_img(file);
                                                }} />
                                            </div>
                                        )
                                    }
                                    <div className='flex justify-end pr-7'>
                                        <button className='bg-[#D36556]  px-2 py-1 mx-2 rounded-2xl hover:bg-[#2f884be3] text-white'
                                            onClick={() => handlereturn(value)} >PayNow</button>
                                    </div>
                                </div>
                            )

                            case 7: return (
                                //notification to inform committee admins about someone exited the committee
                                <div className='notification_div my-2 rounded-2xl p-2  sm:mx-auto text-sm text-center' key={value._id}>
                                    <h1 className='font-medium'><span>Member:</span></h1>
                                    <h1 className='font-medium'> Name :{value.user.name}</h1>
                                    <h1 className='font-medium'>Phoneno :{value.user.phoneno}</h1>
                                    <h1>has exitted the Committee</h1>
                                    <h1 className='font-medium'>Committee Name :{value.committee_detail.committee_name}</h1>
                                    <h1 className='font-medium'>Committee Id:{value.committee_detail._id}</h1>
                                    <div className='flex justify-end pr-7'>
                                        <button className='bg-[#D36556] px-3 py-1 rounded-2xl hover:bg-[#cc5040] text-white'
                                            onClick={() => clear_payment_notification(value._id)}>Clear</button>
                                    </div>
                                </div>
                            )


                            case 8: return (
                                //
                                <div className='notification_div my-2 rounded-2xl p-2  sm:mx-auto text-sm text-center' key={value._id}>
                                    <h1>A member of committee exitted the<span>{value.committee_id}</span>.As you got the Committee.Due to the exit you have to return the share
                                        of that member.
                                    </h1>
                                    <h1 className='font-medium'>Amomunt: <span>{value.amount}</span></h1>
                                    <h1 className='font-medium'><span>to Admin</span></h1>
                                    <h1 className='font-medium'>Name :{value.user.name}</h1>
                                    <h1 className='font-medium'>Phoneno :{value.user.phoneno}</h1>
                                    <h1>pay by:</h1>
                                    <div className='px-5'>
                                        <input type='radio' name='payment' value='cash' className='mx-1' checked={payment_type === 'cash'} onChange={(e) => setpayment_type(e.target.value)} /> Cash
                                        <input type='radio' name='payment' value='online' className='mx-1' checked={payment_type === 'online'} onChange={(e) => setpayment_type(e.target.value)} /> Online
                                    </div>
                                    {
                                        payment_type === 'online' && (
                                            <div>
                                                <input type='file' className='bg-[#297a43e5] w-45 rounded-2xl px-2 py-1 my-2 text-white hover:bg-[#cc5040]' />
                                            </div>
                                        )
                                    }
                                    <div className='flex justify-end pr-7'>
                                        <button className='bg-[#297a43e5] px-2 py-1 mx-2 rounded-2xl hover:bg-[#2f884be3] text-white'
                                            onClick={() => {
                                                //giving the whole notification so i exract the data.
                                                handlereturn(value)
                                            }} >PayNow</button>
                                    </div>
                                </div>
                            )


                            case 9: return (

                                <div className='notification_div my-2 rounded-2xl p-2  sm:mx-auto text-sm text-center' key={value._id}>
                                    <p>Member:{value.member_id}</p>
                                    <p>committee Id:{value.committee_id}</p>
                                    <p>has return Amount: {value.amount}</p>
                                    <p>Message</p>
                                    <p>{value.message}</p>
                                </div>
                            )



                        }

                    })

                }
            </div>
        </>
    )
}
export default Notification;