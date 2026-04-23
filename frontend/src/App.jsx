import { useState,useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {Routes,Route,Links} from 'react-router-dom'
import Login from './pages/login/Login.jsx'
import Lobby from './pages/lobby/Lobby.jsx'
import SignUp from './pages/signup/SignUp.jsx'
import Profile from './pages/profile/Profile.jsx'
import CreateCommittee from './pages/create committee/CreateCommittee.jsx'
import JoinCommittee from './pages/join committee/JoinCommittee.jsx'
import Invitemember from './pages/invite members/invitemember.jsx'
import CommitteeDetails from './pages/committee details/CommitteeDetails.jsx'
import Notification from './pages/notification/Notification.jsx'
import TransferAdmin from './pages/transfer admin/TransferAdmin.jsx'
import Bidding from './pages/bidding/Bidding.jsx'
import AdminCommitteeDetails from './pages/admin committee details/AdminCommitteeDetails.jsx'
import Payment from './pages/payment/Payment.jsx'
import PersonalCommittee from './pages/personal committees/PersonalCommittee.jsx'
function App() {
  return (
    <>
    <Routes>
      <Route path='/' element={<Login/>}/>
      <Route path='/lobby' element={<Lobby/>}/>
      <Route path="/signup" element={<SignUp/>}/>
      <Route path='/profile' element={<Profile/>}/>
      <Route path='/create-committee' element={<CreateCommittee/>}/>
      <Route path='/join-committee' element={<JoinCommittee/>}/>
      <Route path='/invite-member' element={<Invitemember/>}/>
      <Route path='/committee-details' element={<CommitteeDetails/>}/>
      <Route path='/notification' element={<Notification/>}/>
      <Route path='/transfer-admin' element={<TransferAdmin/>}/>
      <Route path='/bidding' element={<Bidding/>}/>
      <Route path='/admin-committee-details' element={<AdminCommitteeDetails/>}/>
      <Route path='/payment'element={<Payment/>}/>
      <Route path='/Personal-committee' element={<PersonalCommittee/>}/>
    </Routes>
    </>
  )
}

export default App
