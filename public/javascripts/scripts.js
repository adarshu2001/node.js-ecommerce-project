

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


