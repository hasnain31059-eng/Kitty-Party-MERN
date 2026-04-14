import Navigation from '../../components/navigation/Navigation.jsx'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './Profile.css'
import { MdOutlineDeleteForever } from "react-icons/md";
import { MdAdd } from "react-icons/md";
import axios from 'axios'
function Profile() {
    const [user, setuser] = useState({ _id: "", name: "", password: "", monthly_income: "", phoneno: "", profile_img: "Signup/default-profile-image.jpg", rating: "" });
    let handeldeleteimg = () => {
        axios.put('http://localhost:8080/deleteprofileimg', { '_id': user._id }, {}).then((res) => {
            if (res.data === 'profileimg deleted') {
                alert("Image deleted");
            }
            else {
                console.log(res.data);
            }
        })
    }

    let handelupdateimg = (e) => {
        let f = e.target.files[0];
        ///multipart Form_Data
        const formdata = new FormData();
        formdata.append('_id', user._id);
        formdata.append('profile_img', f);
        axios.put('http://localhost:8080/updateprofileimg', formdata).then((res) => {
            if (res.data === 'profileimg updated') {
                alert("Image Updated");
            }
            else {
                console.log(res.data);
            }
        })
    }
    useEffect(() => {
        axios.get('http://localhost:8080/getprofile', { withCredentials: true }).then((res) => {
            if (typeof (res.data) === 'object') {
                setuser(res.data);
            }
            else {
                console.log(res.data);
            }
        })
    }, [])
    return (
        <>
            <Navigation />
            <div className='full-outer flex justify-center items-center-safe'>
                <div className='outer-container-profile mx-2'>
                    <div className="profile-img mb-2">
                        <img src={user.profile_img} />
                        <div className='profileimg-btn-div'>
                            <div className="img-btns" onClick={() => { handeldeleteimg(user._id) }}><MdOutlineDeleteForever /></div>
                            <div className="img-btns">
                                {/* 1. Use a label as your button container */}
                                <label htmlFor="profile-upload" className="cursor-pointer flex items-center justify-center">
                                    {/* 2. Your Icon */}
                                    <MdAdd />
                                    {/* 3. The Hidden Input linked by ID */}
                                    <input
                                        id="profile-upload"
                                        type="file"
                                        className="hidden" onChange={handelupdateimg} />
                                </label>
                            </div>
                        </div>
                    </div>
                    <p><span>Id :</span>{user._id}</p>
                    <p className='text-[#61AB78] text-2xl'><b>{user.name}</b></p>
                    <div className="rating my-1">

                        {

                            [...Array(Number(user.rating))].map((value, index) => (
                                <img src='/Global/star.png' key={index} />
                            ))

                        }
                    </div>
                    <p><span>Monthly Income :</span>{user.monthly_income}</p>
                    <p><span>Phone Number :</span>{user.phoneno}</p>
                    <p><span>Password :</span>{user.password}</p>
                    <div className='flex justify-end'>
                      <Link to={'/signup'} state={user}><button className='bg-[#D36556] px-2 py-1 text-sm text-[#FAEBD7] rounded-2xl hover:bg-[#c35041]'>Update</button></Link> 
                    </div>
                </div>
            </div>
        </>
    )
}

export default Profile