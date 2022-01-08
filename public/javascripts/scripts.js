
const viewImage = (event)=>{
    document.getElementById('imgView').src=URL.createObjectURL(event.target.files[0])    
}
 

const addToCart=(proId)=>{
    $.ajax({
        url:'/add-to-cart/'+proId,
        method:'get',
        success:(response)=>{
            if (response.status){
                let count = $('#cart-count').html()
                count = parseInt(count)+1
                $('#cart-count').html(count)
            }
        }
    })   
}

const changeQuantity=(cartId,proId,userId,count)=>{
    let quantity = parseInt(document.getElementById(proId).innerHTML)
    $.ajax({
        url:'/change-product-quantity',
        data:{
            cart:cartId,
            product:proId,
            count:count,
            user:userId,
            quantity:quantity
        },
        method:'post',
        success:(response)=>{
            if (response.removeProduct){
                alert("Product is Removed From Cart")
                location.reload()
            }else{
                document.getElementById(proId).innerHTML=quantity+count
                document.getElementById('totalsum').innerHTML=response.total
            }
            
        }
    })
}

const removeProduct = (cartId,proId)=>{
    $.ajax({
        url:'/cart-product-remove',
        data:{
            cart:cartId,
            product:proId
        },
        method:'post',
        success:(response)=>{
            if (response.status){
                alert("Product is Removed From Cart")
                location.reload()
            }
        }
    })
}

$("#checkout-form").submit((e)=>{
    e.preventDefault()
    $.ajax({
        url:'/place-order',
        method:'post',
        data:$('#checkout-form').serialize(),
        success:(response)=>{
            alert(response)
            if(response.codSuccess){
                location.href='/order-success'
            }else{
                razorpayPayment(response)
            }
        }

    })
})
const razorpayPayment = (order)=>{
    var options = {
        "key": "rzp_test_r5p0n7ioSfr096", // Enter the Key ID generated from the Dashboard
        "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "YOC",
        "description": "Test Transaction",
        "image": "",
        "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        "handler": function (response){
            alert(response.razorpay_payment_id);
            alert(response.razorpay_order_id);
            alert(response.razorpay_signature);

            verifyPayment(response,order);
        },
        "prefill": {
            "name": "Gaurav Kumar",
            "email": "gaurav.kumar@example.com",
            "contact": "9999999999"
        },
        "notes": {
            "address": "Razorpay Corporate Office"
        },
        "theme": {
            "color": "#3399cc"
        }
    };
    var rzp1 = new Razorpay(options);
    rzp1.open();

}
const verifyPayment = (payment,order)=>{ 
    $.ajax({
        url:'/verify-payment',
        data:{
           payment,
            order
        },
        method:'post'
    })
}


