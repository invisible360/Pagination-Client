import React, { useEffect, useState } from 'react';
import { Link, useLoaderData } from 'react-router-dom';
import { addToDb, deleteShoppingCart, getStoredCart } from '../../utilities/fakedb';
import Cart from '../Cart/Cart';
import Product from '../Product/Product';
import './Shop.css';

const Shop = () => {
    // const { products, count } = useLoaderData();
    const [cart, setCart] = useState([]);

    //pagination
    const [page, setPage] = useState(0)
    const [size, setSize] = useState(10)

    const [products, setProducts] = useState([]);
    const [count, setCount] = useState(0);

    useEffect(() => {
        const url = `http://localhost:5000/products?page=${page}&size=${size}`;
        fetch(url)
            .then(res => res.json())
            .then(data => {
                // console.log(data);
                setProducts(data.products)
                setCount(data.count)
            })
    }, [page, size])

    const pages = Math.ceil(count / size);

    useEffect(() => {
        const storedCart = getStoredCart();
        const savedCart = [];

        //nirdisti data ante post er bebohar!!
        const ids = Object.keys(storedCart);
        // console.log(ids);

        fetch(`http://localhost:5000/productsByIds`, {
            method: 'POST',
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify(ids)
        })
            .then(res => res.json())
            .then(data => {
                console.log(data);
                for (const id in storedCart) {
                    const addedProduct = data.find(product => product._id === id);
                    if (addedProduct) {
                        const quantity = storedCart[id];
                        addedProduct.quantity = quantity;
                        savedCart.push(addedProduct);
                    }
                }

                setCart(savedCart);
            })
    }, [products])

    const clearCart = () => {
        setCart([]);
        deleteShoppingCart();
    }
    const handleAddToCart = (selectedProduct) => {
        console.log(selectedProduct);
        let newCart = [];
        const exists = cart.find(product => product._id === selectedProduct._id);
        if (!exists) {
            selectedProduct.quantity = 1;
            newCart = [...cart, selectedProduct];
        }
        else {
            const rest = cart.filter(product => product._id !== selectedProduct._id);
            exists.quantity = exists.quantity + 1;
            newCart = [...rest, exists];
        }

        setCart(newCart);
        addToDb(selectedProduct._id);
    }

    return (
        <div>
            <div className='shop-container'>
                <div className="products-container">
                    {
                        products.map(product => <Product
                            key={product._id}
                            product={product}
                            handleAddToCart={handleAddToCart}
                        ></Product>)
                    }
                </div>
                <div className="cart-container">
                    <Cart clearCart={clearCart} cart={cart}>
                        <Link to="/orders">
                            <button>Review Order</button>
                        </Link>
                    </Cart>
                </div>
            </div>

            {/* pagination */}
            <div className='pagination'>
                <p>Currenty selected page= {page + 1}, and data to be showed= {size}</p>
                {
                    [...Array(pages).keys()].map(pageNumber => <button
                        key={pageNumber}
                        className={`btn ${pageNumber === page && 'selected-btn'}`}
                        onClick={() => setPage(pageNumber)}
                    >
                        {pageNumber + 1}
                    </button>)
                }

                <select onChange={event => setSize(event.target.value)}>
                    <option value="5">5</option>
                    <option value="10" selected>10</option>
                    <option value="15">15</option>
                    <option value="20">20</option>
                </select>
            </div>

        </div>
    );
};

export default Shop;