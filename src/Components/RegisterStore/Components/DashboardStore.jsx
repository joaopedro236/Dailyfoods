import './DashboardStore.css'
import { useMediaQuery } from "react-responsive";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import iconBuy from '../../../assets/Icons/icons8-compras-do-saco-cheio-48.png'
import iconDollar from '../../../assets/Icons/icons8-dólar-64.png'
import iconNote from '../../../assets/Icons/icons8-nota-50.png'
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
                <h1 className='text-[19px]'>
                    {props.formDataAPIName === 'invoicing'
                        ? Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                        }).format(props.formDataAPI?.[props.formDataAPIName] ?? 0)
                        : props.formDataAPI?.[props.formDataAPIName] ?? 0}
                </h1>
                <p className='text-[12.5px]'>{props.title}</p>
            </div>
        </>
    )
}
export default function DashboardStore({ formDataAPI, state, setFormDataAPI, nextStep, setNextStep, previewImage, setPreviewImage, onImageSelect }) {
    const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const rawHistory = formDataAPI?.invoicing_history;
    const chartData = (() => {
        const fallback = weekDays.map((day) => ({ day, invoicing: 0 }));

        if (Array.isArray(rawHistory)) {
            return rawHistory.map((value, index) => ({
                day: weekDays[index] || `Day ${index + 1}`,
                invoicing: Number(value ?? 0)
            }));
        }


        if (typeof rawHistory === 'string') {
            try {
                const parsed = JSON.parse(rawHistory);
                if (Array.isArray(parsed)) {
                    return parsed.map((value, index) => ({
                        day: weekDays[index] || `Day ${index + 1}`,
                        invoicing: Number(value ?? 0)
                    }));
                }
            } catch (error) {
                console.error(error);
            }
        }

        return fallback;
    })();
    const [ordersSectionActive, setOrdersSectionActive] = useState(false)
    const isMobile = useMediaQuery({ maxWidth: 768 });
    const [inputFileActive, setInputFileActive] = useState(false)
    const currentImage = previewImage || formDataAPI?.image || photoHidden
    const APIURL = import.meta.env.VITE_API_URL
    const handlePhotoChange = async (event) => {
        const file = event.target.files?.[0] ?? null
        if (!file) return

        const formData = new FormData()
        formData.append("image", file)

        try {
            const response = await fetch(`${APIURL}/api/store/image`, {
                method: "PUT",
                credentials: "include",
                body: formData,
            })

            const data = await response.json()

            if (!response.ok || !data.Status) {
                throw new Error(data.Error || `Request error: ${response.status}`)
            }

            onImageSelect(file)

            if (data.image) {
                setFormDataAPI(prev => ({
                    ...prev,
                    image: data.image
                }))
            }

        } catch (error) {
            console.error(error)
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
            if (!response_updateMetrics.ok) {
                throw new Error(`Request error: ${response_updateMetrics.status}`);
            }
            const data_updateMetrics = await response_updateMetrics.json()
            if (!data_updateMetrics.Status) {
                throw new Error(data_updateMetrics.Error);
            }

            setFormDataAPI(prev => ({
                ...prev,
                orders: data_updateMetrics.orders,
                invoicing_history: data_updateMetrics.invoicing_history
            }));

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
            const savedToken = localStorage.getItem('restaurant_session_token')
            const responseOrders = await fetch(`${APIURL}/orders_items${savedToken ? `?restaurant_session_token=${encodeURIComponent(savedToken)}` : ''}`, {
                credentials: 'include'
            })
            const jsonOrders = await responseOrders.json()
            const orders = jsonOrders.orders || [];

            setOrdersForm(orders);

            setFormDataAPI(prev => ({
                ...prev,
                orders: orders.length
            }));

        } catch (error) {
            console.error(error)
        }
    }
    useEffect(() => {
        ordersMetrics()
    }, [])
    const [orderCardActive, setOrderCardActive] = useState(-1)
    const showOrdersSection = nextStep === true && state === 2;
    const addMoney = async () => {
        try {
            const responseMoney = await fetch(`${APIURL}/addMoney`, {
                method: 'POST',
                credentials: 'include'
            })
            if (!responseMoney) {
                throw new Error(`Request error: ${responseMoney.status}`);
            }
            const dataMoney = await responseMoney.json()
            if (!dataMoney.Status) {
                throw new Error(dataMoney.Error || 'Could not add money');
            }


            setFormDataAPI(prev => ({
                ...prev,
                invoicing: dataMoney.result,
                invoicing_history: (() => {
                    const history = [...(prev.invoicing_history || [])];
                    const today = new Date().getDay();
                    const index = today === 0 ? 6 : today - 1;

                    history[index] = dataMoney.result;

                    return history;
                })()
            }));
        } catch (error) {
            console.error(error)
        }
    }
    const [imageInfo, setImageInfo] = useState(null)

    const handleImage = (e) => {
        const file = e.target.files[0]

        if (!file) return

        const img = new Image()

        img.onload = () => {
            const sizeMB = file.size / 1024 / 1024

            if (
                file.type === 'image/jpeg' &&
                sizeMB <= 5 &&
                img.width <= 2000 &&
                img.height <= 2000
            ) {
            } else {
                alert('Image invalid!')
            }

            URL.revokeObjectURL(img.src)
        }

        img.src = URL.createObjectURL(file)

    }
    return (
        <>
            <section className={`dashboardStore ${nextStep == true && state == 2 && ordersSectionActive == false ? 'flex' : 'hidden'} w-full flex-col`}>
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

                    <div className={`orderCheckout px-3 ${showOrdersSection ? 'flex' : 'hidden'} flex-col w-full max-w-[400px] items-center justify-center gap-5`}>
                        <header className='w-full flex items-center justify-center'>
                            <h1>{ordersForm.length > 0 ? 'Menu' : 'Create Menu'}</h1>
                        </header>
                        <div className="orderCheckoutContent w-full flex items-center justify-center flex-col gap-3">
                            <button className='w-full text-white p-3 rounded-lg' onClick={() => setOrdersSectionActive(true)}>
                                {ordersForm.length > 0 ? 'Add order' : 'Create Menu'}
                            </button>
                            {ordersForm.length === 0 && <p className='text-red-600 text-xs'>*You don't have menu items yet.</p>}
                        </div>
                    </div>
                    <div className={`orders ${showOrdersSection ? 'flex' : 'hidden'} mt-2 flex-col w-full gap-2.5 p-3`}>
                        <div className="ordersContent overflow-y-auto flex mt-5 h-[250px] flex-col w-full bg-white p-3 pt-1 max-w-[450px] m-auto rounded-lg gap-2">
                            <header className='flex flex-col p-3 justify-center items-center text-center'>
                                <h1>Menu</h1>
                            </header>
                            {ordersForm.length === 0 ? (
                                <p className='text-center text-sm text-gray-500 py-4'>No orders yet.</p>
                            ) : ordersForm.map((ordersFormMap, index) => (
                                <div className={`orderCard flex cursor-pointer items-center p-3 rounded-lg gap-5 ${orderCardActive === index ? 'flex-col opacity-100! items-start gap-0' : ''}`} key={index} onClick={() => setOrderCardActive(orderCardActive === index ? -1 : index)}>
                                    <header className='flex gap-3 items-center'>
                                        <img src={ordersFormMap.image} alt="order image" className='w-[60px] rounded-lg' />
                                        <h2 className={`${orderCardActive === index ? 'text-[17px]' : ''}`}>{ordersFormMap.name}</h2>
                                    </header>
                                    <p className={`text-[16px] ${orderCardActive === index ? 'flex' : 'hidden'}`}>{ordersFormMap.description}</p>
                                    <p className={`text-sm ${orderCardActive === index ? 'text-left ml-0' : 'ml-auto text-right'}`}>{Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(ordersFormMap?.price ?? 0)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="comments_dashboard flex  flex-col min-h-[250px] gap-3 p-3  w-full  m-auto rounded-lg bg-white max-w-[450px]">
                        <header className='mx-auto'>
                            <h1>Comments</h1>
                        </header>
                        <div className="grid grid-cols-2 gap-2 justify-items-center">
                            {formDataAPI?.restaurantComments?.length > 0 ? (
                                formDataAPI.restaurantComments.map((comment, index) => (
                                    <div
                                        key={index}
                                        className="comment_dashboard flex flex-col gap-2"
                                    >
                                        <p>{comment || 'None'}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-2 flex w-full items-center justify-center">
                                    <p>None</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="addMoney flex flex-col h-[200px] gap-5 p-3 w-full m-auto rounded-lg  max-w-[450px]">
                        <header className='mx-auto'>
                            <h1>To Add Money</h1>
                        </header>
                        <button className='text-white w-full rounded-lg p-4' onClick={addMoney}>To Add</button>
                    </div>
                </div>
            </section >
            <Orders stateSection={state}
                setOrdersSectionActive={setOrdersSectionActive}
                OrdersSectionActive={ordersSectionActive}
                ordersMetrics={ordersMetrics}
            />
        </>
    )
}