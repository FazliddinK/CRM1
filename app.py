# -*- coding: utf-8 -*-
from flask import Flask, request, jsonify, send_file, render_template
from flask_cors import CORS
import pymysql
import io
import time
from datetime import datetime
import decimal
from datetime import timedelta
from flask import Response
import json

def convert_for_json(obj):
    if isinstance(obj, (datetime,)):
        return obj.strftime("%Y-%m-%d %H:%M:%S")
    if isinstance(obj, (timedelta,)):
        return str(obj)
    if isinstance(obj, decimal.Decimal):
        return float(obj)
    return obj
from pymysql import OperationalError, MySQLError
from openpyxl import Workbook
from contextlib import contextmanager
import os

app = Flask(__name__, template_folder='app/templates', static_folder='app/static')
CORS(app)

class Database:
    def __init__(self):
        self.connection = None
        self.connect()

    def connect(self, max_retries=5, delay=5):
        for attempt in range(max_retries):
            try:
                self.connection = pymysql.connect(
                    host=os.getenv('MYSQL_HOST', 'db'),
                    user=os.getenv('MYSQL_USER', 'root'),
                    password=os.getenv('MYSQL_PASSWORD'),
                    database=os.getenv('MYSQL_DATABASE', 'sales_crm'),
                    cursorclass=pymysql.cursors.DictCursor,
                    autocommit=True
                )
                print("✅ Успешное подключение к MySQL")
                return
            except OperationalError as e:
                if attempt == max_retries - 1:
                    raise e
                print(f"⌛ MySQL ещё не готов, пробую через {delay} сек... (Попытка {attempt + 1}/{max_retries})")
                time.sleep(delay)

    @contextmanager
    def get_cursor(self):
        self.ensure_connection()
        cursor = self.connection.cursor()
        try:
            yield cursor
        finally:
            cursor.close()

    def ensure_connection(self):
        try:
            self.connection.ping(reconnect=True)
        except (OperationalError, AttributeError):
            self.connect()

    def fetch_query(self, query, args=()):
        try:
            with self.get_cursor() as cursor:
                cursor.execute(query, args)
                return cursor.fetchall()
        except MySQLError as e:
            print(f"Ошибка MySQL при выполнении запроса: {e}")
            raise

    def execute_query(self, query, args=()):
        try:
            with self.get_cursor() as cursor:
                cursor.execute(query, args)
                self.connection.commit()
        except MySQLError as e:
            print(f"Ошибка MySQL при выполнении запроса: {e}")
            self.connection.rollback()
            raise

db = Database()

# ======================= API: Марки авто ============================
@app.route("/api/car-brands", methods=["GET"])
def get_car_brands():
    try:
        result = db.fetch_query("SELECT name FROM car_brands")
        return Response(json.dumps([row['name'] for row in result], default=convert_for_json), content_type='application/json')
    except Exception as e:
        return Response(json.dumps({"error": str(e)}, default=convert_for_json), content_type='application/json'), 500

@app.route("/api/car-brands", methods=["POST"])
def add_car_brand():
    try:
        data = request.get_json()
        brand = data.get("name")
        if not brand:
            return Response(json.dumps({"error": "Марка обязательна"}, default=convert_for_json), content_type='application/json')

        db.execute_query("INSERT IGNORE INTO car_brands (name) VALUES (%s)", (brand,))
        return Response(json.dumps({"message": "Марка добавлена"}, default=convert_for_json), content_type='application/json')
    except Exception as e:
        return Response(json.dumps({"error": str(e)}, default=convert_for_json), content_type='application/json'), 500

# ======================= API: Гос. номера ============================
@app.route("/api/car-numbers", methods=["GET"])
def get_car_numbers():
    try:
        result = db.fetch_query("SELECT number FROM car_numbers")
        return Response(json.dumps([row['number'] for row in result], default=convert_for_json), content_type='application/json')
    except Exception as e:
        return Response(json.dumps({"error": str(e)}, default=convert_for_json), content_type='application/json'), 500

@app.route("/api/car-numbers", methods=["POST"])
def add_car_number():
    try:
        new_number = request.json.get("number")
        if not new_number:
            return Response(json.dumps({"error": "Номер обязателен"}, default=convert_for_json), content_type='application/json'), 400

        db.execute_query("INSERT IGNORE INTO car_numbers (number) VALUES (%s)", (new_number,))
        return Response(json.dumps({"message": "Номер добавлен"}, default=convert_for_json), content_type='application/json')
    except Exception as e:
        return Response(json.dumps({"error": str(e)}, default=convert_for_json), content_type='application/json'), 500

# ======================= API: Наличные продажи =======================
@app.route('/api/cash-sales', methods=['POST'])
def add_cash_sale():
    try:
        if not request.is_json:
            return Response(json.dumps({"error": "Request must be JSON"}, default=convert_for_json), content_type='application/json')
        
        data = request.get_json()
        
        required_fields = ['date', 'time', 'car_brand', 'car_number', 'product', 'volume', 'amount']
        missing_fields = [field for field in required_fields if field not in data or not data[field]]
        
        if missing_fields:
            return Response(json.dumps({
            "error": "Missing required fields",
            "missing": missing_fields
            }, default=convert_for_json), content_type='application/json'), 400

        
        try:
            float(data['volume'])
            float(data['amount'])
        except (ValueError, TypeError):
            return Response(json.dumps({"error": "Volume and amount must be numbers"}, default=convert_for_json), content_type='application/json')

        query = """
            INSERT INTO cash_sales (date, time, car_brand, car_number, product, volume, amount, comment)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        db.execute_query(query, (
            data['date'],
            data['time'],
            data['car_brand'],
            data['car_number'],
            data['product'],
            float(data['volume']),
            float(data['amount']),
            data.get('comment', '')
        ))
        return Response(json.dumps({'message': 'Продажа сохранена'}, default=convert_for_json), content_type='application/json')
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/cash-sales', methods=['GET'])
def get_cash_sales():
    try:
        date = request.args.get('date')
        if not date:
            return Response(json.dumps({"error": "Date parameter is required"}, default=convert_for_json), content_type='application/json')

        # Проверка даты
        datetime.strptime(date, '%Y-%m-%d')

        result = db.fetch_query("""
            SELECT id, date, time, car_brand, car_number, product, volume, amount, comment
            FROM cash_sales
            WHERE date = %s
            ORDER BY time DESC
        """, (date,))

        # Конвертация времени
        for row in result:
            if isinstance(row.get('time'), (datetime,)):
                row['time'] = row['time'].strftime("%H:%M:%S")
            else:
                row['time'] = str(row['time'])

        return Response(json.dumps(result, default=convert_for_json), content_type='application/json')

    except ValueError:
        return Response(json.dumps({"error": "Invalid date format. Use YYYY-MM-DD"}, default=convert_for_json), content_type='application/json'), 400

    except Exception as e:
        return Response(json.dumps({"error": str(e)}, default=convert_for_json), content_type='application/json'), 500

@app.route('/export_cash_sales_excel', methods=['GET'])
def export_cash_sales_excel():
    try:
        date = request.args.get('date')
        if not date:
            return Response(json.dumps({'error': 'Дата не указана'}, default=convert_for_json), content_type='application/json'), 400

        rows = db.fetch_query("""
            SELECT date, time, car_brand, car_number, product, volume, amount, comment
            FROM cash_sales
            WHERE date = %s
            ORDER BY time DESC
        """, (date,))

        wb = Workbook()
        ws = wb.active
        ws.title = "Наличные продажи"

        headers = ['Дата', 'Время', 'Марка авто', 'Гос номер', 'Товар', 'Объем', 'Сумма', 'Комментарий']
        ws.append(headers)

        for row in rows:
            ws.append([
                row['date'],
                row['time'],
                row['car_brand'],
                row['car_number'],
                row['product'],
                row['volume'],
                row['amount'],
                row.get('comment', '')
            ])

        output = io.BytesIO()
        wb.save(output)
        output.seek(0)

        return send_file(
            output,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name=f'наличные_продажи_{date}.xlsx'
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ======================= API: Клиентские продажи =====================
@app.route('/api/client-sales', methods=['POST'])
def add_client_sale():
    try:
        data = request.get_json()
        
        required_fields = ['date', 'time', 'counterparty', 'car_brand', 'car_number', 'product', 'volume', 'amount']
        for field in required_fields:
            if field not in data or not data[field]:
                return Response(json.dumps({'error': f'Поле {field} обязательно'}, default=convert_for_json), content_type='application/json')

        query = """
            INSERT INTO client_sales (date, time, counterparty, car_brand, car_number, product, volume, amount, comment)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        db.execute_query(query, (
            data['date'],
            data['time'],
            data['counterparty'],
            data['car_brand'],
            data['car_number'],
            data['product'],
            float(data['volume']),
            float(data['amount']),
            data.get('comment', '')
        ))
        return Response(json.dumps({'message': 'Продажа клиенту сохранена'}, default=convert_for_json), content_type='application/json')
    except Exception as e:
        return Response(json.dumps({'error': str(e)}, default=convert_for_json), content_type='application/json'), 500

@app.route('/api/client-sales', methods=['GET'])
def get_client_sales():
    try:
        date = request.args.get('date')
        if not date:
            return Response(json.dumps({'error': 'Дата не указана'}, default=convert_for_json), content_type='application/json'), 400

        result = db.fetch_query("""
            SELECT id, date, time, counterparty, car_brand, car_number, product, volume, amount, comment
            FROM client_sales
            WHERE date = %s
            ORDER BY time DESC
        """, (date,))

        for row in result:
            row['time'] = str(row['time'])

        return Response(json.dumps(result, default=convert_for_json), content_type='application/json')
    except Exception as e:
        return Response(json.dumps({'error': str(e)}, default=convert_for_json), content_type='application/json'), 500

# ======================= API: Расходы ================================
VALID_CATEGORIES = ['Солярка', '849', 'Ойлик пули', 'Темур', 'Фазлиддин']

@app.route('/api/expenses', methods=['POST'])
def api_add_expense():
    try:
        data = request.get_json()

        if 'category' not in data or data['category'] not in VALID_CATEGORIES:
            return Response(json.dumps({'error': 'Неверная категория'}, default=convert_for_json), content_type='application/json'), 400

        required_fields = ['date', 'time', 'amount']
        for field in required_fields:
            if field not in data or not data[field]:
                return Response(json.dumps({'error': f'Поле {field} обязательно'}, default=convert_for_json), content_type='application/json'), 400
            
        query = """
            INSERT INTO expenses (date, time, amount, category, comment)
            VALUES (%s, %s, %s, %s, %s)
        """
        db.execute_query(query, (
            data['date'],
            data['time'],
            float(data['amount']),
            data['category'],
            data.get('comment', '')
        ))
        return Response(json.dumps({'message': 'Расход сохранён'}, default=convert_for_json), content_type='application/json')
    except Exception as e:
        return Response(json.dumps({'error': str(e)}, default=convert_for_json), content_type='application/json'), 500

@app.route('/api/expenses', methods=['GET'])
def api_get_expenses():
    try:
        date = request.args.get('date')
        if not date:
            return Response(json.dumps({'error': 'Дата не указана'}, default=convert_for_json), content_type='application/json'), 400

        expenses = db.fetch_query("""
            SELECT id, date, time, amount, category, comment
            FROM expenses
            WHERE date = %s
            ORDER BY time DESC
        """, (date,))

        for row in expenses:
            row['time'] = str(row['time'])

        return Response(json.dumps(expenses, default=convert_for_json), content_type='application/json')
    except Exception as e:
        return Response(json.dumps({'error': str(e)}, default=convert_for_json), content_type='application/json'), 500
    
# ======================= API: Баланс ================================
@app.route('/api/balance', methods=['GET'])
def api_get_balance():
    try:
        sales = db.fetch_query("SELECT COALESCE(SUM(amount), 0) as total FROM cash_sales")[0]['total']
        expenses = db.fetch_query("SELECT COALESCE(SUM(amount), 0) as total FROM expenses")[0]['total']
        return Response(json.dumps({
            'balance': float(sales) - float(expenses),
            'sales_total': float(sales),
            'expenses_total': float(expenses)
        }, default=convert_for_json), content_type='application/json')

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ======================= Главная страница ===========================
@app.route('/')
def home():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
