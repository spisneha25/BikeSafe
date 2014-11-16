from flask import Flask, jsonify, request, render_template
import requests, json, os

import logging, sys
logging.basicConfig(stream=sys.stderr)

tmpl_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'templates')

app = Flask(__name__, tmpl_dir)

@app.route('/process', methods=['POST'])
def why():
    print >> sys.stderr, "Heere!"
    #data = jsonify(request.get_json(force=True))
    #url = "http://api.openweathermap.org/data/2.5/weather?q=" + data[ + ",nc,us"
    #reads = requests.get(url)
    #data = json.loads(reads.content)

    #weather = data['weather'][0]['main']
    #print(data)
    #return data
    return request

@app.route('/')
def home():  # pragma: no cover
#    content = get_file('index.html')
    return render_template('index.html', title='index')


if __name__ == '__main__':
    app.run(host='localhost',port=80, debug=True)
