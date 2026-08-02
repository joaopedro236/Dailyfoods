import './DashboardStore.css'
import { useMediaQuery } from "react-responsive";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import iconBuy from '../../../assets/Icons/icons8-compras-do-saco-cheio-48.png'
import iconDollar from '../../../assets/Icons/icons8-dólar-64.png'
import Orders from './Orders/Orders'
import iconPurchaseCompleted from '../../../assets/Icons/icons8-logística-64.png'
import iconTime from '../../../assets/Icons/icons8-cronômetro-66.png'
import photoHidden from '../../../assets/Photos/219eaea67aafa864db091919ce3f5d82.jpg'
import { useState, useEffect } from 'react';
function Card_DashboardStore(props) {
    return (
        <>
            <div className="card_dashboardStore flex p-4 rounded-[10px] h-[140px] max-w-[170px] flex-col w-full  items-center justify-center gap-1">
                <img src={props.icon} alt="icon card" className='w-full max-w-[47px] p-2.5 rounded-full' style={{ backgroundColor: props.color }} />
                <h1 className='text-[19px]'>{Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2, }).format(props.formDataAPI?.[props.formDataAPIName] ?? 0)}</h1>

                <p className='text-[12.5px]'>{props.title}</p>
            </div>
        </>
    )
}
export default function DashboardStore({ formDataAPI, state, setFormDataAPI, nextStep, setNextStep, previewImage, setPreviewImage, onImageSelect }) {
    const chartData = formDataAPI?.invoicing_history?.map((value, index) => ({
        day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index],
        invoicing: value
    }));
    const [ordersSectionActive, setOrdersSectionActive] = useState(false)
    const isMobile = useMediaQuery({ maxWidth: 768 });
    const [inputFileActive, setInputFileActive] = useState(false)
    const currentImage = previewImage || formDataAPI?.image || photoHidden
    const APIURL = import.meta.env.VITE_API_URL
    const handlePhotoChange = async (event) => {
        const file = event.target.files?.[0] ?? null
        if (!file) return

        const formData = new FormData()

        formData.append("image", file);
        formData.append("name", formDataAPI.name);
        formData.append("CNPJ", formDataAPI.CNPJ);
        formData.append("CEP", formDataAPI.CEP);
        formData.append("orders", formDataAPI.orders)
        formData.append("completed", formDataAPI.completed)
        formData.append("progress", formDataAPI.progress)
        try {
            const response = await fetch(`${APIURL}/api/registerStore`, {
                method: "POST",
                credentials: 'include',
                body: formData,
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(`Request error: ${response.status}`);
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

    const updateMetrics = async () => {
        try {
            const response_updateMetrics = await fetch(`${APIURL}/api/store/metrics`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: formDataAPI.name || 'Restaurant',
                    CNPJ: formDataAPI.CNPJ || '',
                    CEP: formDataAPI.CEP || '00000-000',
                    invoicing: Number(formDataAPI.invoicing || 0),
                    invoicing_history: formDataAPI.invoicing_history || [0, 0, 0, 0, 0, 0, 0],
                    orders: Number(formDataAPI.orders || 0),
                    completed: Number(formDataAPI.completed || 0),
                    progress: Number(formDataAPI.progress || 0),
                    image: formDataAPI.image || '',
                    password: formDataAPI.password || '',
                }),
            })
            if (!response_updateMetrics) {
                throw new Error(`Request error: ${response_updateMetrics.status}`);
            }
            const data_updateMetrics = await response_updateMetrics.json()


        } catch (error) {
            console.error(error)
        }
    }
    useEffect(() => {
        if (!formDataAPI?.CNPJ) return;

        updateMetrics();
        const interval = setInterval(() => {
            updateMetrics()
        }, 50000);
        return () => clearInterval(interval)
    }, [formDataAPI?.CNPJ]);
    const [ordersForm, setOrdersForm] = useState([])
    const ordersMetrics = async () => {
        try {
            const responseOrders = await fetch(`${APIURL}/orders_items`, {
                credentials: 'include'
            })
            if (!responseOrders) {
                throw new Error(`Request error: ${responseOrders.status}`);
            }
            const jsonOrders = await responseOrders.json()
            setOrdersForm(jsonOrders.orders || [])
        } catch (error) {
            console.error(error)
        }
    }
    useEffect(() => {
        ordersMetrics()
    }, [])
    const [orderCardActive, setOrderCardActive] = useState(-1)
    return (
        <>
            <section className={`dashboardStore ${nextStep == true && state == 3 && ordersSectionActive == false ? 'flex' : 'hidden'} w-full flex-col`}>
                <header className='headerDashboardStore w-full text-white p-4 pt-7 flex flex-col items-center justify-center'>
                    <img src={currentImage} alt="photo hidden" className='cursor-pointer w-[110px] h-[110px] object-cover rounded-full' onClick={() => setInputFileActive(prev => !prev)} />
                    <h1 className='text-lg mt-2'>{formDataAPI?.name}</h1>
                    <p className='text-gray-300 text-sm'>Welcome to your dashboard</p>
                    <label
                        htmlFor="inputPhoto"
                        className={`w-full h-[50px] bg-white mt-3 text-black rounded-[10px] ${inputFileActive ? 'flex' : 'hidden'} items-center justify-center cursor-pointer `}
                    >
                        Choose photo
                    </label>
                    <input type="file" id='inputPhoto' accept='image/*' onChange={handlePhotoChange} className='w-full h-[50px] bg-white  text-black z-10 rounded-[10px] hidden text-center items-center justify-center z-10 cursor-pointer' />
                </header>
                <div className="dashboardStoreContent flex flex-col  gap-1">
                    <div className="cards_dashboardStore p-3 mt-3 flex flex-col gap-3 justify-center items-center">
                        <header className='flex items-center justify-center'>
                            <h1 >Day's summary</h1>
                        </header>
                        <div className="cardsContent_dashboardStore flex flex-wrap gap-2 p-2 items-center justify-center">
                            <Card_DashboardStore title='Orders' formDataAPI={formDataAPI} icon={iconBuy} formDataAPIName='orders' color='#c01e2f' />
                            <Card_DashboardStore title='Invoicing' formDataAPI={formDataAPI} icon={iconDollar} formDataAPIName='invoicing' color='#2DB16B' />
                            <Card_DashboardStore title='Completed' formDataAPI={formDataAPI} icon={iconPurchaseCompleted} formDataAPIName='completed' color='#ed7708' />
                            <Card_DashboardStore title='Progress' formDataAPI={formDataAPI} icon={iconTime} formDataAPIName='progress' color='#9754B7' />
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

                    <div className={`orderCheckout px-3 ${formDataAPI?.orderExists == false ? 'flex' : 'hidden'}   flex-col w-full  max-w-[400px] items-center justify-center gap-5`}>
                        <header className='w-full flex items-center justify-center'>
                            <h1>Create Menu</h1>
                        </header>
                        <div className="orderCheckoutContent w-full  flex items-center justify-center flex-col gap-3">
                            <button className='w-full text-white p-3 rounded-lg' onClick={() => setOrdersSectionActive(true)}
                            >Create Menu</button>
                            <p className='text-red-600 text-xs'>*Unfortunately, you don't have a menu.</p>
                        </div>
                    </div>
                    <div className={`orderCheckout px-4 py-6 ${formDataAPI?.orderExists == true ? 'flex' : 'hidden'}  bg-white  flex-col w-full  max-w-[400px] items-center justify-center rounded-lg gap-3`}>
                        <header className='w-full flex items-center justify-center'>
                            <h1>Add order</h1>
                        </header>
                        <div className="orderCheckoutContent w-full  flex items-center justify-center flex-col gap-3">
                            <button className='w-full text-white p-3 rounded-lg' onClick={() => setOrdersSectionActive(true)}
                            >Add order</button>
                        </div>
                    </div>
                    <div className={`orders ${formDataAPI?.orderExists == true ? 'flex' : 'hidden'} mt-2 flex-col w-full  gap-2.5 p-3`}>
                        <div className="ordersContent overflow-y-auto flex mt-5 h-[250px] flex-col w-full bg-white p-3 pt-1 max-w-[450px] m-auto rounded-lg gap-2">
                            <header className='flex flex-col p-3 justify-center items-center text-center'>
                                <h1>Menu</h1>
                            </header>
                            {
                                ordersForm.map((ordersFormMap, index) => (
                                    <div className={`orderCard  flex cursor-pointer items-center p-3  rounded-lg gap-5 ${orderCardActive === index ? 'flex-col opacity-100!  items-start gap-0' : ''}`} key={index} onClick={() => setOrderCardActive(orderCardActive === index ? -1 : index)}>
                                        <header className={`flex gap-3 items-center `}>
                                            <img src={ordersFormMap.image} alt="order image" className='w-[60px] rounded-lg' />
                                            <h2 className={`${orderCardActive === index ? 'text-[17px]' : ''}`}>{ordersFormMap.name}</h2>
                                        </header>
                                        <p className={`text-[16px] ${orderCardActive === index ? 'flex' : 'hidden'}`}>{ordersFormMap.description}</p>
                                        <p className={` text-sm ${orderCardActive === index ? 'text-left ml-0' : 'ml-auto text-right'}`}>{Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2, }).format(ordersFormMap?.price ?? 0)}</p>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </section>
            <Orders stateSection={state}
                setOrdersSectionActive={setOrdersSectionActive}
                OrdersSectionActive={ordersSectionActive}
                ordersMetrics={ordersMetrics}
            />
        </>
    )
}
