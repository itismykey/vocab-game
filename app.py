from flask import Flask, render_template, jsonify
import requests
import os

app = Flask(__name__)

# 從環境變數取得 Google Sheets API 設定
SHEET_ID = os.getenv("SHEET_ID")
SHEET_NAME = os.getenv("SHEET_NAME", "Sheet1")
API_KEY = os.getenv("API_KEY")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_words')
def get_words():
    url = f"https://sheets.googleapis.com/v4/spreadsheets/{SHEET_ID}/values/{SHEET_NAME}?key={API_KEY}"
    response = requests.get(url)
    data = response.json()
    
    values = data.get("values", [])[1:]  # 跳過標題列
    word_list = [{"word": row[0], "meaning": row[1]} for row in values if len(row) >= 2]
    return jsonify(word_list)

if __name__ == '__main__':
    app.run(debug=True)
