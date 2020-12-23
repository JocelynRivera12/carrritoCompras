
const fs = require('fs');
const express = require('express');
const app = express();
const port = 3000;

app.listen(port, () => {
    console.log('It´s ok');
})

app.get('/datos/:filter/:keyword', (req, res) => {
    let filter = req.params.filter;
    let keyword = req.params.keyword;
    let baseDato = fs.readFileSync('./datos.txt', 'utf8');

    let baseProduct = JSON.parse(baseDato);
    let queryRes = baseProduct.filter(product => product[filter] === keyword);

    res.send(queryRes);
})

//muestra datos almacenados en la base de datos
app.get('/datos', (req, res) => {
    let baseDato = fs.readFileSync('./datos.txt', 'utf8');
    let baseProduct = JSON.parse(baseDato);
    res.send(baseProduct);
})

//muestra productos que se encuentran en el carrito 
app.get('/carrito', (req, res) => {
    let datoCar = fs.readFileSync('./carrito.txt', 'utf8');
    
    let productCar = JSON.parse(datoCar);
    res.send(productCar);
})

//elimina articulos o productos del carrito 
app.delete('/carrito', (req, res) => {
    fs.writeFileSync('./carrito.txt', '[]');
    res.send('Tu carrito está vacio');
})

//post me permite añadir los productos desedos al carrito 

app.post('/carrito/products/:product', (req, res) => {
    let datoCar = fs.readFileSync('./carrito.txt', 'utf8');
    let productCar = JSON.parse(datoCar);
    
    let nuevoArt = JSON.parse(req.params.product);
    const index = productCar.findIndex(product => product.id === nuevoArt.id);

    // revisa existencia en stock
    if(index === -1){
        productCar.push(nuevoArt);
    }else{
        productCar.splice(index, 1, nuevoArt);
    }

    fs.writeFileSync('./carrito.txt', '');
    fs.writeFileSync('./carrito.txt', JSON.stringify(productCar)); 

    res.send('Productos añadidos exitosamente a tu carrito');
})

app.put('/carrito/products/:id/:quantity', (req, res) => {
    let datoCar = fs.readFileSync('./carrito.txt', 'utf8');
    let productCar = JSON.parse(datoCar);
    
    let quant = parseInt(req.params.quantity);
    let productId = parseInt(req.params.id);

    // get the index and product
    const index = productCar.findIndex(product => product.id === productId);
    const match = productCar[index];

    match.quantity = quant;

    productCar.splice(index, 1, match);

    fs.writeFileSync('./carrito.txt', '');
    fs.writeFileSync('./carrito.txt', JSON.stringify(productCar));
    res.send('Productos actualizados');
})

app.delete('/carrito/products/:id/', (req, res) => {
    let datoCar = fs.readFileSync('./carrito.txt', 'utf8');
    let productCar= JSON.parse(datoCar);
    
    let productId = parseInt(req.params.id);

    
    const index = productCar.findIndex(product => product.id === productId);

    productCar.splice(index, 1);

    fs.writeFileSync('./carrito.txt', '');
    fs.writeFileSync('./carrito.txt', JSON.stringify(productCar));
    res.send('Producto eliminado');
})

app.post('/checkout', (req, res) => {
    let msg = '';
    let total = 0;
    let errFlag = 0;
    let datoCar= fs.readFileSync('./carrito.txt', 'utf8');
    let productCar = JSON.parse(datoCar);

    let baseDato = fs.readFileSync('./datos.txt', 'utf8');
    let baseProduct = JSON.parse(baseDato);

    // verifica en stock
    productCar.forEach(product => {
        let index = baseProduct.findIndex(wProd => wProd.id === product.id)
        total += parseInt(baseProduct[index].price) * product.quantity;
        if(product.quantity > baseProduct[index].quantity){
            errFlag = 1;
        }
    });
    
    if(errFlag === 0){
        
        productCar.forEach(product => {
            let index = baseProduct.findIndex(wProd => wProd.id === product.id)
            baseProduct[index].quantity -= product.quantity;
        });

        msg = 'checked out. total was ' + total;
        fs.writeFileSync('./carrito.txt', '[]');
        fs.writeFileSync('./datos.txt', '');
        fs.writeFileSync('./datos.txt', JSON.stringify(baseProduct));

    }else{
        msg = 'error. no hay en existencia'
    }
    
    res.send(msg);
})

