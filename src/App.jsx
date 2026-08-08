import Navbar from "./Components/Navbar/Navbar"
import { Routes, Route } from 'react-router-dom'
import Aside from './Components/Aside/Aside'
import { useNavigate } from 'react-router-dom'
import RegisterStore from './Components/RegisterStore/RegisterStore'
import RegisterUser from './Components/RegisterUser/RegisterUser'
import SearchRestaurant from "./Components/SearchRestaurant/SearchRestaurant"
import LoginStore from "./Components/LoginStore/LoginStore"
import LoginUser from './Components/LoginUser/LoginUser'
import { useState, useEffect } from "react"
function App() {
  const navigate = useNavigate()
  const [nextStep, setNextStep] = useState(false)
  const [nextStepLoginUser, setNextStepLoginUser] = useState(false)
  const [user, setUser] = useState(false)
  const [asideOrNavbarItems, setAsideOrNavbarItems] = useState(5)
  const [formDataAPI, setFormDataAPI] = useState({})
  useEffect(() => {
    async function checkSession() {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/store`, {
        credentials: "include"
      })

      const data = await response.json()

      if (data.Status) {
        setFormDataAPI(data)
        setNextStep(true)
      }
    }

    checkSession()
  }, [])
  useEffect(() => {
    const keyboard = (e) => {
      if (e.ctrlKey) {

        const number = Number(e.key)

        if (number >= 1 && number <= 5 && user == true) {
          e.preventDefault()
          setAsideOrNavbarItems(number)
          if (number === 1) {
            navigate('/')
          }
        }

      }
    }

    window.addEventListener('keydown', keyboard)

    return () => {
      window.removeEventListener('keydown', keyboard)
    }
  }, [user])
  useEffect(() => {
    setAsideOrNavbarItems(user ? 1:5)
  }, [user])
  return (
    <>
      <Navbar state={asideOrNavbarItems} setState={setAsideOrNavbarItems} user={user} />
      <Aside state={asideOrNavbarItems} setState={setAsideOrNavbarItems} user={user} />
      <Routes>
            <Route
                path="/"
                element={
                    <SearchRestaurant
                        state={asideOrNavbarItems}
                        setState={setAsideOrNavbarItems}
                    />
                }
            />

            <Route
                path="/restaurant/:restaurantId"
                element={
                    <SearchRestaurant
                        state={asideOrNavbarItems}
                        setState={setAsideOrNavbarItems}
                    />
                }
            />  
        </Routes>

      <RegisterStore state={asideOrNavbarItems} nextStepTwo={nextStep} formDataAPI={formDataAPI}
        setFormDataAPI={setFormDataAPI} />
      <RegisterUser nextStep={nextStepLoginUser} setNextStep={setNextStepLoginUser} user={user} setUser={setUser} state={asideOrNavbarItems} setState={setAsideOrNavbarItems} />
      <LoginStore state={asideOrNavbarItems} setNextStep={setNextStep} setState={setAsideOrNavbarItems} setFormDataAPI={setFormDataAPI} />
      <LoginUser nextStep={nextStepLoginUser} setNextStep={setNextStepLoginUser} user={user} setUser={setUser} state={asideOrNavbarItems} setNextStep={setNextStep} setState={setAsideOrNavbarItems} />
    </>
  )
}

export default App
