import json
import os

# File to store tasks
TASK_FILE = "tasks.json"

# Load tasks from file if exists
def load_tasks():
    if os.path.exists(TASK_FILE):
        with open(TASK_FILE, "r") as f:
            return json.load(f)
    return []

# Save tasks to file
def save_tasks(tasks):
    with open(TASK_FILE, "w") as f:
        json.dump(tasks, f, indent=4)

# Display menu
def show_menu():
    print("\n=== TO-DO LIST MENU ===")
    print("1. Add Task")
    print("2. View Tasks")
    print("3. Mark Task as Complete/Incomplete")
    print("4. Delete Task")
    print("5. Exit")

# Add a new task
def add_task(tasks):
    task_name = input("Enter task name: ").strip()
    if task_name:
        tasks.append({"task": task_name, "done": False})
        print("✅ Task added successfully!")
    else:
        print("⚠️ Task cannot be empty.")

# View all tasks
def view_tasks(tasks):
    if not tasks:
        print("📭 No tasks found.")
        return
    print("\n📝 Your Tasks:")
    for i, task in enumerate(tasks, 1):
        status = "✔️" if task["done"] else "❌"
        print(f"{i}. {task['task']} [{status}]")

# Mark task as done/undone
def toggle_task_status(tasks):
    view_tasks(tasks)
    if tasks:
        try:
            task_num = int(input("Enter task number to toggle status: "))
            tasks[task_num - 1]["done"] = not tasks[task_num - 1]["done"]
            print("🔄 Task status updated.")
        except (ValueError, IndexError):
            print("⚠️ Invalid task number.")

# Delete a task
def delete_task(tasks):
    view_tasks(tasks)
    if tasks:
        try:
            task_num = int(input("Enter task number to delete: "))
            removed = tasks.pop(task_num - 1)
            print(f"🗑️ Task '{removed['task']}' deleted.")
        except (ValueError, IndexError):
            print("⚠️ Invalid task number.")

# Main loop
def main():
    tasks = load_tasks()

    while True:
        show_menu()
        choice = input("Choose an option (1-5): ").strip()

        if choice == "1":
            add_task(tasks)
        elif choice == "2":
            view_tasks(tasks)
        elif choice == "3":
            toggle_task_status(tasks)
        elif choice == "4":
            delete_task(tasks)
        elif choice == "5":
            save_tasks(tasks)
            print("📁 Tasks saved. Goodbye!")
            break
        else:
            print("⚠️ Invalid choice. Please try again.")

if __name__ == "__main__":
    main()
