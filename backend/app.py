from dotenv import load_dotenv
load_dotenv()

"""
Savvy - Autonomous DCA Agent
Main Flask application with CORS enabled
"""
import os
import logging
import tempfile
from io import BytesIO
from flask import Flask, send_file, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from elevenlabs.client import ElevenLabs
import speech_recognition as sr

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Configure CORS - allow all origins for development
CORS(app, resources={r'/*': {'origins': '*'}})

# Load configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['NEO_RPC_URL'] = os.getenv('NEO_RPC_URL', 'https://testnet.neox.network:443')
app.config['NEO_NETWORK'] = os.getenv('NEO_NETWORK', 'testnet')
app.config['STATE_FILE'] = os.getenv('STATE_FILE', 'data/agent_state.json')

# Ensure data directory exists
os.makedirs(os.path.dirname(app.config['STATE_FILE']), exist_ok=True)

# Register blueprints
from routes.goal import goal_bp
from routes.status import status_bp
from routes.simulate import simulate_bp
from routes.funds import funds_bp
from routes.history import history_bp
from routes.chat import chat_bp

app.register_blueprint(goal_bp, url_prefix='/api')
app.register_blueprint(status_bp, url_prefix='/api')
app.register_blueprint(simulate_bp, url_prefix='/api')
app.register_blueprint(funds_bp, url_prefix='/api')
app.register_blueprint(history_bp, url_prefix='/api')
app.register_blueprint(chat_bp, url_prefix='/api')

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return {'status': 'healthy', 'service': 'savvy-dca-agent'}, 200

@app.route('/api/tts', methods=['POST'])
def text_to_speech():
    """
    Text-to-speech endpoint using ElevenLabs
    """
    try:
        text = request.json.get('text')
        if not text or not isinstance(text, str):
            return jsonify({'error': 'Text must be a non-empty string'}), 400
        
        api_key = os.getenv('ELEVENLABS_API_KEY')
        if not api_key:
            return jsonify({'error': 'TTS service not configured'}), 500
        
        client = ElevenLabs(api_key=api_key)
        audio = client.generate(text=text, voice="Rachel", model="eleven_multilingual_v2")
        audio_data = b"".join(audio)
        
        return send_file(BytesIO(audio_data), mimetype='audio/mpeg')
    except Exception as e:
        logger.error(f'Error in TTS endpoint: {e}', exc_info=True)
        return jsonify({'error': f'Failed to generate audio: {str(e)}'}), 500

@app.route('/api/transcribe', methods=['POST'])
def transcribe_audio():
    """
    Speech-to-text transcription endpoint using Google's Speech Recognition API
    """
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
        
        audio_file = request.files['audio']
        if audio_file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Save temp file safely
        filename = secure_filename(audio_file.filename or 'audio.wav')
        file_ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else 'wav'
        
        recognizer = sr.Recognizer()
        temp_file_path = None
        
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=f'.{file_ext}') as temp_file:
                audio_file.save(temp_file.name)
                temp_file_path = temp_file.name
            
            # Process Audio
            with sr.AudioFile(temp_file_path) as source:
                recognizer.adjust_for_ambient_noise(source, duration=0.5)
                audio_data = recognizer.record(source)
            
            # Transcribe
            text = recognizer.recognize_google(audio_data)
            logger.info(f'Transcribed: {text}')
            return jsonify({'text': text}), 200
            
        except Exception as e:
            logger.error(f'Processing error: {e}')
            return jsonify({'error': f'Processing failed: {str(e)}'}), 500
        finally:
            if temp_file_path and os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
                
    except Exception as e:
        logger.error(f'Error in transcription endpoint: {e}', exc_info=True)
        return jsonify({'error': f'Failed to transcribe: {str(e)}'}), 500

@app.errorhandler(404)
def not_found(error):
    return {'error': 'Endpoint not found'}, 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f'Internal server error: {str(error)}')
    return {'error': 'Internal server error'}, 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV', 'development') == 'development'
    logger.info(f'Starting Savvy DCA Agent backend on port {port}')
    app.run(host='0.0.0.0', port=port, debug=debug)