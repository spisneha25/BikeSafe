import urllib2
import json 

hour = 17

if hour < 7:
    light = "Dawn"
elif hour < 16:
    light= "Daylight"
elif hour < 20:
    light = "Dusk"
else:
    light = "Dark"
    
data =  {
            "Id": "score00001",
            "Instance": {
                "FeatureVector": {
                    "Sex": "0",
                    "City": "0",
                    "Day": "0",
                    "Hour": "0",
                    "Month": "0",
                    "Lat": "0",
                    "Lon": "0",
                    "Light": "0",
                    "Weather": "0",
                },
                "GlobalParameters": 
                        {
                                                }
            }
        }

body = str.encode(json.dumps(data))

url = 'https://ussouthcentral.services.azureml.net/workspaces/f69f3211aea242aeb448222e541a7107/services/44d4a67e695b457bb809be1b33a2e03c/score'
api_key = '2Gi+pEQHRapXVEDsRzJFeff2vqO/cXbFHp/SNCExoSqlFAVZ3vc/s69fx+AQZsoDpEbz3fASUsx8QDY+GA0Rvw==' # Replace this with the API key for the web service
headers = {'Content-Type':'application/json', 'Authorization':('Bearer '+ api_key)}
req = urllib2.Request(url, body, headers) 
response = urllib2.urlopen(req)
result = response.read()

r = ['Possible Injury scale', 'Evident Injury scale', 'Disabling Injury scale', 'Killed scale', 'Safe']

print r[int(result[-3])-1]
