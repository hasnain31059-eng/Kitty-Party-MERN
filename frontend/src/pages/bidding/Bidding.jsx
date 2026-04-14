import './Bidding.css'
import Navigation from '../../components/navigation/Navigation'
import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom';
import axios from 'axios';

function Bidding() {
    let [amount, setamount] = useState("");
    let [bidding_max_amount, setbidding_max_amount] = useState("");
    let [winner_bidder, setwinner_bidder] = useState({});
    const location = useLocation();
    let obj = location.state;//{committee_id,member_id}
    let handlechange = (e) => {
        let { value } = e.target;
        setamount(value);
    }
    let handlesave = (e) => {
        e.preventDefault();
        if (amount <= 0 || amount > bidding_max_amount) {
            alert("please Enter Valid Amount");
        }
        else {
            axios.post('http://localhost:8080/current-bidding-cycle', { ...obj, 'amount': amount }).then((res) => {
                alert(res.data);
                axios.get(`http://localhost:8080/current-cycle-winner-bidder-of-committee/${obj.committee_id}`).then((res) => {
                    setwinner_bidder(res.data);
                })
            })
        }
    }
    useEffect(() => {
        axios.get(`http://localhost:8080/get-details-of-committee/${obj.committee_id}`).then((res) => {
            let committee_detail = res.data;
            setbidding_max_amount(committee_detail.amount * committee_detail.number_of_member);
        })
        axios.get(`http://localhost:8080/current-cycle-winner-bidder-of-committee/${obj.committee_id}`).then((res) => {
            setwinner_bidder(res.data);
        })
    }, [])
    return (<>
        <Navigation />
        <h1 className='font-medium text-2xl text-center my-2'>Committee Bidding</h1>
        <form onSubmit={handlesave} className='flex justify-center items-center'>
            <input type='text' name='amount' value={amount} placeholder='Amount' onChange={handlechange} className='inner-form-text-input' required />
            <input type='submit' value='save' className='bidding-btn' />
        </form>
        <div className='lobby-tables-outer mx-auto my-5'>
            <h1 className='mb-2 font-medium'>Bidding Winner</h1>
            <div className='overflow-x-scroll sm:overflow-x-hidden'>
                <table className='border-collapse '>
                    <thead>
                        <tr>
                            <th>
                                Member ID
                            </th>
                            <th>
                                Name
                            </th>
                            <th>
                                Amount
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{winner_bidder.member_id}</td>
                            <td>{winner_bidder.name}</td>
                            <td>{winner_bidder.amount}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>
    </>)
}
export default Bidding;