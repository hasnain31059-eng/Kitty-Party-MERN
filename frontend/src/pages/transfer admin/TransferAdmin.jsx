import './TransferAdmin.css'
import Navigation from '../../components/navigation/Navigation.jsx'
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
function TransferAdmin() {
    const location = useLocation();
    const navigate = useNavigate();
    let co = location.state; //this contain committee details from shared_committee table
    const [members, setmembers] = useState([]);


    let handletransfer = (new_admin_id) => {
        axios.post(`http://localhost:8080/new-committee-admin`,{'committee_id':co._id,'old_admin_id':co.admin_id,'new_admin_id':new_admin_id}).then((res)=>{
            alert(res.data);
            navigate('/lobby');
        })
    }


    useEffect(() => {
        axios.post(`http://localhost:8080/get-all-member-comittee`,{'committee_id':co._id,'admin_id':co.admin_id}).then((res) => {
            setmembers(res.data);
        })
    }, [])
    return (
        <>
            <Navigation />
            <h1 className='text-center font-medium text-xl my-2'>All Committee Members</h1>
            <div className='tr_outer grid gap-3 grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto px-4'>
                {
                    members.map((value, index) => (
                        
                            <div className='tr_card_outer' key={index}>
                                <div className='tr_card text-sm flex justify-center items-center'>
                                    <div className='tr_card_img'>
                                        <img src={value.user.profile_img} alt="profile-img" />
                                    </div>
                                    <div>
                                        <h1>Id:{value.user._id}</h1>
                                        <div className="stars">
                                            {
                                                [...Array(Number(value.user.rating))].map((value, index) => (
                                                    <img src='/Global/star.png' key={index} />
                                                ))
                                            }
                                        </div>
                                        <h1 className='font-medium'><span>{value.user.name}</span></h1>
                                        <h1>ph:{value.user.phoneno}</h1>
                                    </div>
                                </div>
                                <div className='flex justify-end'>
                                    <button className='text-white bg-[#D36556] text-sm rounded-2xl px-2 py-1 hover:bg-[#61AB78]' onClick={() => {handletransfer(value.user._id)}}>Transfer</button>
                                </div>
                            </div>


                    ))
                }




            </div>
        </>
    )
}
export default TransferAdmin;