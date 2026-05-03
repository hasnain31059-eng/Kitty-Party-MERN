import './CommitteeDetails.css'
import Navigation from '../../components/navigation/Navigation.jsx'
import { useLocation, useNavigate } from 'react-router-dom'
import { GiFullPizza } from "react-icons/gi";
import { BiTransfer } from "react-icons/bi";
import { MdPersonRemoveAlt1 } from "react-icons/md";
import { RiDeleteBinFill } from "react-icons/ri";
import { IoShareSocialOutline } from "react-icons/io5";
import { ImExit } from "react-icons/im";
import { useEffect, useState } from 'react';
import axios from 'axios';
function CommitteeDetails() {
    const location = useLocation();
    const navigate = useNavigate();
    const data = location.state;//this comtain current committee data which i want to see details from lobby [committee_member] join with[sharedcommittee]

    const [committee_current_cycle, setcommittee_current_cycle] = useState([]);//contain this committee this month dues. by joining the [committee_cycle],[committee_payments]
    const [committee_owner_details, setcommittee_owner_details] = useState({});  //joining the [cycle],[committee_member],[users]

    const [remaining_committee_owners, setremaining_committee_owners] = useState([]);

    let handle_exit = () => {
        axios.post('http://localhost:8080/exit-committee', data).then((res) => {
            console.log(res.data);
            navigate('/lobby');
        })
    }

    let handle_swap = () => {
        let swaping_mamber_id=data._id;///joo committee details daak rahaa ha 
        let winner_member_id=committee_owner_details.member._id;// joo committee jeet gayaa ha.
        axios.post('http://localhost:8080/swap-winner',{swaping_mamber_id,winner_member_id}).then((res)=>{
            console.log(res.data);
        })
    }
    useEffect(() => {
        let current_date = new Date().toISOString(); //getting current date

        axios.post('http://localhost:8080/this-month-dues', { 'committee_id': data.committee_id, 'today': current_date, 'committee_member_id': data._id }).then((res) => {
            setcommittee_current_cycle(res.data);//return array of the pending committees.
        })
        axios.post('http://localhost:8080/current-cycle-committee-winner', { 'today': current_date, 'committee_id': data.committee_id }).then((res) => {
            setcommittee_owner_details(res.data);
        })

        axios.get(`http://localhost:8080/remaining-members/${data.committee_id}`).then((res) => {
            setremaining_committee_owners(res.data);

        })
    }, [])
    return (
        <>

            <Navigation />
            <div className='text-sm flex justify-between align-middle px-2 sm:px-5 mt-4'>
                <div>
                    <div className="stars">
                        {

                            [...Array(Number(data.user_rating))].map((value, index) => (
                                <img src='/Global/star.png' key={index} />
                            ))
                        }

                    </div>
                    <h1 className='text-[#D36556] font-medium'>
                        {data.committee_details.committee_name}
                    </h1>

                    <h1 className='text-xs'>
                        Member Id: {data._id}{/* member id */}
                    </h1>
                </div>
                <div className='add-members-div flex justify-center items-center'>
                    <h1>Total Members:{data.committee_details.number_of_member}</h1>
                </div>
            </div>




            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 py-2 mx-auto max-w-5xl px-4'>

                <div className='details-outer '>
                    <div className='month-dues-scroll'>
                        <div className='font-medium'>
                            <h1>This Month's Dues</h1>
                        </div>
                        {
                            committee_current_cycle.map((value, index) => (
                                <div className='dues-div mb-2 ' key={index}>
                                    <div className='dues-div-details'>
                                        <div className='flex justify-center items-center'>
                                            <h1 className='mr-5 dues-doller'>$</h1>
                                            <h1 className='font-medium'>{value.amount}</h1>
                                        </div>
                                        <button className='pay-now-btn' onClick={() => {
                                            navigate('/payment', { state: { 'cycle_id': value._id, 'member_id': data._id, 'committee_detail': data.committee_details } })
                                        }}>Pay Now</button>
                                    </div>
                                    <div>
                                        <div className="line">
                                            <div className="line-percentage">
                                            </div>
                                        </div>
                                    </div>
                                    <div className='px-15 text-sm'>
                                        <h1><span>Due Date</span>{new Date(value.deadline_date).toDateString()}</h1>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>



                <div className='details-outer'>
                    <div className='font-medium'>
                        <h1> Committee Owner</h1>
                    </div>
                    <div>
                        {
                            Object.keys(committee_owner_details).length > 0 ? (
                                <>
                                    <div className='flex items-center'>
                                        <div className='img-div mx-1 sm:mx-5'>
                                            <img src={committee_owner_details.user_detail.profile_img} alt="profile_pic" />
                                        </div>
                                        <div className='text-sm'>
                                            <h1 className='font-medium text-lg'>{committee_owner_details.user_detail.name}</h1>
                                            <h1><span className='pr-1'>id:</span>{committee_owner_details.user_detail._id}</h1>
                                            <h1><span className='pr-1'>ph-no:</span>{committee_owner_details.user_detail.phoneno}</h1>
                                        </div>
                                    </div>
                                    <div className='flex justify-end'>
                                        {
                                            //ma check kr rahaa hoo k member_id jo k committee details daak 
                                            // rahaa haa eual too nahi ha member_id jis ki committee nikli ha.
                                            // kyu k member apnaa aap ko hi swap request baj saktaa haa.
                                            (data._id !== committee_owner_details.member._id) && (
                                                <button className='swap-btn text-sm mx-4' onClick={handle_swap}>Swap</button>
                                            )
                                        }

                                    </div>
                                </>
                            ) :
                                (
                                    <>
                                        <h1>Winner will announce soon</h1>
                                    </>
                                )
                        }

                    </div>
                </div>


                <div className='details-outer'>
                    <div className='font-medium'>
                        <h1>Committee Status</h1>
                    </div>
                    <div className='flex justify-center items-center'>
                        <h1>Committee Reveived:<span>{data.got_the_committee.toString()}</span></h1>
                    </div>
                </div>

                {
                    (data.committee_details.committee_type === "2" && data.got_the_committee === false) && (
                        <div className='details-outer'>
                            <div className='font-medium'>
                                <h1>Bidding</h1>
                            </div>
                            <div className='flex justify-center items-center'>
                                <button className='draw-btn' onClick={() => { navigate('/bidding', { state: { 'committee_id': data.committee_details._id, 'member_id': data._id } }) }}>Bid Now</button>
                            </div>
                        </div>
                    )
                }




                <div className='details-outer'>
                    <div className='remaining-scroll'>
                        <div className='font-medium flex justify-around'>
                            <h1>Remaining Committees</h1>
                            <h1>Number</h1>
                        </div>
                        <div>
                            {/*  */}
                            {
                                remaining_committee_owners.map((value, index) => (
                                    <div className='flex  justify-around items-center my-2' key={index}>
                                        <div className='flex'>
                                            <div className='img-div mx-1 sm:mx-5'>
                                                <img src={value.user_detail.profile_img} alt="" />
                                            </div>
                                            <div className='font-sm'>
                                                <h1 className='font-medium text-lg'>{value.user_detail.name}</h1>
                                                <h1><span className='pr-1'>phno:</span>{value.user_detail.phoneno}</h1>
                                            </div>
                                        </div>
                                        <div className='committee-number sm:mr-8'>
                                            <h1 className=''>{value.turn_number}</h1>
                                        </div>
                                    </div>
                                ))
                            }
                            {/*  */}
                        </div>
                    </div>
                </div>



            </div>

            <div className='flex justify-around'>
                {
                    data.committee_details.enrollment_period && (
                        <button className='bg-[#FB9D57] flex justify-center items-center px-2 py-1 rounded-xl '
                            onClick={() => navigate('/invite-member', { state: data.committee_details })}>
                            <IoShareSocialOutline />
                        </button>
                    )
                }

                <button className='bg-[#FB9D57] flex justify-center items-center text-sm px-2 py-1 rounded-xl'
                    onClick={handle_exit}
                >
                    < ImExit />
                    Leave Party
                </button>
            </div>


        </>
    )
}
export default CommitteeDetails;