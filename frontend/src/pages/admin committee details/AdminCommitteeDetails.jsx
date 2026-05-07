import Navigation from '../../components/navigation/Navigation.jsx'
import './AdminCommitteeDetails.css'
import { BiTransfer } from "react-icons/bi";
import { IoPersonAdd } from "react-icons/io5";
import { RiDeleteBin5Line } from "react-icons/ri";
import { RxCross2 } from "react-icons/rx";
import { HiOutlineCheck } from "react-icons/hi";
import { FiMinus } from "react-icons/fi";
import { GoPlus } from "react-icons/go";
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';
function AdminCommitteeDetails() {
    const location = useLocation();
    const navigate = useNavigate();

    let data = location.state;//contain object of committee detail from shared_committeee_table
    const [all_members, setall_members] = useState([]);// used to update stars
    const [current_cycle_members, setcurrent_cycle_members] = useState([]);
    const [all_cycles, setall_cycles] = useState([]);//[{_id,cycle_number},{}]---committee_cycle_table
    const [current_cycle, setcurrent_cycle] = useState("");
    const [img_large_view, setimg_large_view] = useState("");
    const [large_view_trigger, setlarge_view_trigger] = useState(false);
    const [all_returns, setall_returns] = useState([]);

    let handle_delete_committee = () => {
        axios.delete(`http://localhost:8080/delete-committee/${data._id}`).then((res) => {
            alert(res.data);
            navigate('/lobby');
        })
    }

    let handle_increment_rating = (user_id, member_id) => {
        axios.put('http://localhost:8080/increment-member-rating', { user_id, member_id }).then((res) => {
            alert(res.data);
        })
    }

    let handle_decrement_rating = (user_id, member_id) => {
        axios.put('http://localhost:8080/decrement-member-rating', { user_id, member_id }).then((res) => {
            alert(res.data);
            axios.get(`http://localhost:8080/get-all-members-of-committee/${data._id}`).then((res) => {
                setall_members(res.data);
            })
        })
    }

    let get_member_of_cycle = (cycle_number, all_cycles) => {
        let current_cycle_id;   ////idr ma cycle number saa cycle id nikaloo ga joo k saraa
        //  cycle manaa all_cycles ma dall dia thaa jis ma 1 array haa uss ma cycle_id aur
        //  cycle_number haa.
        all_cycles.forEach((value, _) => {
            if (Number(value.cycle_number) === Number(cycle_number)) {
                current_cycle_id = value._id
            }
        })


        axios.get(`http://localhost:8080/get-payment-of-cycle/${current_cycle_id}`).then((res) => {
            setcurrent_cycle_members(res.data); //contain 3 tables data committee_payemnt  committee_member users
        })

    }

    let approve_payment = (cycle_id, member_id) => {
        axios.put('http://localhost:8080/approve-payment', { cycle_id, member_id }).then((res) => {
            alert(res.data);
            get_member_of_cycle(current_cycle, all_cycles);
        })
    }

    let admin_pay_member_payment = (cycle_id, member_id) => {
        axios.put('http://localhost:8080/admin-pay-member-payment', { cycle_id, member_id }).then((res) => {
            alert(res.data);
            get_member_of_cycle(current_cycle, all_cycles);
        })
    }

    let reject_payment = (cycle_id, member_id, user_id, committee_id) => {
        let message = prompt('Reason to Reject the payment');
        if (message === null || message === "") {
            alert("please Enter Reason for Rejection to proceed");
        }
        else {
            axios.put('http://localhost:8080/reject-payment', { cycle_id, member_id, user_id, committee_id, message }).then((res) => {
                alert(res.data);
                get_member_of_cycle(current_cycle, all_cycles);
            })
        }

    }


    let receipt_zoomed = (img_path) => {
        setimg_large_view(img_path);
        setlarge_view_trigger((pre) => !pre);
    }

    let get_all_refund = () => {
        axios.get(`http://localhost:8080/get-all-refunds/${data._id}`).then((res) => {
            setall_returns(res.data);
        })
    }
    let reject_return = async (committee_id, user_id) => {
        let message = prompt("Enter Reason of Rejection")
        if (message !== '' && message !== null) {
            await axios.put('http://localhost:8080/reject-refund', { committee_id, user_id, message }).then((res) => {
                get_all_refund();
                alert(res.data);
            })

        }
        else {
            alert('please enter the reason of rejection');
        }
    }

    let accept_return = async (value) => {
        //value is the whole noitification obj
        await axios.put('http://localhost:8080/approve-refund', value).then((res) => {
            alert(res.data);
            get_all_refund();
        })

    }

    useEffect(() => {
        axios.get(`http://localhost:8080/get-all-members-of-committee/${data._id}`).then((res) => {
            setall_members(res.data);
        })
        axios.get(`http://localhost:8080/all-cycle-till-now-committee/${data._id}`).then((res) => {
            const fetchedData = res.data;///this is used to get cycle_id and cycle number by using committee_id

            setall_cycles(fetchedData);
            if (fetchedData.length > 0) {
                const lastCycle = fetchedData.length; ///is ma maa saraa cycle maa sa last cycle nikaloo ga
                setcurrent_cycle(lastCycle);//yaa dropdown maa show hoo ga.
                get_member_of_cycle(lastCycle, fetchedData);//this contain both current cycle number and all cycles data{_id,cycle_number}
            }

        })

        axios.get(`http://localhost:8080/get-all-refunds/${data._id}`).then((res) => {
            setall_returns(res.data);
        })

    }, [])
    return (<>
        <Navigation />
        {
            (img_large_view !== "" && large_view_trigger) && (

                <div className='acd-large-view'>
                    <div className='flex justify-end'>
                        <button
                            onClick={() => {
                                setlarge_view_trigger((pre) => !pre);
                                setimg_large_view("");
                            }}
                            className='m-6 text-white text-4xl font-medium'
                        >
                            <RxCross2 />
                        </button>
                    </div>
                    <div className='flex justify-center items-center' >
                        <img src={img_large_view} />
                    </div>
                </div>

            )
        }

        <h1 className='text-center font-medium text-2xl'>Committee Details</h1>
        <div className='acd-recent-payment'>
            <div className='flex justify-between items-center'>
                <h1 className='font-medium'>Payment Submission</h1>
                <div className='text-xs'>
                    <label className='mr-1'>Cycle No</label>
                    <select className='mr-1' value={current_cycle}
                        onChange={(e) => {
                            const selectedCycle = e.target.value;//ya is lia kia kyu k usestate quickly changes nahi kartaa.
                            setcurrent_cycle(selectedCycle);
                            get_member_of_cycle(selectedCycle, all_cycles);
                        }}>

                        {
                            all_cycles.map((value, index) => (
                                <option key={index} value={value.cycle_number}>{value.cycle_number}</option>
                            ))
                        }
                    </select>
                </div>
            </div>
            <table className='text-sm '>
                <thead>
                    <tr>
                        <th>Member Detail</th>
                        <th>Amount</th>
                        <th>Recete Preview</th>
                        <th>Payment Type</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>

                    {
                        current_cycle_members.length > 0 && (
                            current_cycle_members.map((value, index) => (
                                <tr key={index}>
                                    <td>
                                        <div className='flex justify-center items-center'>
                                            <div className="acd-member-profile">
                                                <img src={value.user_detail.profile_img} alt="" />
                                            </div>
                                            <div className='mx-2'>
                                                <h1>{value.user_detail.name}</h1>
                                                <p>{value.member_id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        {data.amount}
                                    </td>
                                    <td>
                                        <div className='acd-recete'>
                                            {value.payment_type === 'online' && (
                                                <img src={`http://localhost:8080/Images/${value.payment_img}`} alt="receipt"
                                                    onClick={
                                                        () => {
                                                            receipt_zoomed(`http://localhost:8080/Images/${value.payment_img}`);
                                                        }
                                                    }
                                                />
                                            )
                                            }
                                        </div>
                                    </td>
                                    <td>
                                        {value.payment_type}
                                    </td>
                                    <td>
                                        <div className='flex justify-center items-center'>

                                            {
                                                !value.approval && (
                                                    <button className='mx-1 text-[#4F9E7D]' onClick={
                                                        () => {
                                                            if (value.payment_type !== 'Not Paid yet') {
                                                                approve_payment(value.cycle_id, value.member_id);
                                                            }
                                                            else {
                                                                admin_pay_member_payment(value.cycle_id, value.member_id);
                                                            }

                                                        }
                                                    }><HiOutlineCheck /></button>
                                                )
                                            }
                                            {
                                                value.payment_type !== 'Not Paid yet' && (
                                                    <button className='mx-1 text-[#D36556]'
                                                        onClick={() => {
                                                            reject_payment(
                                                                value.cycle_id,
                                                                value.member_id,
                                                                value.user_detail._id,
                                                                value.member_detail.committee_id)
                                                        }}
                                                    ><RxCross2 /></button>
                                                )
                                            }

                                        </div>
                                    </td>
                                </tr>
                            ))
                        )
                    }

                </tbody>
            </table>
        </div>



        <div className='acd-recent-payment'>
            <h1 className='font-medium'>Rate a Member</h1>
            <table className='text-sm '>
                <thead>
                    <tr>
                        <th>Member Detail</th>
                        <th>Rating</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>

                    {
                        all_members.length > 0 && (
                            all_members.map((value, index) => (
                                <tr key={index}>
                                    <td>
                                        <div className='flex justify-center items-center'>
                                            <div className="acd-member-profile">
                                                <img src={value.user_detail.profile_img} alt="" />
                                            </div>
                                            <div className='mx-2'>
                                                <h1 className='font-bold text-[#4F9E7D]'>{value.user_detail.name}</h1>
                                                <p>{value._id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className='stars mx-auto'>
                                            {
                                                [...Array(Number(value.user_rating))].map((value, index) => (
                                                    <img src='/Global/star.png' key={index} />
                                                ))
                                            }
                                        </div>
                                    </td>
                                    <td>
                                        <div className='flex justify-center items-center'>
                                            <button className='mx-1 text-[#4F9E7D]'
                                                onClick={() => {
                                                    handle_increment_rating(value.user_detail._id, value._id);
                                                }}><GoPlus /></button>
                                            <button className='mx-1 text-[#D36556]'
                                                onClick={() => {
                                                    handle_decrement_rating(value.user_detail._id, value._id);
                                                }}
                                            ><FiMinus /></button>
                                        </div>
                                    </td>

                                </tr>
                            ))
                        )
                    }

                </tbody>
            </table>
        </div>




        <div className='acd-recent-payment'>
            <h1 className='font-medium'>Refunds Approvals</h1>
            <table className='text-sm '>
                <thead>
                    <tr>
                        <th>User Id</th>
                        <th>Amount</th>
                        <th>Payment Type</th>
                        <th>Recete Preview</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {all_returns.length > 0 && (
                        all_returns.map((value, index) => (
                            <tr key={index} className="border-b border-gray-100">

                                <td className="text-center align-middle py-4 text-[#4F9E7D] font-bold">
                                    {value.user_id}
                                </td>

                                <td className="text-center align-middle py-4">
                                    {value.amount}
                                </td>

                                <td className="text-center align-middle py-4">
                                    {value.payment_type === null ? 'Not Paid yet' : value.payment_type}
                                </td>


                                <td className="text-center align-middle py-4">
                                    <div className="flex justify-center">
                                        {value.payment_type === 'online' && (
                                            <img
                                                src={`http://localhost:8080/Images/${value.payment_img}`}
                                                alt="receipt"
                                                className="w-10 h-10 object-cover cursor-pointer rounded shadow-sm"
                                                onClick={() => receipt_zoomed(`http://localhost:8080/Images/${value.payment_img}`)}
                                            />
                                        )}
                                    </div>
                                </td>


                                <td className="text-center align-middle py-4">
                                    <div className='flex justify-center items-center gap-2'>
                                        {!value.approval && (
                                            <button className='text-[#4F9E7D] text-xl' onClick={() => {
                                                accept_return(value)
                                            }}><HiOutlineCheck /></button>
                                        )}
                                        {value.payment_type !== 'Not Paid yet' && (
                                            <button className='text-[#D36556] text-xl' onClick={() => {
                                                reject_return(value.committee_id, value.user_id);
                                            }}><RxCross2 /></button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>



        <div className='grid grid-cols-1 sm:grid-cols-3 gap-1 max-w-4xl mx-auto px-2 justify-items-center'>
            <div className='acd-func-div p-2'>
                <div className='acd-icon bg-[#DBDBB0] text-[#4F9E7D]'><BiTransfer /></div>
                <h1 className='font-medium text-sm'>Transfer Admin</h1>
                <p className='text-xs my-1 text-[#374444c4]'>Appoint another member as committee admin</p>
                <button className='acd-btn text-xs' onClick={() => navigate('/transfer-admin', { state: { ...data } })}>Transfer Rights</button>
            </div>

            <div className='acd-func-div p-2'>
                <div className='acd-icon bg-[#FDDAAA] text-[#F89A5F]'><IoPersonAdd /></div>
                <h1 className='font-medium text-sm'>Add Members</h1>
                <p className='text-xs my-1 text-[#374444c4]'>Invite new participants to the committee</p>
                {
                    data.enrollment_period && (
                        <button className='acd-btn text-xs' onClick={() => navigate('/invite-member', { state: { ...data } })}>Invite Now</button>
                    )
                }
            </div>

            <div className='acd-func-div p-2'>
                <div className='acd-icon bg-[#F6D1AC] text-[#D66D67]'><RiDeleteBin5Line /></div>
                <h1 className='font-medium text-sm'>Dissolve Group</h1>
                <p className='text-xs my-1 text-[#374444c4]'>Permanently delete this committee group</p>
                <button className='acd-btn text-xs' onClick={handle_delete_committee}>Close Group</button>
            </div>
        </div>

    </>)
}
export default AdminCommitteeDetails