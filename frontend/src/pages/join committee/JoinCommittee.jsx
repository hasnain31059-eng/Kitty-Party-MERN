import { useState } from 'react';
import Navigation from '../../components/navigation/Navigation.jsx'
import './joinCommittee.css'
import { AiOutlineSearch } from "react-icons/ai";
import axios from 'axios';
import { useNavigate, useLocation } from "react-router-dom";

function JoinCommittee() {
    const location = useLocation();
    const navigate = useNavigate();
    let user_data = location.state;//ya bandaa committee join karnaa chaataa ha.from the lobby

    const [searchNumber, setsearchNumber] = useState('');
    let [committee_details, setcommittee_details] = useState([]);// is wo committees hann jis ka admin find kia hoa number ha.
    let [number_of_committee, setnumber_of_committee] = useState(1);
    let handlechange = (e) => {
        let { name, type, value, checked } = e.target;
        setsearchNumber(value);
    }
    let search = (e) => {
        e.preventDefault();
        axios.get(`http://localhost:8080/committee-of-this-no/${searchNumber}`).then((res) => {
            setcommittee_details((res.data));
            if (res.data.length === 0) {
                alert('Number Not found or not created any committee');
            }
        })

    }
    let sendrequest = (committee_admin_id, committee_id, committee_detail_obj) => {
        let notification_data = {
            'receiver_id': committee_admin_id,
            'committee_id': committee_id,
            'committee_detail': committee_detail_obj,
            'user': user_data,
            'number_of_committee': number_of_committee,
            'notification_type': 1
        }
        axios.post(`http://localhost:8080/create-notification`, notification_data).then((res) => {
            alert(res.data);
        })
    }
    return (
        <>
            <Navigation />
            <div className='join-outer-outer flex justify-center items-center'>
                <div className="join-outer">
                    <h1 className='font-medium text-2xl my-3'>Join Committee</h1>
                    <form className='join-form' onSubmit={search}>
                        <input type='text' value={searchNumber} placeholder='Phone Number' onChange={handlechange} required />
                        <button><AiOutlineSearch /></button>
                    </form>
                    <div>

                        {
                            committee_details.length > 0 && (
                                committee_details.map((value, index) => (
                                    <div className='joincards-div my-2' key={index}>
                                        <div className='joincards'>
                                            <div className='text-[white] bg-[#61AB78] px-3.5 py-1 mr-2 text-2xl rounded-[50%]'>$</div>
                                            <div className='text-sm'>
                                                <p>Id:{value.committee_detail._id}</p>
                                                <p>Name:{value.committee_detail.committee_name}</p>
                                                <p>Type:
                                                    {
                                                        (() => {
                                                            switch (value.committee_detail.committee_type) {
                                                                case '1': return "Simple";
                                                                case '2': return "Bidding";
                                                                case '3': return "Spin";
                                                                default: return "Unknown";
                                                            }
                                                        })() // The () at the end executes the function
                                                    }
                                                </p>
                                                <div className='flex'>
                                                    <h1>No of committees: {number_of_committee}</h1>
                                                    <button className='num_of_com_btn' onClick={() => setnumber_of_committee((pre) => (pre + 1))}>+</button>
                                                    <button className='num_of_com_btn' onClick={() => {
                                                        if (number_of_committee === 1) {
                                                            alert('Committee Can Not be lessThen 1');
                                                        }
                                                        else {
                                                            setnumber_of_committee((pre) => (pre - 1))
                                                        }
                                                    }}>-</button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className=' flex justify-end'>
                                            <button className='bg-[#D36556] px-2 py-1 rounded-2xl text-[white] text-sm hover:bg-[#ca5141]' onClick={()=>{navigate('/Committee-users-rating',{state:{'committee_id':value.committee_detail._id,'admin_id':value.committee_detail.admin_id}})}}>See Ratings</button>
                                            <button className='bg-[#D36556] px-2 py-1 rounded-2xl text-[white] text-sm hover:bg-[#ca5141]' onClick={() => { sendrequest(value._id, value.committee_detail._id, value.committee_detail) }}>Request</button>
                                        </div>
                                    </div>
                                ))

                            )
                        }


                    </div>
                </div>
            </div >
        </>
    )
}
export default JoinCommittee;