from flask import Flask, request, jsonify
import random  # Simulating AI Analysis for now

app = Flask(__name__)

@app.route("/analyze-video", methods=["POST"])
def analyze_video():
    data = request.json
    video_url = data.get("videoURL")

    if not video_url:
        return jsonify({"error": "No video URL provided"}), 400

    marks = random.randint(50, 100)
    return jsonify({"marks": marks})

if __name__ == "__main__":
    app.run(port=5001, debug=True)