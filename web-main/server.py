from flask import Flask, jsonify, request
import requests, json
app = Flask(__name__)

@app.route('/process', methods=['POST'])
def why():
    data = jsonify(request.get_json(force=True))
    #url = "http://api.openweathermap.org/data/2.5/weather?q=" + data[ + ",nc,us"
    #reads = requests.get(url)
    #data = json.loads(reads.content)

    #weather = data['weather'][0]['main']
    print(data)
    return data

if __name__ == '__main__':
    app.run(host='localhost',port=1005, debug=True)
