from flask import Flask, render_template, request, jsonify
import random
import string
import secrets

app = Flask(__name__)

class PasswordGenerator:
    def __init__(self):
        self.characters = {
            'uppercase': string.ascii_uppercase,
            'lowercase': string.ascii_lowercase,
            'numbers': string.digits,
            'symbols': '!@#$%^&*()_+-=[]{}|;:,.<>?'
        }
    
    def generate_password(self, length, include_uppercase=True, include_lowercase=True, 
                         include_numbers=True, include_symbols=True):
        """Generate a secure password based on specified criteria"""
        
        # Build character set based on options
        charset = ''
        selected_types = []
        
        if include_uppercase:
            charset += self.characters['uppercase']
            selected_types.append(self.characters['uppercase'])
        
        if include_lowercase:
            charset += self.characters['lowercase']
            selected_types.append(self.characters['lowercase'])
        
        if include_numbers:
            charset += self.characters['numbers']
            selected_types.append(self.characters['numbers'])
        
        if include_symbols:
            charset += self.characters['symbols']
            selected_types.append(self.characters['symbols'])
        
        # Ensure at least one character type is selected
        if not charset:
            raise ValueError("At least one character type must be selected")
        
        # Generate password using cryptographically secure random
        password = ''.join(secrets.choice(charset) for _ in range(length))
        
        # Ensure password contains at least one character from each selected type
        if len(selected_types) > 1:
            password = self._ensure_complexity(password, selected_types, length)
        
        return password
    
    def _ensure_complexity(self, password, selected_types, length):
        """Ensure password contains at least one character from each selected type"""
        password_chars = list(password)
        
        # Check if password already meets complexity requirements
        for char_type in selected_types:
            if not any(char in char_type for char in password_chars):
                # Replace a random character with one from the missing type
                random_index = secrets.randbelow(length)
                password_chars[random_index] = secrets.choice(char_type)
        
        # Shuffle the password to randomize positions
        random.shuffle(password_chars)
        
        return ''.join(password_chars)
    
    def calculate_strength(self, password):
        """Calculate password strength score"""
        score = 0
        feedback = []
        
        # Length scoring
        if len(password) >= 8:
            score += 1
        else:
            feedback.append("Use at least 8 characters")
        
        if len(password) >= 12:
            score += 1
        if len(password) >= 16:
            score += 1
        
        # Character variety scoring
        if any(c.islower() for c in password):
            score += 1
        else:
            feedback.append("Include lowercase letters")
        
        if any(c.isupper() for c in password):
            score += 1
        else:
            feedback.append("Include uppercase letters")
        
        if any(c.isdigit() for c in password):
            score += 1
        else:
            feedback.append("Include numbers")
        
        if any(c in '!@#$%^&*()_+-=[]{}|;:,.<>?' for c in password):
            score += 1
        else:
            feedback.append("Include special characters")
        
        # Determine strength level
        if score <= 2:
            strength = 'Weak'
            color = '#f56565'
        elif score <= 4:
            strength = 'Fair'
            color = '#ed8936'
        elif score <= 6:
            strength = 'Good'
            color = '#38b2ac'
        else:
            strength = 'Strong'
            color = '#48bb78'
        
        return {
            'score': score,
            'max_score': 7,
            'strength': strength,
            'color': color,
            'percentage': (score / 7) * 100,
            'feedback': feedback
        }

# Initialize password generator
password_gen = PasswordGenerator()

@app.route('/')
def index():
    """Render the main page"""
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate_password():
    """Generate password endpoint"""
    try:
        data = request.get_json()
        
        # Extract parameters with defaults
        length = int(data.get('length', 12))
        include_uppercase = data.get('uppercase', True)
        include_lowercase = data.get('lowercase', True)
        include_numbers = data.get('numbers', True)
        include_symbols = data.get('symbols', True)
        
        # Validate length
        if length < 4 or length > 50:
            return jsonify({'error': 'Password length must be between 4 and 50 characters'}), 400
        
        # Generate password
        password = password_gen.generate_password(
            length=length,
            include_uppercase=include_uppercase,
            include_lowercase=include_lowercase,
            include_numbers=include_numbers,
            include_symbols=include_symbols
        )
        
        # Calculate strength
        strength_info = password_gen.calculate_strength(password)
        
        return jsonify({
            'password': password,
            'strength': strength_info,
            'success': True
        })
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'An error occurred while generating the password'}), 500

@app.route('/strength', methods=['POST'])
def check_strength():
    """Check password strength endpoint"""
    try:
        data = request.get_json()
        password = data.get('password', '')
        
        if not password:
            return jsonify({'error': 'Password is required'}), 400
        
        strength_info = password_gen.calculate_strength(password)
        
        return jsonify({
            'strength': strength_info,
            'success': True
        })
        
    except Exception as e:
        return jsonify({'error': 'An error occurred while checking password strength'}), 500

@app.route('/api/info')
def api_info():
    """API information endpoint"""
    return jsonify({
        'name': 'Password Generator API',
        'version': '1.0.0',
        'endpoints': {
            'generate': {
                'method': 'POST',
                'url': '/generate',
                'description': 'Generate a secure password',
                'parameters': {
                    'length': 'int (4-50)',
                    'uppercase': 'bool',
                    'lowercase': 'bool',
                    'numbers': 'bool',
                    'symbols': 'bool'
                }
            },
            'strength': {
                'method': 'POST',
                'url': '/strength',
                'description': 'Check password strength',
                'parameters': {
                    'password': 'string'
                }
            }
        }
    })

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)