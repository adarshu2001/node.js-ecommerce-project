
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



