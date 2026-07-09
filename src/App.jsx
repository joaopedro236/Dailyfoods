import Navbar from "./Components/Navbar/Navbar"
import Aside from './Components/Aside/Aside'
import RegisterStore from './Components/RegisterStore/RegisterStore'
import Login from './Components/RegisterUser/RegisterUser'
import { useState } from "react"
function App() {
  const [asideOrNavbarItems, setAsideOrNavbarItems] = useState(1)
  return (
    <>
      <Navbar state={asideOrNavbarItems} setState={setAsideOrNavbarItems}/>
      <Aside state={asideOrNavbarItems} setState={setAsideOrNavbarItems}/>
      <RegisterStore state={asideOrNavbarItems} setState={setAsideOrNavbarItems}/>
      <Login state={asideOrNavbarItems} setState={setAsideOrNavbarItems}/>
    </>
  )
}

export default App
