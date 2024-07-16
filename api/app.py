from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import requests
import base64

app = Flask(__name__)
CORS(app)

# Twitter API credentials
api_key = 'ehRGgPWxb9LZWUUshK4ZKaJ3o'
api_secret_key = '2u9C3l606AQYjld9O0ODYnF5XxcRgMJiNYXSzPdEngrMMgrY1L'
bearer_token = f"{api_key}:{api_secret_key}"
base64_encoded_bearer_token = base64.b64encode(bearer_token.encode('utf-8')).decode('utf-8')

def get_twitter_bearer_token():
    headers = {
        'Authorization': f'Basic {base64_encoded_bearer_token}',
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    }
    response = requests.post('https://api.twitter.com/oauth2/token', headers=headers, data={'grant_type': 'client_credentials'})
    return response.json().get('access_token')

twitter_bearer_token = get_twitter_bearer_token()

@app.route('/detect', methods=['POST'])
def detect_hate_speech():
    data = request.json
    text = data.get('text')

    hate_speech_keywords = [
        "racist", "bigot", "homophobe", "xenophobe", "sexist", "misogynist", "nazi", 
        "fascist", "white supremacist", "terrorist", "hate crime", "ethnic cleansing",
        "anti-semitic", "hateful", "offensive", "slur", "derogatory", "discrimination",
        "prejudice", "intolerant", "hater", "abuse", "harassment, msemge, shoga"
    ]
    
    is_hate_speech = any(keyword in text.lower() for keyword in hate_speech_keywords)
    return jsonify({"status": "success", "is_hate_speech": is_hate_speech})

@app.route('/log', methods=['POST'])
def log_hate_speech():
    data = request.json
    user_id = data.get('user_id')
    text = data.get('text')
    timestamp = data.get('timestamp')
    platform = data.get('platform')

    save_to_db(user_id, text, timestamp, platform)
    return jsonify({"status": "success"})

def save_to_db(user_id, text, timestamp, platform):
    db_config = {
        'user': 'yourusername',
        'password': 'yourpassword',
        'host': 'localhost',
        'database': 'social_media'
    }

    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        if platform == 'twitter':
            cursor.execute('INSERT INTO twitter_data (user, tweet_text, timestamp) VALUES (%s, %s, %s)',
                           (user_id, text, timestamp))
        elif platform == 'instagram':
            cursor.execute('INSERT INTO instagram_data (user, instagram_text, timestamp) VALUES (%s, %s, %s)',
                           (user_id, text, timestamp))
        elif platform == 'tiktok':
            cursor.execute('INSERT INTO tiktok_data (user, post_text, timestamp) VALUES (%s, %s, %s)',
                           (user_id, text, timestamp))
        conn.commit()
        cursor.close()
        conn.close()
    except mysql.connector.Error as err:
        print(f"MySQL Error: {err}")
    except Exception as e:
        print(f"Unexpected Error: {str(e)}")

if __name__ == '__main__':
    app.run(debug=True)
