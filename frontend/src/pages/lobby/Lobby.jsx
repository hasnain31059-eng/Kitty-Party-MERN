import './Lobby.css'
import Navigation from '../../components/navigation/Navigation.jsx'
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { RxCross2 } from "react-icons/rx";
function Lobby() {
    const navigate = useNavigate();
    let [userdata, setuserdata] = useState({ _id: "", name: "", password: "", monthly_income: "", phoneno: "", profile_img: "Signup/default-profile-image.jpg", rating: "" });
    let [all_joined_committee, setall_joined_committees] = useState([]);
    let [admin_committee, setadmin_committee] = useState([]);
    let [refund, setrefund] = useState([]);//all pening refund data
    let [refund_obj, setrefund_obj] = useState({
        committee_id: '',
        user_id: '',
        committee_admin_id: '',//from the notification
        message: 'divide this amount to members',// from the notification 
        amount: '',
        refund_payment_type: 'cash',
        refund_img: null,
        refund_receipt_preview: null
    })
    const [refund_hider, setrefund_hider] = useState(false);
    let handle_refund_change = (e) => {
        let { name, type, value } = e.target;
        setrefund_obj((pre) => ({ ...pre, [name]: value }))
    }
    let refund_img_change = (e) => {
        let file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = () => {
            setrefund_obj((pre) => ({
                ...pre,
                refund_img: file,                     // The raw file for API
                refund_receipt_preview: reader.result  // The Base64 string for <img> tag
            }));
        };

        reader.readAsDataURL(file);
    };

    let pay_refund = async (committee_id, user_id, amount) => {
        try {
            // Wait for the data to arrive
            const res = await axios.get(`http://localhost:8080/get-details-of-committee/${committee_id}`);
            const committee_details = res.data;

            // Now this will have the correct admin_id
            setrefund_obj((pre) => ({
                ...pre,
                committee_id,
                user_id,
                amount,
                committee_admin_id: committee_details.admin_id
            }));

            setrefund_hider((pre) => !pre);
        } catch (error) {
            console.error("Error fetching committee details:", error);
        }
    }
    let request_refund_approval = (e) => {
        e.preventDefault();
        const formdata = new FormData();
        formdata.append('user_id', refund_obj.user_id);
        formdata.append('committee_id', refund_obj.committee_id);
        formdata.append('payment_type', refund_obj.refund_payment_type);
        formdata.append('message', refund_obj.message);
        formdata.append('committee_admin_id', refund_obj.committee_admin_id);
        formdata.append('amount', refund_obj.amount);
        formdata.append('payment_img', refund_obj.refund_img);
        axios.put('http://localhost:8080/pay-refund', formdata).then((res) => {
            alert(res.data);
        })
        setrefund_hider((pre) => !pre);

        axios.get(`http://localhost:8080/get-refund-of-user/${userdata._id}`).then((res) => {
            setrefund(res.data)
        })

    }
    useEffect(() => {
        axios.get('http://localhost:8080/getprofile', { withCredentials: true }).then((res) => {
            if (typeof (res.data) === 'object') {
                setuserdata(res.data);

                axios.get(`http://localhost:8080/get-all-joined-committees/${res.data._id}`).then((res) => {
                    setall_joined_committees(res.data);
                })

                axios.get(`http://localhost:8080/get-all-committees-of-admin/${res.data._id}`).then((res) => {
                    setadmin_committee(res.data);
                })

                axios.get(`http://localhost:8080/get-refund-of-user/${res.data._id}`).then((res) => {
                    setrefund(res.data)
                })
            }
            else {
                console.log(res.data);
            }
        })


    }, [])
    return (
        <>
            {
                refund_hider && (
                    <div className='refund_payment_div'>
                        <div className='fixed top-5 right-2.5'>
                            <button className='text-[white] font-medium text-4xl' onClick={() => { setrefund_hider((pre) => !pre) }}><RxCross2 /></button>
                        </div>
                        <form onSubmit={request_refund_approval}>
                            {
                                refund_obj.refund_receipt_preview && (
                                    <div className='refund_recete_preview'>
                                        <img src={refund_obj.refund_receipt_preview} alt="" />
                                    </div>
                                )
                            }
                            <div>
                                <h1 className='font-medium'>Payment Type</h1>
                                <label>Cash</label>
                                <input type="radio" name='refund_payment_type' value='cash' onChange={handle_refund_change} checked={refund_obj.refund_payment_type === 'cash'} />
                                <label>Online</label>
                                <input type="radio" name='refund_payment_type' value='online' onChange={handle_refund_change} checked={refund_obj.refund_payment_type === 'online'} />
                            </div>
                            {
                                refund_obj.refund_payment_type != 'cash' && (
                                    <div>
                                        <input type="file" accept='image/*' name='refund_img' onChange={refund_img_change} />
                                    </div>
                                )

                            }

                            <input type="submit" className='bg-[#D36556] px-1 text-[white] rounded-[5px]' />
                        </form>
                    </div>
                )
            }

            <Navigation />
            <div className='flex items-center px-1 text-sm'>
                <div className='profile'>
                    <img src={userdata.profile_img} />
                </div>
                <div className='mx-3'>
                    <div className='stars'>
                        {
                            [...Array(Number(userdata.rating))].map((value, index) => (
                                <img src='/Global/star.png' key={index} />
                            ))
                        }
                    </div>
                    <h3 className='text-[#D36556] font-medium text-lg'>{userdata.name}</h3>
                    <h3 >Id:{userdata._id}</h3>
                </div>
            </div>
            <div className='flex justify-end px-3'>
                <Link to='/create-committee' state={{ userid: userdata._id }}><button className='bg-[#61AB78] text-[white] p-2 rounded-3xl mx-1 text-sm hover:bg-[#D36556]'>Create Kitty</button></Link>
                <Link to='/join-committee' state={{ '_id': userdata._id, 'name': userdata.name, 'rating': userdata.rating, 'phoneno': userdata.phoneno, 'profile_img': userdata.profile_img }}>
                    <button className='bg-[#61AB78] text-[white] p-2 rounded-3xl mx-1 text-sm hover:bg-[#D36556]'>
                        Join Kitty
                    </button>
                </Link>
            </div>

            <div className='lobby-tables-outer mx-auto my-5'>
                <h1 className='mb-2 font-medium'>All Joined Committees</h1>
                <div className='overflow-x-scroll sm:overflow-x-hidden'>
                    <table className='border-collapse '>
                        <thead>
                            <tr>
                                <th>
                                    ID
                                </th>
                                <th>
                                    Name
                                </th>
                                <th>
                                    Details
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                all_joined_committee.map((value, index) => (
                                    <tr key={index}>
                                        <td>{value.committee_id}</td>
                                        <td>{value.committee_details.committee_name}</td>
                                        {/* ? is used to prevent the code for crashing if value is null or un defined */}
                                        <td>
                                            <button className='committee-detail-btn px-3 my-1 rounded-2xl'
                                                onClick={() => { navigate('/committee-details', { state: value }) }}>
                                                Show
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            }

                        </tbody>
                    </table>
                </div>

            </div>



            <div className='lobby-tables-outer mx-auto my-5'>
                <h1 className='mb-2 font-medium'>All Created Committees</h1>
                <div className='overflow-x-scroll sm:overflow-x-hidden'>
                    <table className='border-collapse '>
                        <thead>
                            <tr>
                                <th>
                                    ID
                                </th>
                                <th>
                                    Name
                                </th>
                                <th>
                                    mantain
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                admin_committee.map((value, index) => (
                                    <tr key={index}>
                                        <td>{value._id}</td>
                                        <td>{value.committee_name}</td>
                                        {/* ? is used to prevent the code for crashing if value is null or un defined */}
                                        <td>
                                            <button className='committee-detail-btn px-3 my-1 rounded-2xl'
                                                onClick={() => { navigate('/admin-committee-details', { state: value }) }}>
                                                Show
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            }

                        </tbody>
                    </table>
                </div>

            </div>



            {
                refund.length>0 && (
                    <div className='lobby-tables-outer mx-auto my-5'>
                        <h1 className='mb-2 font-medium'>Return Amounts</h1>
                        <div className='overflow-x-scroll sm:overflow-x-hidden'>
                            <table className='border-collapse'>
                                <thead>
                                    <tr>
                                        <th>
                                            Committee ID
                                        </th>
                                        <th>
                                            Amount
                                        </th>
                                        <th>
                                            Payment Img
                                        </th>
                                        <th>
                                            Payment Type
                                        </th>
                                        <th>
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        refund.map((value, index) => (
                                            <tr key={index}>
                                                <td>{value.committee_id}</td>
                                                <td>{value.amount}</td>
                                                <td >
                                                    <img src={`http://localhost:8080/Images/${value.payment_img}`} alt="receipt" className='w-12.5 mx-auto' />
                                                </td>
                                                <td>{value.payment_type}</td>
                                                {/* ? is used to prevent the code for crashing if value is null or un defined */}
                                                <td>
                                                    <button className='committee-detail-btn px-3 my-1 rounded-2xl'
                                                        onClick={() => { pay_refund(value.committee_id, value.user_id, value.amount) }}>
                                                        PayNow
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    }

                                </tbody>
                            </table>
                        </div>

                    </div>

                )
            }




        </>
    )
}
export default Lobby;