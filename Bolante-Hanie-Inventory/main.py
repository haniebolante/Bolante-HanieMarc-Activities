from flask import Flask, jsonify, request, render_template, redirect, url_for,session,send_file
from flask_mysqldb import MySQL
import hashlib
import os
import csv
import io

app = Flask(__name__)
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = ''
app.config['MYSQL_DB'] = 'inven_system'
mysql = MySQL(app)

SALT = '12345abcde'

app.secret_key = os.urandom(24)

@app.route('/')
def index():
    return render_template('login.html')


@app.route('/check-user', methods=['POST'])
def check_user():
    try:
        data = request.get_json() 
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({
                "success": False, 
                "message": "Username and password are required"
            }), 400
        
        salted = str(SALT + password).encode('utf-8')
        hashed = hashlib.sha512(salted).hexdigest()

        cur = mysql.connection.cursor()
        cur.execute("SELECT * FROM users WHERE username = %s AND password = %s", (username, hashed))
        user = cur.fetchone()
        cur.close()

        if user:
            session['logged_in'] = True
            session['username'] = username
            session['username'] = user[0]  
            
            return jsonify({
                "success": True,
                "message": "Login successful",
                "redirect": "/dashboard",
                "username": username
            })
        else:
            return jsonify({
                "success": False,
                "message": "Invalid username or password"
            }), 401
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": "An error occurred during login"
        }), 500
@app.route('/export-products', methods=['GET'])
def export_products():
    try:
        if not session.get('logged_in'):
            return jsonify({"error": "Unauthorized"}), 401

        username = session.get('username')
        cur = mysql.connection.cursor()
        cur.execute("SELECT * FROM products WHERE username = %s", (username,))
        products = cur.fetchall()
        cur.close()

        si = io.StringIO()
        cw = csv.writer(si)
        
        cw.writerow(['Product ID', 'Name', 'Quantity', 'Unit', 'Price'])
        
        for product in products:
            cw.writerow([product[0], product[1], product[2], product[3], product[4]])
        
        output = si.getvalue()
        si.close()
        
        mem = io.BytesIO()
        mem.write(output.encode('utf-8'))
        mem.seek(0)
        
        return send_file(
            mem,
            mimetype='text/csv',
            as_attachment=True,
            download_name='products.csv'
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/dashboard')
def dashboard():

    if not session.get('logged_in'):
        return redirect(url_for('index'))
    return render_template('inventory.html', username=session.get('username'))

@app.route('/logout', methods=['POST'])
def logout():
    try:

        session.clear()
        return jsonify({
            'success': True,
            'message': 'Logged out successfully',
            'redirect': '/'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/check-session', methods=['GET'])
def check_session():
    return jsonify({
        'logged_in': session.get('logged_in', False),
        'username': session.get('username', None)
    })
# Add this route after your existing routes
@app.route('/register-page')
def register_page():
    return render_template('register.html')

@app.route('/add-products', methods=['POST'])
def add_products():
    try:
        if not session.get('logged_in'):
            return jsonify({"error": "Unauthorized"}), 401

        data = request.get_json()
        name = data.get('name')
        quantity = data.get('quantity')
        unit = data.get('unit')
        price = data.get('price')
        username = session.get('username') 

        quantity = int(quantity)
        price = float(price)
    
        cur = mysql.connection.cursor()
        cur.execute("""
            INSERT INTO products (product_name, quantity, unit, price, username) 
            VALUES (%s, %s, %s, %s, %s)
        """, (name, quantity, unit, price, username))
        mysql.connection.commit()
        cur.close()
        
        return jsonify({'success': True, 'message': 'Product added successfully'})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/search-products', methods=['GET'])
def search_products():
    try:
        if not session.get('logged_in'):
            return jsonify({"error": "Unauthorized"}), 401

        search_term = request.args.get('term', '')
        username = session.get('username')
        
        cur = mysql.connection.cursor()
        cur.execute("""
            SELECT * FROM products 
            WHERE username = %s 
            AND (product_name LIKE %s OR CAST(product_id AS CHAR) LIKE %s)
        """, (username, f'%{search_term}%', f'%{search_term}%'))
        
        products = cur.fetchall()
        cur.close()
        
        return jsonify({
            'success': True,
            'products': products
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
 
  
@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        cur = mysql.connection.cursor()
        cur.execute("SELECT * FROM users WHERE username = %s", (username,))
        existing_user = cur.fetchone()
        
        if existing_user:
            return jsonify({
                'success': False,
                'message': 'Username already exists'
            })

        salted = str(SALT + password).encode('utf-8')
        hashed = hashlib.sha512(salted).hexdigest()

        cur.execute("INSERT INTO users (username, password) VALUES (%s, %s)", (username, hashed))
        mysql.connection.commit()
        cur.close()

        return jsonify({
            'success': True,
            'message': 'Registration successful'
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500
 

@app.route('/delete-product', methods=['POST'])
def delete_product():
    try:
        if not session.get('logged_in'):
            return jsonify({"error": "Unauthorized"}), 401

        data = request.get_json()
        product_id = data.get('product_id')
        username = session.get('username')

        cur = mysql.connection.cursor()
        cur.execute("SELECT username FROM products WHERE product_id = %s", (product_id,))
        product = cur.fetchone()
        
        if not product or product[0] != username:
            return jsonify({"error": "Unauthorized access"}), 403

        cur.execute("DELETE FROM products WHERE product_id = %s AND username = %s", (product_id, username))
        mysql.connection.commit()
        cur.close()
        
        return jsonify({'success': True, 'message': 'Product deleted successfully'})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


    
    
@app.route('/get-product/<int:id>', methods=['GET'])
def get_product(id):
    try:
        cur = mysql.connection.cursor()
        cur.execute("SELECT * FROM products WHERE product_id = %s", (id,))
        product = cur.fetchone()
        cur.close()
        
        if product:
            return jsonify({
                'name': product[1],
                'quantity': product[2],
                'unit': product[3],
                'price': product[4]
            })
        else:
            return jsonify({"error": "Product not found"}), 404
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/update-product', methods=['POST'])
def update_product():
    try:
        if not session.get('logged_in'):
            return jsonify({"error": "Unauthorized"}), 401

        data = request.get_json()
        product_id = data.get('product_id')
        name = data.get('name')
        quantity = int(data.get('quantity'))
        unit = data.get('unit')
        price = float(data.get('price'))
        username = session.get('username')

        cur = mysql.connection.cursor()
        cur.execute("SELECT username FROM products WHERE product_id = %s", (product_id,))
        product = cur.fetchone()
        
        if not product or product[0] != username:
            return jsonify({"error": "Unauthorized access"}), 403

        cur.execute("""
            UPDATE products 
            SET product_name = %s, quantity = %s, unit = %s, price = %s 
            WHERE product_id = %s AND username = %s
        """, (name, quantity, unit, price, product_id, username))
        mysql.connection.commit()
        cur.close()
        
        return jsonify({
            'success': True,
            'message': 'Product updated successfully'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/get_products', methods=['GET'])
def get_products():
    try:
        if not session.get('logged_in'):
            return jsonify({"error": "Unauthorized"}), 401

        username = session.get('username')
        cur = mysql.connection.cursor()
        cur.execute("SELECT * FROM products WHERE username = %s", (username,))
        products = cur.fetchall()
        cur.close()

        return jsonify(products)
   
    except Exception as e:
        return jsonify({"error": str(e)}), 500
       
if __name__ == '__main__':
    app.run(debug=True)
