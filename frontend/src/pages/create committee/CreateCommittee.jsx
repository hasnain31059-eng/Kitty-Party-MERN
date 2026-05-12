import { useState } from "react";
import Navigation from '../../components/navigation/Navigation.jsx'
import { AiFillLike } from "react-icons/ai";
import { ImHammer2 } from "react-icons/im";
import { LuFerrisWheel } from "react-icons/lu";
import './CreateCommittee.css'
import { useNavigate, useLocation } from "react-router-dom";
import axios from 'axios'
function CreateKitty() {
    const navigate = useNavigate();
    const location = useLocation();
    const [rawdata, setrawdata] = useState({
        committee_name: "", amount: "", start_date: "",
        days_gap: "", deadline_day: "", saving_type: "2", total_cycle: "",
        committee_leaving_type: '1', committee_type: "1", members_arrange_type: "2"
    });
    let committee_admin_details = location.state;//this contain object of userid

    let handelchange = (e) => {
        let { name, type, value, checked } = e.target;
        setrawdata((pre) => ({ ...pre, [name]: type === 'checkbox' ? checked : value }))
    }

    let gg = (e) => {
        e.preventDefault();

        if (rawdata.saving_type === '1') {
            const personalcommittee = {
                committee_admin_id: committee_admin_details.userid,//i am sending with this in backend i will saperate this for member table (admin)
                committee_name: rawdata.committee_name,
                amount: rawdata.amount,
                start_date: rawdata.start_date,
                days_gap: rawdata.days_gap,
                deadline_day: rawdata.deadline_day,
                total_cycle: rawdata.total_cycle,
            }
            axios.post('http://localhost:8080/personal-committee', personalcommittee).then((res) => {
                if (res.data === 'Committee Created') {
                    setrawdata({
                        committee_name: "", amount: "", start_date: "",
                        days_gap: "", deadline_day: "", saveing_type: "2", total_cycle: "",
                        committee_type: "1", members_arrange_type: "2"
                    })
                    alert(res.data);
                    navigate('/lobby');
                }
                else {
                    alert('committee Not Created');
                    console.log(res.data);
                }
            })
        }
        else {



            let sharedcommittee = {
                admin_id: committee_admin_details.userid, //i am sending with this in backend i will saperate this for member table (admin)
                committee_name: rawdata.committee_name,
                amount: rawdata.amount,
                start_date: rawdata.start_date,
                days_gap: rawdata.days_gap,
                deadline_day: rawdata.deadline_day,
                committee_leaving_type: rawdata.committee_leaving_type,
                committee_type: rawdata.committee_type,
                members_arrange_type: rawdata.members_arrange_type
            }
            if (sharedcommittee.days_gap > sharedcommittee.deadline_day) {
                axios.post('http://localhost:8080/shared-committee', sharedcommittee).then((res) => {
                    if (res.data === 'Committee Created') {
                        setrawdata({
                            committee_name: "", amount: "", start_date: "",
                            days_gap: "", deadline_day: "", saveing_type: "2", total_cycle: "",
                            committee_type: "1", members_arrange_type: "2"
                        })
                        alert(res.data);
                        navigate('/lobby');
                    }
                    else {
                        alert('committee Not Created');
                        console.log(res.data);
                    }
                })
            }
            else {
                alert("Days Gap must be Greater then DeadLine Date");
            }

        }

    }

    return (
        <>
            <Navigation />
            <div className="sm:h-[90vh] flex flex-col justify-center items-center">
                <h1 className="font-medium text-2xl my-3">Create Committee</h1>
                <div className="outer-form px-2 py-4">
                    <form onSubmit={gg} className="inner-form grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <input name='committee_name' onChange={handelchange} className="inner-form-text-input" type='text' placeholder='Committee Name' required />
                        <input name='amount' onChange={handelchange} className="inner-form-text-input" type='text' placeholder='Amount' required />
                        <input name='start_date' onChange={handelchange} className="inner-form-text-input" type='date' placeholder='Start date' min={new Date().toISOString().split("T")[0]} required />
                        <input name='days_gap' onChange={handelchange} className="inner-form-text-input" type='number' placeholder='Days Gap' min={1} required />
                        <input name='deadline_day' onChange={handelchange} className="inner-form-text-input" type='number' placeholder='DeadLine At' min={0} required />
                        <div className="radio-div px-5  sm:row-span-2">
                            <div><h1 className="font-medium">Committee Saving Type</h1></div>
                            <div className="flex items-center">
                                <label>Personal(1person)</label>
                                <input type='radio' className="mt-1 mx-2" value='1' name='saving_type' onChange={handelchange} checked={rawdata.saving_type === '1'} />
                            </div>
                            <div className="flex items-center">
                                <label>Shared({'>'}1person)</label>
                                <input type='radio' className="mt-1 mx-2" value='2' name='saving_type' onChange={handelchange} checked={rawdata.saving_type === '2'} />
                            </div>
                        </div>
                        {
                            rawdata.saving_type === '1' && (<input className="inner-form-text-input" name='total_cycle' type='text' onChange={handelchange} placeholder='Total Cycle' />)
                        }
                        {
                            rawdata.saving_type === '2' && (
                                <>
                                    <select name='committee_leaving_type' value={rawdata.committee_leaving_type} onChange={handelchange} className="inner-form-text-input w-full">
                                        <option value='1'>1:if person leaves the committee.keep Amount of All Person Same</option>
                                        <option value='2'>2:if person leaves the committee.Devide the amount of Leaving Person to everyone</option>
                                    </select>

                                    <div className="bg-[#FED788] rounded-xl py-2">
                                        <h1 className="px-5 py-1 font-medium">
                                            {
                                                rawdata.committee_type === '1'
                                                    ? `Committee Type: Simple`
                                                    : rawdata.committee_type === '2'//if elseif else
                                                        ? `Committee Type: Bidding`
                                                        : `Committee Type: Spin`
                                            }
                                        </h1>
                                        <div className="committee-type">
                                            <div className="p-2 bg-[#61AB78] text-[#FEF2E5] hover:bg-[#539468]" onClick={() => { setrawdata((pre) => ({ ...pre, 'committee_type': "1" })) }}><AiFillLike />Simple</div>
                                            <div className="p-2 bg-[#FB9D57] text-[#FEF2E5] hover:bg-[#dd8a4a]" onClick={() => { setrawdata((pre) => ({ ...pre, 'committee_type': "2" })) }}><ImHammer2 />bidding</div>
                                            <div className="p-2 bg-[#D36556] text-[#FEF2E5] hover:bg-[#af5245]" onClick={() => { setrawdata((pre) => ({ ...pre, 'committee_type': "3" })) }}><LuFerrisWheel />Spin</div>
                                        </div>
                                    </div>

                                    <div className="radio-div px-5 ">
                                        <div><h1 className="font-medium">Arrange Members</h1></div>
                                        <div className="flex items-center">
                                            <label>Arrange by Admin</label>
                                            <input type='radio' className="mt-1 mx-6" name='members_arrange_type' value='1' onChange={handelchange} checked={rawdata.members_arrange_type === '1'} />
                                        </div>

                                        <div className="flex items-center">
                                            <label>Arrange by Alphabet</label>
                                            <input type='radio' className="mt-1 mx-2" name='members_arrange_type' value='2' onChange={handelchange} checked={rawdata.members_arrange_type === '2'} />
                                        </div>
                                    </div>
                                </>


                            )
                        }
                        <div className=" sm:col-span-2 flex justify-end px-2"><input className="bg-[#61AB78] p-2 rounded-2xl text" type='submit' value='+ Create' /></div>
                    </form>
                </div>
            </div>
        </>
    )
}
export default CreateKitty;
