import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios'
import './Login.css'
function Login() {
  const [fdata, setfdata] = useState({ phoneno: "", password: "" });
  const navigate = useNavigate();
  let senddata = (e) => {
    e.preventDefault();
    axios.post('http://localhost:8080/login', fdata, { withCredentials: true }).then((res) => {
      if (res.data === 'User Found') {
        navigate('/lobby');
      }
      else {
        alert(res.data);
      }
    })
  }
  let handelchange = (e) => {
    let { name, type, value, checked } = e.target;
    setfdata((pre) => ({ ...pre, [name]: type === 'checkbox' ? checked : value }));
  }

  useEffect(() => {
    axios.post('http://localhost:8080/verify-login', {}, { withCredentials: true }).then((res) => {
      if (res.data === 'Authorized') {
        navigate('/lobby');
      }
      else {
        console.log(res.data);
      }
    })
  }, [])
  return (
    <>
      <div className="login-div flex flex-col justify-center items-center">
        <h1 className='font-bold text-6xl mb-4'>Kitty Party</h1>
        <div className="login-catface pt-3">
          <img src="login-images/1M_Login-removebg-preview.png" />
        </div>
        <h3 className='text-3xl font-bold'>Login</h3>
        <form onSubmit={senddata}>
          <input type="text" className='textboxes my-1 border-2 rounded-xl pl-3' value={fdata.phoneno} name="phoneno" placeholder="Phone Number" onChange={handelchange} />
          <br />
          <input type="password" className='textboxes my-1 border-2 rounded-xl pl-3' value={fdata.password} name="password" placeholder="Password" onChange={handelchange} />
          <br />
          <div className="text-center">
            <input type="submit" value="LogIn" className="login-btn px-6 py-1 rounded-xl" />
          </div>
        </form>
        <div className='w-full px-5 sm:px-40 text-right text-red-600'>
          <Link to='/signUp' className='hover:text-amber-600'>Create Account</Link>
        </div>
      </div>

    </>
  )

}
export default Login