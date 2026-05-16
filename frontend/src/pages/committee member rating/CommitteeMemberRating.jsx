import { useEffect, useState } from 'react';
import { AiOutlineSearch } from "react-icons/ai";
import axios from 'axios';
import Navigation from '../../components/navigation/Navigation.jsx'
import { useNavigate, useLocation } from "react-router-dom";
function CommitteeMemberRating() {
    const location = useLocation();
    const navigate = useNavigate();
    let data = location.state
    // console.log(data);
    let [admin_rating, setadmin_rating] = useState({});
    let [allmembers_rating, setallmembers_rating] = useState([]);

    useEffect(() => {
        axios.get(`http://localhost:8080/get-admin-rating/${data.admin_id}`).then((res) => {
            setadmin_rating(res.data);
            // console.log(res.data);
        })


        axios.get(`http://localhost:8080/get-member-rating/${data.committee_id}`).then((res) => {
            setallmembers_rating(res.data);
            // console.log(res.data);
        })

    }, [])
    return (
        <>
            <Navigation />
            <div>
                <h1 className='font-medium'>{data.committee_id}</h1>
            </div>




            <div className='lobby-tables-outer mx-auto my-5'>
                <h1 className='mb-2 font-medium'>Committee Admin</h1>
                <div className='overflow-x-scroll sm:overflow-x-hidden'>
                    <table className='border-collapse '>
                        <thead>
                            <tr>
                                <th>
                                    Name
                                </th>
                                <th>
                                    Rating
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>

                                <td>
                                    {admin_rating.name}
                                </td>
                                <td>
                                    {admin_rating.rating}
                                </td>
                            </tr>

                        </tbody>
                    </table>
                </div>

            </div>


            <div className='lobby-tables-outer mx-auto my-5'>
                <h1 className='mb-2 font-medium'>Member_ratings</h1>
                <div className='overflow-x-scroll sm:overflow-x-hidden'>
                    <table className='border-collapse '>
                        <thead>
                            <tr>
                                <th>
                                    Name
                                </th>
                                <th>
                                    Rating
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                allmembers_rating.map((value, index) => (
                                    <tr key={index}>
                                        <td>{value.user_details.name}</td>
                                        <td>{value.user_details.rating}</td>
                                    </tr>
                                ))
                            }

                        </tbody>
                    </table>
                </div>

            </div>







            <div>
                <button className='committee-detail-btn px-3 my-1 rounded-2xl' onClick={() => { navigate('/join-committee') }}>Go Back to join Committee</button>
            </div>

        </>
    )


}
export default CommitteeMemberRating