import './PersonalCommittee.css'
import Navigation from '../../components/navigation/Navigation.jsx'
import { useLocation, useNavigate } from 'react-router-dom'
import { GiFullPizza } from "react-icons/gi";
import { BiTransfer } from "react-icons/bi";
import { MdPersonRemoveAlt1 } from "react-icons/md";
import { RiDeleteBinFill } from "react-icons/ri";
import { IoShareSocialOutline } from "react-icons/io5";
import { ImExit } from "react-icons/im";
import { useEffect, useState } from 'react';
import { RxCross2 } from "react-icons/rx";
import axios from 'axios';
function PersonalCommittee() {
    const location = useLocation();
    const navigate = useNavigate();
    const data = location.state;//this contain {personal committee}
    const [committee_current_cycle, setcommittee_current_cycle] = useState([]);
    const [committee_end, setcommittee_end] = useState(false);
    let [personal_obj, setpersonal_obj] = useState({
        cycle_id: '',
        payment_type: 'cash',
        payment_img: null,
        payment_receipt_preview: null
    })
    const [payment_hider, setpayment_hider] = useState(false);
    let handle_exit = (committee_id) => {
        axios.delete(`http://localhost:8080/leave-personal-committee/${committee_id}`).then((res) => {
            navigate('/lobby');
        })
    }

    let request_payment_approval = (e) => {
        e.preventDefault();
        let formdata = new FormData();
        formdata.append('cycle_id', personal_obj.cycle_id);
        formdata.append('payment_type', personal_obj.payment_type);
        formdata.append('payment_img', personal_obj.payment_img);
        axios.put('http://localhost:8080/personal-payment', formdata).then((res) => {
            setpayment_hider(false);
            setpersonal_obj({
                payment_type: 'cash',
                payment_img: null,
                payment_receipt_preview: null
            })
            axios.get(`http://localhost:8080/get-current-personal-cycle/${data._id}`).then((res) => {
                setcommittee_current_cycle(res.data);
            })
            alert(res.data);
        })
    }

    let handle_payment_change = (e) => {
        e.preventDefault();
        let { name, type, value } = e.target;
        setpersonal_obj((pre) => ({ ...pre, [name]: value }));
    }

    let payment_img_change = (e) => {
        let file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = () => {
            setpersonal_obj((pre) => ({
                ...pre,
                payment_img: file,                     // The raw file for API
                payment_receipt_preview: reader.result  // The Base64 string for <img> tag
            }));
        };

        reader.readAsDataURL(file);
    }

    useEffect(() => {
        axios.get(`http://localhost:8080/get-current-personal-cycle/${data._id}`).then((res) => {
            setcommittee_current_cycle(res.data);
        })

        axios.get(`http://localhost:8080/verify-ending-date/${data._id}`).then((res) => {
            if (res.data === 'Committee Ended') {
                setcommittee_end(true)
            }
        })
    }, [])
    return (
        <>
            {
                payment_hider && (
                    <div className='refund_payment_div'>
                        <div className='fixed top-5 right-2.5'>
                            <button className='text-[white] font-medium text-4xl' onClick={() => {
                                setpayment_hider((pre) => !pre)
                                setpersonal_obj({
                                    payment_type: 'cash',
                                    payment_img: null,
                                    payment_receipt_preview: null
                                })
                            }}><RxCross2 /></button>
                        </div>
                        <form onSubmit={request_payment_approval}>
                            {
                                personal_obj.payment_receipt_preview && (
                                    <div className='refund_recete_preview'>
                                        <img src={personal_obj.payment_receipt_preview} alt="" />
                                    </div>
                                )
                            }
                            <div>
                                <h1 className='font-medium'>Payment Type</h1>
                                <label>Cash</label>
                                <input type="radio" name='payment_type' value='cash' onChange={handle_payment_change} checked={personal_obj.payment_type === 'cash'} />
                                <label>Online</label>
                                <input type="radio" name='payment_type' value='online' onChange={handle_payment_change} checked={personal_obj.payment_type === 'online'} />
                            </div>
                            {
                                personal_obj.payment_type != 'cash' && (
                                    <div>
                                        <input type="file" accept='image/*' name='payment_img' onChange={payment_img_change} />
                                    </div>
                                )

                            }

                            <input type="submit" className='bg-[#D36556] px-1 text-[white] rounded-[5px]' />
                        </form>
                    </div>
                )
            }

            <Navigation />
            <div className='text-sm flex justify-between align-middle px-2 sm:px-5 mt-4'>
                <div>
                    <h1 className='text-[#D36556] font-medium'>
                        {data.committee_name}
                    </h1>

                    <h1 className='text-xs'>
                        Member Id:{data._id}
                    </h1>
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
                                            <h1 className='font-medium'>{data.amount}</h1>
                                        </div>
                                        <button className='pay-now-btn' onClick={() => {
                                            setpayment_hider((pre) => !pre);
                                            setpersonal_obj((pre) => ({ ...pre, cycle_id: value._id }))
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
                        <h1> Committee End </h1>
                    </div>
                    <div>
                        {
                            committee_end ? (
                                <>
                                    <h1>Committee Ened</h1>
                                </>
                            ) :
                                (
                                    <>
                                        <h1>Committee Will End Soon</h1>
                                    </>
                                )
                        }

                    </div>
                </div>








            </div>

            <div className='flex justify-around'>

                <button className='bg-[#FB9D57] flex justify-center items-center text-sm px-2 py-1 rounded-xl'
                    onClick={() => { handle_exit(data._id) }}
                >
                    < ImExit />
                    Leave Party
                </button>
            </div>


        </>
    )
}
export default PersonalCommittee;