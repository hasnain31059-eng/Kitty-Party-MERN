import './Lobby.css'
import Navigation from '../../components/navigation/Navigation.jsx'
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
function Lobby() {
    const navigate = useNavigate();
    let [userdata, setuserdata] = useState({ _id: "", name: "", password: "", monthly_income: "", phoneno: "", profile_img: "Signup/default-profile-image.jpg", rating: "" });
    let [all_joined_committee, setall_joined_committees] = useState([]);
    let [admin_committee,setadmin_committee]=useState([]);
    useEffect(() => {
        axios.get('http://localhost:8080/getprofile', { withCredentials: true }).then((res) => {
            if (typeof (res.data) === 'object') {
                setuserdata(res.data);

                axios.get(`http://localhost:8080/get-all-joined-committees/${res.data._id}`).then((res) => {
                    setall_joined_committees(res.data);
                })

                axios.get(`http://localhost:8080/get-all-committees-of-admin/${res.data._id}`).then((res)=>{
                    setadmin_committee(res.data);
                })
            }
            else {
                console.log(res.data);
            }
        })

    }, [])
    return (
        <>
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



        </>
    )
}
export default Lobby;