function add() {
    const name = $('#name').val().trim();
    const quantity = $('#quantity').val().trim();
    const price = $('#price').val().trim();
    const unit = $('#unit').val().trim();
    
    // Enhanced input validation
    if (!name || !quantity || !price || !unit) {
        alert('Please fill in all fields');
        return;
    }
    
    const quantityNum = parseFloat(quantity);
    const priceNum = parseFloat(price);
    
    if (isNaN(quantityNum) || quantityNum < 0 || !Number.isInteger(quantityNum)) {
        alert('Please enter a valid whole number for quantity');
        return;
    }
    
    if (isNaN(priceNum) || priceNum < 0) {
        alert('Please enter a valid price');
        return;
    }

    // Sanitize data before sending
    const productData = {
        name: name.substring(0, 100), // Limit name length
        quantity: Math.floor(quantityNum), // Ensure integer
        price: Number(priceNum.toFixed(2)), // Format price to 2 decimals
        unit: unit.substring(0, 20) // Limit unit length
    };

    $.ajax({
        url: '/add-products',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(productData),
        success: function(response) {
            if (response.success) {
                // Clear form and reload products
                $('#name, #quantity, #price, #unit').val('');
                loadProducts();
                alert(response.message);
            } else {
                alert(response.message || "Error adding product");
            }
        },
        error: function(xhr, status, error) {
            if (!checkAuthorization(xhr)) return;
            
            let errorMessage = 'Error adding product: ';
            try {
                const response = JSON.parse(xhr.responseText);
                errorMessage += response.error || error;
            } catch (e) {
                errorMessage += error;
            }
            console.error('Add product error:', error);
            alert(errorMessage);
        }
    }); 
}
function loadProducts() {
    $.ajax({
        url: '/get_products',
        type: 'GET',
        success: function(products) {
            let tbody = '';
            if (products && products.length > 0) {
                products.forEach(product => {
                    tbody += `
                        <tr>
                            <td>${product[0]}</td>
                            <td>${product[1]}</td>
                            <td>${product[2]}</td>
                            <td>${product[3]}</td>
                            <td>₱${product[4].toLocaleString()}</td>
                            <td>
                                <button class="btn bbtn btn-warning" onclick="editProduct(${product[0]})">Edit</button>
                                <button class="btn bbtn btn-danger" onclick="deleteProduct(${product[0]})">Delete</button>
                            </td>
                        </tr>
                    `;
                });
            } else {
                tbody = `
                    <tr>
                        <td colspan="6" class="text-center">No Products inserted</td>
                    </tr>
                `;
            }
            $('tbody').html(tbody);
        },
        error: function(xhr, status, error) {
            alert('Error loading products: ' + error);
        }
    });
}

$(document).ready(function() {
    loadProducts();
    $('#navToggle').click(function() {
        $('.sidebar').toggleClass('active');
        $('.overlay').toggleClass('active');
    });

    // Close sidebar when clicking overlay
    $('#overlay').click(function() {
        $('.sidebar').removeClass('active');
        $('.overlay').removeClass('active');
    });

    // Close sidebar when window resizes past mobile breakpoint
    $(window).resize(function() {
        if ($(window).width() > 768) {
            $('.sidebar').removeClass('active');
            $('.overlay').removeClass('active');
        }
    });

});

// Add new function to handle save (both add and update)
function saveProduct() {
    const productId = $('#edit_product_id').val();
    const name = $('#name').val().trim();
    const quantity = $('#quantity').val().trim();
    const price = $('#price').val().trim();
    const unit = $('#unit').val().trim();
    
    // Enhanced input validation
    if (!name || !quantity || !price || !unit) {
        alert('Please fill in all fields');
        return;
    }
    
    const quantityNum = parseFloat(quantity);
    const priceNum = parseFloat(price);
    
    if (isNaN(quantityNum) || quantityNum < 0 || !Number.isInteger(quantityNum)) {
        alert('Please enter a valid whole number for quantity');
        return;
    }
    
    if (isNaN(priceNum) || priceNum < 0) {
        alert('Please enter a valid price');
        return;
    }

    // Sanitize data before sending
    const productData = {
        name: name.substring(0, 100),
        quantity: Math.floor(quantityNum),
        price: Number(priceNum.toFixed(2)),
        unit: unit.substring(0, 20)
    };

    if (productId) {
        productData.product_id = productId;
        updateProduct(productData);
    } else {
        addProduct(productData);
    }
}

function addProduct(productData) {
    $.ajax({
        url: '/add-products',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(productData),
        success: function(response) {
            if (response.success) {
                clearForm();
                loadProducts();
                alert(response.message);
            } else {
                alert(response.message || "Error adding product");
            }
        },
        error: function(xhr, status, error) {
            handleAjaxError(xhr, 'adding');
        }
    });
}

function updateProduct(productData) {
    $.ajax({
        url: '/update-product',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(productData),
        success: function(response) {
            if (response.success) {
                clearForm();
                loadProducts();
                alert(response.message);
            } else {
                alert('Error: ' + response.message);
            }
        },
        error: function(xhr, status, error) {
            handleAjaxError(xhr, 'updating');
        }
    });
}

function editProduct(id) {
    $.ajax({
        url: '/get-product/' + id,
        type: 'GET',
        success: function(product) {
            // Fill the form with product data
            $('#edit_product_id').val(id);
            $('#name').val(product.name);
            $('#quantity').val(product.quantity);
            $('#unit').val(product.unit);
            $('#price').val(product.price);
            
            // Update UI to show we're in edit mode
            $('#formTitle').text('Edit Product');
            $('#saveBtnText').text('Save Changes');
            $('#cancelBtn').removeClass('d-none');
            $('#saveBtn').removeClass('btn-light').addClass('btn-primary');
            
            // Scroll to form
            $('.sidebar').scrollTop(0);
        },
        error: function(xhr, status, error) {
            alert('Error loading product: ' + error);
        }
    });
}

function cancelEdit() {
    clearForm();
}

function clearForm() {
    // Clear all form fields
    $('#edit_product_id').val('');
    $('#name, #quantity, #price, #unit').val('');
    
    // Reset UI to add mode
    $('#formTitle').text('Add New Product');
    $('#saveBtnText').text('Add Product');
    $('#cancelBtn').addClass('d-none');
    $('#saveBtn').removeClass('btn-primary').addClass('btn-light');
}

function handleAjaxError(xhr, action) {
    if (!checkAuthorization(xhr)) return;
    
    let errorMessage = `Error ${action} product: `;
    try {
        const response = JSON.parse(xhr.responseText);
        errorMessage += response.error || xhr.statusText;
    } catch (e) {
        errorMessage += xhr.statusText;
    }
    console.error(`${action} error:`, xhr.statusText);
    alert(errorMessage);
}

function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        $.ajax({
            url: '/delete-product',  
            type: 'POST',          
            contentType: 'application/json',
            data: JSON.stringify({ product_id: id }),
            success: function(response) {
                if (response.success) {
                    alert(response.message);
                    loadProducts();  
                } else {
                    alert('Error: ' + response.message);
                }
            },
            error: function(xhr, status, error) {
                alert('Error deleting product: ' + error);
            }
        });
    }
}
function exportProducts() {
    try {
        window.location.href = '/export-products';
    } catch (error) {
        alert('Error exporting products: ' + error);
    }
}
function logout() {
    if(confirm('Are you sure you want to logout?')) {
        $.ajax({
            url: '/logout',
            type: 'POST',
            success: function(response) {
                if(response.success) {
                    window.location.href = '/';
                }
            },
            error: function(xhr, status, error) {
                alert('Error logging out: ' + error);
            }
        });
    }
}
// Keep only one document.ready with all initializations
$(document).ready(function() {
    loadProducts();
    $('#search').on('keyup', function() {
        const searchTerm = $(this).val();
        searchProducts(searchTerm);
    });
    
});

function searchProducts(term) {
    $.ajax({
        url: '/search-products',
        type: 'GET',
        data: { term: term },
        success: function(response) {
            if (response.success) {
                if (response.products.length === 0) {
                    $('tbody').html('<tr><td colspan="6" class="text-center">No products found</td></tr>');
                } else {
                    updateProductTable(response.products);
                }
            }
        },
        error: function(xhr, status, error) {
            if (!checkAuthorization(xhr)) return;
            console.error('Search error:', error);
        }
    });
}

function updateProductTable(products) {
    let tbody = '';
    products.forEach(product => {
        tbody += `
            <tr>
                <td>${product[0]}</td>
                <td>${product[1]}</td>
                <td>${product[2]}</td>
                <td>${product[3]}</td>
                <td>₱${product[4].toLocaleString()}</td>
                <td>
                    <button onclick="editProduct(${product[0]})" class="btn bbtn btn-warning">Edit</button>
                    <button onclick="deleteProduct(${product[0]})" class="btn bbtn btn-danger">Delete</button>
                </td>
            </tr>
        `;
    });
    $('tbody').html(tbody);
}
function checkAuthorization(xhr) {
    if (xhr.status === 401) {
        alert('Your session has expired. Please login again.');
        window.location.href = '/';
        return false;
    }
    return true;
}