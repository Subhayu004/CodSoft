# app.py
from flask import Flask, render_template, request, jsonify
import re
import math

app = Flask(__name__)

class Calculator:
    def __init__(self):
        self.history = []
    
    def evaluate_expression(self, expression):
        """Safely evaluate mathematical expressions"""
        try:
            # Replace display symbols with actual operators
            expression = expression.replace('×', '*').replace('÷', '/').replace('−', '-')
            
            # Remove spaces
            expression = expression.replace(' ', '')
            
            # Validate expression contains only allowed characters
            if not re.match(r'^[0-9+\-*/.()%\s]+$', expression):
                return None, "Invalid characters in expression"
            
            # Handle percentage operations
            expression = self.handle_percentage(expression)
            
            # Evaluate the expression
            result = eval(expression)
            
            # Handle different number formats
            if isinstance(result, float):
                # Round to 10 decimal places to avoid floating point errors
                result = round(result, 10)
                # Remove trailing zeros
                if result == int(result):
                    result = int(result)
            
            return result, None
            
        except ZeroDivisionError:
            return None, "Cannot divide by zero"
        except Exception as e:
            return None, "Invalid expression"
    
    def handle_percentage(self, expression):
        """Handle percentage operations"""
        # Replace standalone % with /100
        expression = re.sub(r'(\d+(?:\.\d+)?)%', r'(\1/100)', expression)
        return expression
    
    def add_to_history(self, expression, result):
        """Add calculation to history"""
        calculation = {
            'expression': expression,
            'result': str(result),
            'timestamp': self.get_timestamp()
        }
        self.history.insert(0, calculation)
        
        # Keep only last 50 calculations
        if len(self.history) > 50:
            self.history = self.history[:50]
    
    def get_timestamp(self):
        """Get current timestamp"""
        from datetime import datetime
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    def get_history(self):
        """Get calculation history"""
        return self.history
    
    def clear_history(self):
        """Clear calculation history"""
        self.history = []

# Global calculator instance
calculator = Calculator()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.get_json()
    expression = data.get('expression', '')
    
    if not expression:
        return jsonify({'error': 'No expression provided'}), 400
    
    result, error = calculator.evaluate_expression(expression)
    
    if error:
        return jsonify({'error': error}), 400
    
    # Add to history
    calculator.add_to_history(expression, result)
    
    return jsonify({
        'result': result,
        'expression': expression
    })

@app.route('/history', methods=['GET'])
def get_history():
    return jsonify({'history': calculator.get_history()})

@app.route('/history', methods=['DELETE'])
def clear_history():
    calculator.clear_history()
    return jsonify({'message': 'History cleared'})

@app.route('/validate', methods=['POST'])
def validate_expression():
    data = request.get_json()
    expression = data.get('expression', '')
    
    # Basic validation
    if not expression:
        return jsonify({'valid': False})
    
    # Check for valid characters
    if re.match(r'^[0-9+\-*/.()%\s×÷−]+$', expression):
        return jsonify({'valid': True})
    else:
        return jsonify({'valid': False})

if __name__ == '__main__':
    app.run(debug=True)