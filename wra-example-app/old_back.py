from flask import Flask, render_template, jsonify, request

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/test", methods=['POST', 'GET'])
def testapi():
    return jsonify(list(request.headers))


@app.route("/api/login", methods=['POST'])
def login_api():
    data = request.json

    if data['username'] == data['password'] == "goida":
        resp = jsonify({"message": "ok"})
        resp.headers['X-Wra-Data'] = "goida"
        return resp

    return {"message": "bad cred"}, 401


if __name__ == '__main__':
    app.run(debug=1)
