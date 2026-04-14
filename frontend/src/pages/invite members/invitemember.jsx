import Navigation from '../../components/navigation/Navigation.jsx'
import { useState } from 'react';
import { IoMdSearch } from "react-icons/io";
import './invitemember.css'
import axios from 'axios'
import { useLocation } from 'react-router-dom';
function invitemembers() {
    const location = useLocation();
    let committee_detail = location.state;
    const [findnumber, setfindnumber] = useState('');
    let [founduser, setfounduser] = useState('');
    let handlechange = (e) => {
        let { name, type, value, checked } = e.target;
        setfindnumber(value);
    }
    let handlesub = (e) => {
        e.preventDefault();
        axios.get(`http://localhost:8080/invite-member/${findnumber}`).then((res) => {
            setfounduser(res.data);
            if (res.data === '') {
                alert("no Such User Found");
            }
        })



    }

    let handlerequest = () => {
        let notification_data = {
            'receiver_id': founduser._id,
            'committee_id': committee_detail._id,
            'user': founduser,
            // 'number_of_committee':number_of_committee,
            'committee_detail': committee_detail,
            'notification_type': 3
        }
        axios.post(`http://localhost:8080/create-notification`,notification_data).then((res) => [
            alert(res.data)
        ])
    }
    return (
        <>
            <Navigation />
            <div className='h-[90vh] flex justify-center items-center'>
                <div className='outer-container text-center py-3'>
                    <h1 className='font-medium text-lg'>Invite Members</h1>
                    <form className='invite-form' onSubmit={handlesub}>
                        <input type='text' name='findnumber' value={findnumber} placeholder='Phone Number' onChange={handlechange} />
                        <button><IoMdSearch /></button>
                    </form>

                    {founduser !== '' && (
                        <div className='outer-personal-profile'>
                            <div className='person-profile'>
                                <div className='person-profile-img '>
                                    <img src={founduser.profile_img} />
                                </div>
                                <div className='text-sm flex flex-col justify-center px-2'>
                                    <div className='stars-div'>
                                        {
                                            [...Array(founduser.rating)].map((_, index) => (
                                                <img src='Global/star.png' key={index} />
                                            ))
                                        }
                                    </div>
                                    <p>{`ID: ${founduser._id} `}</p>
                                    <p>{`Name: ${founduser.name} `}</p>
                                    <p>{`Phoneno: ${founduser.phoneno}`}</p>
                                </div>
                            </div>
                            <div className='flex justify-end text-sm'>
                                <button className='bg-[#D36556] px-3 py-2 rounded-3xl text-[white] hover:bg-[#cf4937]'
                                onClick={handlerequest}
                                >Invite</button>
                            </div>
                        </div>)
                    }


                </div>
            </div>
        </>
    )
}
export default invitemembers