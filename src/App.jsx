import Navbar from "./Components/Navbar/Navbar"
import Aside from './Components/Aside/Aside'
import RegisterStore from './Components/RegisterStore/RegisterStore'
import Login from './Components/RegisterUser/RegisterUser'
import SearchRestaurant from "./Components/SearchRestaurant/SearchRestaurant"
import LoginStore from "./Components/LoginStore/LoginStore"
import { useState, useEffect } from "react"
function App() {
  const [nextStep, setNextStep] = useState(false)
  const [asideOrNavbarItems, setAsideOrNavbarItems] = useState(1)
  useEffect(() => {
    const keyboard = (e) => {
        if(e.ctrlKey){

            const number = Number(e.key)

            if(number >= 1 && number <= 5){
                e.preventDefault()
                setAsideOrNavbarItems(number)
            }

        }
    }

    window.addEventListener('keydown', keyboard)

    return () => {
        window.removeEventListener('keydown', keyboard)
    }

},[])
  return (
    <>
      <Navbar state={asideOrNavbarItems} setState={setAsideOrNavbarItems}/>
      <Aside state={asideOrNavbarItems} setState={setAsideOrNavbarItems}/>
      <SearchRestaurant state={asideOrNavbarItems} setState={setAsideOrNavbarItems}/>
      <RegisterStore state={asideOrNavbarItems}  nextStepTwo={nextStep}/>
      <Login state={asideOrNavbarItems} setState={setAsideOrNavbarItems}/>
      <LoginStore state={asideOrNavbarItems} setNextStep={setNextStep} setState={setAsideOrNavbarItems}/>
    </>
  )
}

export default App
