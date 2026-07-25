
const inputs = [
    {
        id:1,
        name:'orderName',
        label:'Name',
        placeholder:'Enter order name',
        type:'text',
        minLength:5,
        maxLength:100
    },
    {
        id:2,
        name:'orderDescription',    
        placeholder:'Enter description',
        type:'text',
        minLength:5,
        label:'Description',
        maxLength:500
    },
    {
        id:3,
        name:'image_orders',
        placeholder:'Enter Image',
        type:'file',
        label:'Image',
        accept:'image/*',
        minLength:50,    
        maxLength:255
    },
    {
        id:4,
        name:'orderPrice',
        placeholder:'Enter the price',
        type:'number',
        label:'Price',
        minLength:5,
        maxLength:100
    },
]
export default inputs