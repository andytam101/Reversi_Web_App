from flask import Flask, request, render_template, jsonify
from flask_cors import CORS
import sys
import os

current_dir = os.path.dirname(os.path.realpath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)

from bot.bot import move

app = Flask(__name__)
cors = CORS(app, resources={
            r"/*": {"origins": "*", "allow_headers": "*", "expose_headers": "*"}})


DEFAULT_DEPTH = 4


@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")


@app.route("/levels", methods=["GET"])
def levels():
    return render_template("levels.html")


@app.route("/play", methods=["POST", "GET"])
def play():
    if request.method == "POST":
        board = request.json["board"]
        try:
            depth = int(request.json["depth"])
        except TypeError:
            depth = DEFAULT_DEPTH
        bot_turn = int(request.json["turn"])
        bot_move = move(board, turn=bot_turn, depth=depth)
        return jsonify({
            "row": bot_move[0],
            "column": bot_move[1]
        })
    else:
        return render_template("game.html")


if __name__ == "__main__":
    app.run(debug=True)