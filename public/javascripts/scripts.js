

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

const changeQuantity=(cartId,proId,count)=>{
    $.ajax({
        url:'/change-product-quantity',
        data:{
            cart:cartId,
            product:proId,
            count:count
        },
        method:'post',
        success:(response)=>{
            alert(response)
        }
    })
}



