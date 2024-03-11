import React, { useState, useEffect } from 'react'
import axios from 'axios'
import CryptoJS from 'crypto-js'
import './ProductList.scss'

const password = 'Valantis'
const apiUrl = 'https://api.valantis.store:41000/'
const ITEMS_PER_PAGE = 10

const ProductList = () => {
	const [products, setProducts] = useState([])
	const [currentPage, setCurrentPage] = useState(1)
	const [totalPages, setTotalPages] = useState(1)
	const [filters, setFilters] = useState({})
	const [loading, setLoading] = useState(true)

	const handleFilterChange = event => {
		const { name, value } = event.target
		setFilters({ ...filters, [name]: value })
		setCurrentPage(1)
		fetchProducts()
	}

	const fetchProducts = async () => {
		setLoading(true)
		try {
			const response = await axios.post(
				apiUrl,
				{
					action: 'get_items',
					params: {
						ids: await getProductIds(),
						filters: filters
					}
				},
				{
					headers: {
						'Content-Type': 'application/json',
						'X-Auth': generateAuthorizationString()
					}
				}
			)

			const uniqueProducts = []
			const seenIds = new Set()

			response.data.result.forEach(product => {
				if (!seenIds.has(product.id)) {
					uniqueProducts.push(product)
					seenIds.add(product.id)
				}
			})

			setProducts(uniqueProducts.slice(0, ITEMS_PER_PAGE))
			const totalProducts = uniqueProducts.length
			const totalPagesCount = Math.ceil(totalProducts / ITEMS_PER_PAGE)
			setTotalPages(totalPagesCount)
		} catch (error) {
			if (error.response && error.response.data && error.response.data.error) {
				console.error('Error:', error.response.data.error)
			} else {
				console.error('Error fetching products:', error)
			}
		} finally {
			setLoading(false)
		}
	}

	const getProductIds = async () => {
		try {
			const response = await axios.post(
				apiUrl,
				{
					action: 'get_ids',
					params: {
						offset: (currentPage - 1) * ITEMS_PER_PAGE,
						filters: filters
					}
				},
				{
					headers: {
						'Content-Type': 'application/json',
						'X-Auth': generateAuthorizationString()
					}
				}
			)
			return response.data.result
		} catch (error) {
			console.error('Error fetching product IDs:', error)
			return []
		}
	}

	const generateAuthorizationString = () => {
		const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
		const authString = `${password}_${timestamp}`
		return CryptoJS.MD5(authString).toString(CryptoJS.enc.Hex)
	}

	useEffect(() => {
		fetchProducts()
	}, [currentPage, filters])

	const handlePageChange = newPage => {
		setCurrentPage(newPage)
	}

	return (
		<div className='product-list-container'>
			<h1>Product List</h1>
			<div className='filter-section'>
				<label>
					Filter by Name:
					<input type='text' name='product' onChange={handleFilterChange} />
				</label>
				<label>
					Filter by Price:
					<input type='number' name='price' onChange={handleFilterChange} />
				</label>
				<label>
					Filter by Brand:
					<input type='text' name='brand' onChange={handleFilterChange} />
				</label>
			</div>
			{loading ? (
				<div className='loading'>Loading...</div>
			) : (
				<>
					<div className='pagination'>
						<button
							onClick={() => handlePageChange(currentPage - 1)}
							disabled={currentPage === 1}
						>
							Previous Page
						</button>
						<span>
							Page {currentPage} of {totalPages}
						</span>
						<button
							onClick={() => handlePageChange(currentPage + 1)}
							disabled={currentPage === totalPages}
						>
							Next Page
						</button>
					</div>
					<div className='product-cards'>
						{products.map(product => (
							<div key={product.id} className='product-card'>
								<div className='product-details'>
									<h3>{product.product}</h3>
									<p>
										<strong>Price:</strong> {product.price}
									</p>
									{product.brand && (
										<p>
											<strong>Brand:</strong> {product.brand}
										</p>
									)}
								</div>
							</div>
						))}
					</div>
				</>
			)}
		</div>
	)
}

export default ProductList
