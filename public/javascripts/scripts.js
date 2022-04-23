

// const viewImage = (event)=>{
//     document.getElementById('imgView').src=URL.createObjectURL(event.target.files[0])    
// }



// const addToCart=(proId)=>{
//     $.ajax({
//         url:'/add-to-cart/'+proId,
//         method:'get',
//         success:(response)=>{
//             if (response.status){
//                 let count = $('#cart-count').html()
//                 count = parseInt(count)+1
//                 $('#cart-count').html(count)
//             }
//         }
//     })   
// }
const addToCart=(proId)=>{
    
    let proSize=document.getElementById('size').value;
    $.ajax({
        url:'/add-to-cart',
        data:{
            product:proId,
            size:proSize      
        },
        method:'get',
        success:(response)=>{
            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Added To The Cart',
                showConfirmButton: false,
                timer: 1500
              })
            if (response.status){
                let count = $('#cart-count').html()
                count = parseInt(count)+1
                $('#cart-count').html(count)
            }
        }
    })   
}

const addToWhishlist=(proId)=>{
        $.ajax({
            url:'/add-to-whishlist',
            data:{
                product:proId
            },
            method:'get',
            success:(response)=>{
                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: 'Added To The Wish',
                    showConfirmButton: false,
                    timer: 1500
                  })
                if (response.status){
                    let count = $('#whishlist-count').html()
                    count = parseInt(count)+1
                    $('#whishlist-count').html(count)
                }
            }
        })   
    }

const changeQuantity=(cartId,proId,userId,count)=>{
    console.log(cartId,proId,userId,count);
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
                document.getElementById('totalCart').innerHTML=response.total
                document.getElementById('totalsum').innerHTML=response.total
            }
            
        }
    })
}
  
const removeProduct = (cartId,proId)=>{
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url:'/cart-product-remove',
                data:{
                    cart:cartId,
                    product:proId
                },
                method:'post',
                success:(response)=>{
                    if (response.status){
                        location.reload()
                    }
                }
            })
          
        }
      })

    // $.ajax({
    //     url:'/cart-product-remove',
    //     data:{
    //         cart:cartId,
    //         product:proId
    //     },
    //     method:'post',
    //     success:(response)=>{
    //         if (response.status){
    //             alert("Product is Removed From Cart")
    //             location.reload()
    //         }
    //     }
    // })
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
// $("#checkout-form").submit((e)=>{
//     e.preventDefault()
//     $.ajax({
//         url:'/place-order',
//         method:'post',
//         data:$('#checkout-form').serialize(),
//         success:(response)=>{
//             alert(response)
//             if(response.codSuccess){
//                 location.href='/order-success'
//             }else{
//                 razorpayPayment(response)
//             }
//         }

//     })
// })
const razorpayPayment = (order)=>{
    var options = {
        "key": "rzp_test_r5p0n7ioSfr096", // Enter the Key ID generated from the Dashboard
        "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "YOK",
        "description": "Test Transaction",
        "image": "",
        "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        "handler": function (response){
            // alert(response.razorpay_payment_id);/
            // alert(response.razorpay_order_id);
            // alert(response.razorpay_signature);

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
        method:'post',
        success:(response)=>{
            if (response.status){
                location.href='/order-success'
            }else{
                alert("Payment Failed")
            }
        }
     
    })
}



