# ✅ MODIFIED FLASK BACKEND TO USE tasks.json
# This supports full API-based persistence.

from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import json
import os

app = Flask(__name__, static_folder="static", template_folder="templates")
CORS(app)

TASK_FILE = "tasks.json"

# ---------------------------
# Utility Functions
# ---------------------------
def load_tasks():
    if os.path.exists(TASK_FILE):
        with open(TASK_FILE, "r") as f:
            return json.load(f)
    return []

def save_tasks(tasks):
    with open(TASK_FILE, "w") as f:
        json.dump(tasks, f, indent=4)

# ---------------------------
# Routes
# ---------------------------
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/tasks", methods=["GET"])
def get_tasks():
    return jsonify(load_tasks())

@app.route("/tasks", methods=["POST"])
def add_task():
    data = request.get_json()
    task_name = data.get("task")
    task_type = data.get("type", "daily")

    if not task_name:
        return jsonify({"error": "Task name is required"}), 400

    tasks = load_tasks()
    new_id = max([t.get("id", 0) for t in tasks], default=0) + 1
    new_task = {
        "id": new_id,
        "task": task_name,
        "type": task_type,
        "done": False,
        "createdAt": data.get("createdAt", "")
    }
    tasks.append(new_task)
    save_tasks(tasks)
    return jsonify(new_task), 201

@app.route("/tasks/<int:task_id>", methods=["PUT"])
def toggle_task(task_id):
    tasks = load_tasks()
    for task in tasks:
        if task["id"] == task_id:
            task["done"] = not task["done"]
            save_tasks(tasks)
            return jsonify(task)
    return jsonify({"error": "Task not found"}), 404

@app.route("/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    tasks = load_tasks()
    updated_tasks = [task for task in tasks if task["id"] != task_id]
    if len(updated_tasks) != len(tasks):
        save_tasks(updated_tasks)
        return jsonify({"message": "Task deleted"})
    return jsonify({"error": "Task not found"}), 404

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=True)
