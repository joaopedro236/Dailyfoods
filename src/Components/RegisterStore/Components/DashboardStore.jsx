import './DashboardStore.css'
import { useMediaQuery } from "react-responsive";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import iconBuy from '../../../assets/Icons/icons8-compras-do-saco-cheio-48.png'
import iconDolar from '../../../assets/Icons/icons8-dólar-64.png'
import iconPurchaseCompleted from '../../../assets/Icons/icons8-logística-64.png'
import iconTime from '../../../assets/Icons/icons8-cronômetro-66.png'
import photoHidden from '../../../assets/Photos/219eaea67aafa864db091919ce3f5d82.jpg'
import { useState } from 'react';
function Card_DashboardStore(props) {
    return (
        <>
            <div className="card_dashboardStore flex p-4 rounded-[10px] h-[140px] max-w-[180px] flex-col w-full  items-center justify-center gap-1">
                <img src={props.icon} alt="icon card" className='w-full max-w-[47px] p-2.5 rounded-full' style={{ backgroundColor: props.color }} />
                <h1 className='text-[19px]'>{Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2, }).format(props.formDataAPI?.[props.formDataAPIName] ?? 0)}</h1>

                <p className='text-[12.5px]'>{props.title}</p>
            </div>
        </>
    )
}
export default function DashboardStore({ formDataAPI, state, setFormDataAPI, nextStep, setNextStep, previewImage, setPreviewImage, onImageSelect }) {
    const total = (formDataAPI?.invoicing_history ?? []).reduce(
        (acc, value) => acc + value,
        0
    );


    const chartData = formDataAPI?.invoicing_history?.map((value, index) => ({
        day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index],
        invoicing: value,
        total: total
    }));
    const isMobile = useMediaQuery({ maxWidth: 768 });
    const [inputFileActive, setInputFileActive] = useState(false)
    const currentImage = previewImage || formDataAPI?.image || photoHidden

    const handlePhotoChange = async (event) => {
        const APIURL = import.meta.env.VITE_API_URL
        const file = event.target.files?.[0] ?? null
        if (!file) return

        const formData = new FormData()

        formData.append("image", file);
        formData.append("name", formDataAPI.name);
        formData.append("CNPJ", formDataAPI.CNPJ);
        formData.append("CEP", formDataAPI.CEP);

        try {
            const response = await fetch(`${APIURL}/api/registerStore`, {
                method: "POST",
                credentials: 'include',
                body: formData,
            });
            const data = await response.json();
            if (!response.ok) {
                console.log(data)
                return
            }
            onImageSelect(file);
            if (data.image) {
                setFormDataAPI(prev => ({
                    ...prev,
                    image: data.image
                }));
            }
        } catch (error) {
            console.error(error);
        }

        event.target.value = ''

    }

    return (
        <>
            <section className={`dashboardStore ${nextStep == true && state == 3 ? 'flex' : 'hidden'} w-full flex-col`}>
                <header className='headerDashboardStore w-full text-white p-4 pt-7 flex flex-col items-center justify-center'>
                    <img src={currentImage} alt="photo hidden" className='cursor-pointer w-[110px] h-[110px] object-cover rounded-full' onClick={() => setInputFileActive(prev => !prev)} />
                    <h1 className='text-lg mt-2'>{formDataAPI?.name}</h1>
                    <p className='text-gray-300 text-sm'>Welcome to your dashboard</p>
                    <label
                        htmlFor="inputPhoto"
                        className={`w-full h-[50px] bg-white mt-3 text-black rounded-[10px] ${inputFileActive ? 'flex' : 'hidden'} items-center justify-center cursor-pointer `}
                    >
                        Escolher foto
                    </label>
                    <input type="file" id='inputPhoto' accept='image/*' onChange={handlePhotoChange} className='w-full h-[50px] bg-white  text-black z-10 rounded-[10px] hidden text-center items-center justify-center z-10 cursor-pointer' />
                </header>
                <div className="dashboardStoreContent flex flex-col  gap-1">
                    <div className="cards_dashboardStore p-3 mt-3 flex flex-col gap-3 justify-center items-center">
                        <header className='flex items-center justify-center'>
                            <h1 className='text-sm'>Day's summary</h1>
                        </header>
                        <div className="cardsContent_dashboardStore flex flex-wrap gap-2 p-2 items-center justify-center">
                            <Card_DashboardStore title='Orders' formDataAPI={formDataAPI} icon={iconBuy} formDataAPIName='orders' color='#c01e2f' />
                            <Card_DashboardStore title='Invoicing' formDataAPI={formDataAPI} icon={iconDolar} formDataAPIName='invoicing' color='#2DB16B' />
                            <Card_DashboardStore title='Completed' formDataAPI={formDataAPI} icon={iconPurchaseCompleted} formDataAPIName='completed' color='#ed7708' />
                            <Card_DashboardStore title='Progress' formDataAPI={formDataAPI} icon={iconTime} formDataAPIName='progress' color='#9754B7' />
                            <Card_DashboardStore title='Full billing' formDataAPI={chartData} icon={iconDolar} formDataAPIName='total' color='#2DB16B' />
                        </div>
                    </div>
                    <div className="table_dashboardStore w-full  h-[300px] flex  gap-3 overflow-hidden px-2 flex-col">
                        <header className='w-full px-2 flex rounded-lg items-center justify-between '>
                            <h1>Performance</h1>
                            <p className='text-sm'>7 days</p>
                        </header>
                        <ResponsiveContainer width="100%" height='100%'  >
                            <LineChart
                                style={{ cursor: 'pointer' }}
                                data={chartData}
                                margin={{
                                    top: 10,
                                    right: 10,
                                       left: -20,
                                    bottom: 0,
                                }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="day" niceTicks="snap125" style={{ fontSize: isMobile ? 11 : 14 }} interval={0} />
                                <YAxis width="40" niceTicks="snap125" style={{ fontSize: isMobile ? 11 : 14 }} dataKey="invoicing" />
                                <Tooltip />
                                <Line type="monotone" dataKey="invoicing" stroke="var(--primary-red)" strokeWidth={3} />

                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>-
            </section>
        </>
    )
}