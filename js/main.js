 const cartBtn=document.querySelector(".cart-btn");
 const closeCartBtn=document.querySelector(".close-cart");
 const clearCartBtn=document.querySelector(".clear-cart");
 const cartQuantity=document.querySelector(".cart-quantity");
 const removeItemBtn=document.querySelector(".remove-item");
 const itemQuantity=document.querySelector(".item-quantity");
 const quantityToggleDown=document.querySelector(".fa-chevron-down");
 const cartDOM=document.querySelector(".cart");
 const cartOverlay=document.querySelector(".cart-overlay");
 const productsDOM=document.querySelector(".products-center");
 const cartProductsDOM=document.querySelector(".cart-products")
 const quantityToggleUp=document.querySelector(".fa-chevron-up");
 const totalCost=document.querySelector(".total-price");

 let cart=[];
 let buttonsDOM=[];

 class Products{
     async getProducts(){
         try {
            let data= await fetch('/data/products.json');
            data= await data.json();
            data=data.items;
            let finalData=data.map((item)=>{
                const title=item.fields.title;
                const price=item.fields.price;
                const id=item.sys.id;
                const img=item.fields.image.fields.file.url;
                const fullData={
                    title,
                    price,
                    id,
                    img
                };
                return fullData;
            })
            return finalData;
         } catch (error) {
             console.log(error);
         }
     }
 } 
 class UI{
     displayProducts(products){
         products.forEach(product => {
            let newProductImg=document.createElement("img");
            newProductImg.src=product.img;
            
            let addCartButton=document.createElement('button');
            addCartButton.classList.add('bag-btn');
            addCartButton.setAttribute('data-id',product.id);
            addCartButton.innerText='Add to cart';
            
            let imgContainer=document.createElement('div');
            imgContainer.classList.add('img-container');
            imgContainer.appendChild(newProductImg);
            imgContainer.appendChild(addCartButton);
            
            let h3=document.createElement('h3');
            h3.innerText=product.title;
            let h4=document.createElement('h4');
            h4.innerText=product.price;

            let article=document.createElement('article');
            article.classList.add('product');
            article.appendChild(imgContainer);
            article.appendChild(h3);
            article.appendChild(h4);

            productsDOM.appendChild(article);
         });
     }
     getBagButtons(){
        const buttons=[...document.querySelectorAll(".bag-btn")];
        buttonsDOM=buttons;
        buttons.forEach((button)=>{
            let id=button.getAttribute('data-id');
            let inCart=cart.find(item=>item.id==id);
            if(inCart){
                button.innerText='in cart';
                button.disabled=true;
            }else{
                button.addEventListener('click',(e)=>{
                    e.target.innerText='in cart';
                    e.target.disabled=true;
                    let cartItem=Storage.getProducts(id);
                    cartItem.amount=1;
                    cart.push(cartItem);
                    Storage.saveCart(cart);
                    this.setCartValue();
                    this.displayCartItem(cartItem);
                    this.showCart();
                });
            }
        })
     }
     setCartValue(){
         let priceTotal=0;
         let itemsTotal=0;
         cart.forEach(cartItem=>{
             priceTotal+=cartItem.price*cartItem.amount;
             itemsTotal+=cartItem.amount;
         });
         cartQuantity.innerText=itemsTotal;
         totalCost.innerText=parseFloat(priceTotal).toFixed(2);
     }
     displayCartItem(cartItem){
         let div=document.createElement('div');
         div.classList.add('cart-product');
         div.innerHTML=
         `<img src="${cartItem.img}" alt="">
         <div class="product-description">
             <h4>${cartItem.title}</h4>
             <h5>$${cartItem.price}</h5>
             <button class="remove-item" data-id="${cartItem.id}">remove</button>
         </div>
         <div class="quantity-toggle">
             <i class="fas fa-chevron-up" data-id="${cartItem.id}"></i>
             <p class="item-quantity">${cartItem.amount}</p>
             <i class="fas fa-chevron-down" data-id="${cartItem.id}"></i>
         </div>`
         cartProductsDOM.appendChild(div);
     }
     showCart(){
         cartDOM.classList.add('visible-cart');
         cartOverlay.classList.add('visible-cart-overlay');
     }
     setupAPP(){
         cart=Storage.getCart();
         this.setCartValue();   
         this.populateCart();
         cartBtn.addEventListener('click',(e)=>{
             this.showCart();
         }) 
         closeCartBtn.addEventListener('click',(e)=>{
            cartDOM.classList.remove('visible-cart');
            cartOverlay.classList.remove('visible-cart-overlay');
         })
     }
     populateCart(){
         cart.forEach(cartItem=>{
             this.displayCartItem(cartItem);
         });

     }
     cartLogic(){
         //clear cart btn
         clearCartBtn.addEventListener('click',(e)=>{
             this.clearCart();
             while(cartProductsDOM.children.length>0){
                 cartProductsDOM.children[0].remove();
             }
         });
         cartProductsDOM.addEventListener('click',(e)=>{
             if(e.target.className=='remove-item'){
                 this.removeItem(e.target.getAttribute('data-id'));
                 e.target.parentNode.parentNode.remove();
             }else if(e.target.className=='fas fa-chevron-up'){
                 //increase amount in list
                 let targetItem=cart.find(item=> item.id==e.target.getAttribute('data-id'));
                 targetItem.amount++;
                 Storage.saveCart(cart);
                 //recount cost
                 this.setCartValue();
                 //change cart display
                 e.target.parentNode.children[1].innerText=targetItem.amount;
             }else if(e.target.className=='fas fa-chevron-down'){
                let targetItem=cart.find(item=> item.id==e.target.getAttribute('data-id'));
                 if(targetItem.amount==1){
                    this.removeItem(targetItem.id);
                    e.target.parentNode.parentNode.remove();
                 }else{
                    targetItem.amount--;
                    Storage.saveCart(cart);
                    //recount cost
                    this.setCartValue();
                    e.target.parentNode.children[1].innerText=targetItem.amount;
                 }

             };
         })
     }
     clearCart(){
        let cartIds=cart.map(item => {return item.id});
         cartIds.forEach(id=>{
             this.removeItem(id)
         })
     }

     removeItem(id){
        cart=cart.filter((item)=>{
            return item.id!==id;
        });
        Storage.saveCart(cart);
        this.setCartValue();

        let btn=buttonsDOM.find((thisBtn)=> thisBtn.getAttribute('data-id')==id);
        btn.innerText='Add to cart';
        btn.disabled=false;

     }
}



 class Storage{
     static saveData(products){
         localStorage.setItem('products',JSON.stringify(products));
     }
     static getProducts(id){
        let products=JSON.parse(localStorage.getItem('products'));
        return products.find(product=> product.id==id);
    }
    static saveCart(cart){
        localStorage.setItem('cart',JSON.stringify(cart));
    }
    static getCart(){
        let localCart=localStorage.getItem('cart');
        if(localCart==null){
            return [];
        }else{
            return JSON.parse(localCart);
        }
    }
}

 document.addEventListener("DOMContentLoaded",function(){
     const ui=new UI();
     const products=new Products();
     ui.setupAPP();
     const data=products.getProducts().then(thisData=>{
         ui.displayProducts(thisData);
         Storage.saveData(thisData);
     }).then(()=>{
        ui.getBagButtons();
        ui.cartLogic();
     });
 });