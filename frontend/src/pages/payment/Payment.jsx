import './Payment.css'
import Navigation from '../../components/navigation/Navigation.jsx'
import { useState } from 'react';
import { useLocation,useNavigate } from 'react-router-dom';
import axios from 'axios';
function Payment() {
    const location = useLocation();
    const navigate= useNavigate();
    const [payment, setpayment] = useState({ payment_type: 'cash', payment_img: '' });
    const [tempimg, settempimg] = useState('');
    let data = location.state;//{cycle_id,member_id,committee_detail}
    let handlechange = (e) => {
        let { name, type, value, checked } = e.target;
        setpayment((pre) => ({ ...pre, [name]: type === 'checkbox' ? checked : value }));

    }

    let handlepayment = (e) => {
        e.preventDefault();
        const formdata = new FormData();
        formdata.append('payment_type', payment.payment_type);
        if (payment.payment_type === 'online' && !payment.payment_img) {
            alert("Please upload a payment receipt to proceed.");
            return; // This stops the function here
        }
        else {
            formdata.append('payment_img', payment.payment_img);
        }
        formdata.append('cycle_id', data.cycle_id);
        formdata.append('member_id', data.member_id);
        formdata.append('committee_detail', JSON.stringify(data.committee_detail))//to send an obj
        axios.post('http://localhost:8080/payment-handle', formdata).then((res) => {
            alert(res.data);
            navigate('/lobby');
        })
    }

    let handlepaymentimg = (e) => {
        let displayimg_file = e.target.files[0];
        if (!displayimg_file) return; // Guard clause if user cancels selection

        const reader = new FileReader();
        reader.onload = () => {
            settempimg(reader.result);
        }
        reader.readAsDataURL(displayimg_file);
        setpayment((pre) => ({ ...pre, 'payment_img': displayimg_file }));
    }

    return (
        <>
            <Navigation />
            <h1 className='text-center font-medium text-2xl'>Payment</h1>
            <form onSubmit={handlepayment} className='payment-form'>
                <h1>Select Payment type</h1>
                <div>
                    <input
                        type='radio'
                        name='payment_type'
                        value='cash'
                        className='mx-1'
                        checked={payment.payment_type === 'cash'}
                        onChange={handlechange}
                    />
                    <label>Cash</label>

                    <input
                        type='radio'
                        name='payment_type'
                        value='online'
                        className='mx-1'
                        checked={payment.payment_type === 'online'}
                        onChange={handlechange}
                    />
                    <label>Online</label><br />
                </div>

                {payment.payment_type === 'online' && (
                    <>
                        <div className='receipt-div'>
                            {tempimg && (
                                <img src={tempimg} alt='receipt preview' />
                            )}
                        </div>
                        <div className="payment-receipt-btn">
                            <input
                                type="file"
                                id="actual-btn"
                                hidden
                                onChange={handlepaymentimg}
                                accept="image/*"
                            />

                            <label htmlFor="actual-btn" className="custom-button-style">
                                Choose File
                            </label>
                        </div>
                    </>
                )}
                <input type='submit' value='PayNow' className='bg-[#61AB78] px-2 rounded-2xl text-white my-2' />
            </form>
        </>
    )
}

export default Payment;