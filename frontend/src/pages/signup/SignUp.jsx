import './SignUp.css'
import axios from 'axios'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react';
import { MdDriveFileRenameOutline } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { GrMoney } from "react-icons/gr";
import { FaSquarePhone } from "react-icons/fa6";

function SignUp() {
    const navigate = useNavigate();
    const location = useLocation();
    let updatedata = location.state;
    const [fdata, setfdata] = useState({ name: "", password: "", monthly_income: "", phoneno: "", profile_img: "" });
    const [tempimg, settempimg] = useState('Signup/default-profile-image.jpg');
    const [save_updatebtn, setsave_updatebtn] = useState('Create Account');

    let handelimage = (e) => {
        let tempfiles = e.target.files[0];//list of files
        let displayimg_file = e.target.files[0];//read base64 image to show user what he selected
        const reader = new FileReader();
        reader.onload = () => {
            settempimg(reader.result);
        }
        reader.readAsDataURL(displayimg_file);
        setfdata((pre) => ({ ...pre, profile_img: tempfiles }));//storing only first element from list of file;
    }




    let handelchange = (e) => {
        let { name, type, value, checked } = e.target;
        setfdata((pre) => ({ ...pre, [name]: type === 'checkbox' ? checked : value }));
    }





    let senddata = (e) => {
        e.preventDefault();

        if (save_updatebtn === 'Update') {
            const formdata = new FormData();
            formdata.append('name', fdata.name);
            formdata.append('password', fdata.password);
            formdata.append('monthly_income', fdata.monthly_income);
            formdata.append('phoneno', fdata.phoneno);
            formdata.append('profile_img', fdata.profile_img); // i always send photo the photo contain url or binary file ..in backend i handel if file the else update remainig data.
            axios.put(`http://localhost:8080/update-user/${fdata._id}`,formdata,{withCredentials:true}).then((res)=>{
                if(res.data==='updated'){
                    navigate('/profile');
                }
                else{
                    console.log(res.data);
                }
            })

        }
        else {
            const formdata = new FormData();
            formdata.append('name', fdata.name);
            formdata.append('password', fdata.password);
            formdata.append('monthly_income', fdata.monthly_income);
            formdata.append('phoneno', fdata.phoneno);
            formdata.append('profile_img', fdata.profile_img);//when no one is select i always send "".in the backend i handel that no image default image set if image you know well.
            axios.post('http://localhost:8080/create_user', formdata).then((res) => {
                alert(res.data);
                setfdata({ name: "", password: "", monthly_income: "", phoneno: "", profile_img: "" });
                settempimg('Signup/default-profile-image.jpg');//before moveing to the login page reverse the image to default.
                if (res.data === 'user Created') {
                    navigate('/');
                }
            })
        }


    }
    useEffect(() => {
        if (updatedata) {
            setfdata(updatedata);
            settempimg(updatedata.profile_img);
            setsave_updatebtn("Update");
        }
    }, [])
    return (
        <>
            <div>
                <h1 className='font-bold text-2xl px-2 py-1 md:px-9'>Kitty Party</h1>
            </div>
            <div className='flex flex-col  justify-center items-center'>
                <h1 className='text-2xl my-2'>Personal Information</h1>
                <form className="outer-container px-9 py-9" onSubmit={senddata}>
                    <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
                        <div className='input-fields'>
                            <MdDriveFileRenameOutline className='icons' />
                            <input type='text' value={fdata.name} name='name' placeholder='Name' onChange={handelchange} required />
                        </div>
                        <div className='input-fields'>
                            <RiLockPasswordFill className='icons' />
                            <input type='password' value={fdata.password} name='password' placeholder='Password' onChange={handelchange} required />
                        </div>
                        <div className='input-fields'>
                            <GrMoney className='icons' />
                            <input type='text' value={fdata.monthly_income} name='monthly_income' placeholder='Monthly Income' onChange={handelchange} />
                        </div>
                        <div className='input-fields'>
                            <FaSquarePhone className='icons' />
                            <input type='text' value={fdata.phoneno} name='phoneno' placeholder="Phone Number" onChange={handelchange} required />
                        </div>
                    </div>

                    <div className='profile-div my-2'>
                        <h6>Profile image</h6>
                        <div className='profileimg'><img src={tempimg} /></div>
                        <div className='py-2'>
                            <input type='file' name='profile_img' onChange={handelimage} className='file-btn' />
                        </div>
                    </div>
                    <div className='flex justify-end'>
                        <input type='submit' value={save_updatebtn} className='create-profile-btn' />
                    </div>
                </form>
            </div>
            <div className='w-full px-5 sm:px-40  mt-7 hover:text-amber-600 text-red-600'>
                <Link to='/'>Login Account</Link>
            </div>
        </>
    )
}
export default SignUp;