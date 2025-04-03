from uuid import uuid4
from flask import Flask
from flask import request, jsonify
import hashlib
from flask_cors import CORS

from src.process import validate_dataset, summarize_answers, upload_file, load_data_and_preprocess, pca, upload_results, kmeans, get_uploaded_result_by_uuid, summarize_answer_per_cluster, upload_student_data
from src.db import get_student_data_by_uuid_and_name, create_db, get_db_connection, close_db_connection, authenticate, insert_user, insert_result_record, get_user_records, delete_record, test_db_connection, get_all_users, delete_user, update_student_cluster
from src.classification import svm_classification, random_forest_classification, neural_network_classification

import os

app = Flask(__name__)
app.secret_key = 'your_secret_key'
allowed_origin = os.environ.get("ALLOW_ORIGIN", "*")
CORS(app, resources={r"/api/*": {"origins": allowed_origin}})

create_db(password=hashlib.sha256('admin1234'.encode()).hexdigest())
conn = get_db_connection()
print("Connection:", conn)
close_db_connection(conn)
superadmin = authenticate('superadmin', hashlib.sha256('admin1234'.encode()).hexdigest())
print("Superadmin:", superadmin)

@app.route('/')
def hello_world():
    return 'Hello'

@app.route('/test')
def test():
    print(test_db_connection()[0])
    return 

# API ROUTES

#======================================================================================
# auth and user epoints
#======================================================================================

@app.route('/api/auth', methods=['GET'])
def authenticate_user():
    username = request.args.get('username')
    password = hashlib.sha256(request.args.get('password').encode()).hexdigest()

    user = authenticate(username, password)

    if user:
        return jsonify({'message': 'Authentication successful', 'user': user}), 200
    else:
        return jsonify({'message': 'Authentication failed'}), 401

@app.route('/api/create_user', methods=['POST'])
def create_user():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    first_name = data.get('first_name') 
    last_name = data.get('last_name')
    user_type = 'viewer' if data.get('user_type') is None else data.get('user_type') 

    if not all([username, password, first_name, last_name]):
        return jsonify({'message': 'Missing required fields'}), 400

    password_hash = hashlib.sha256(password.encode()).hexdigest()

    if insert_user(username, password_hash, first_name, last_name, user_type):
        return jsonify({'message': 'User created successfully'}), 200
    else:
        return jsonify({'message': 'User creation failed'}), 500

@app.route('/api/users', methods=['GET'])
def get_users():
    users = get_all_users()
    return jsonify({'users': users}), 200

@app.route('/api/users/<string:id>', methods=['DELETE'])
def delete_user_by_id(id):
    result = delete_user(id)
    if result:
        return jsonify({'message': 'User deleted successfully'}), 200
    else:
        return jsonify({'message': 'User deletion failed'}), 500
#======================================================================================
# data fetch endpoints
#======================================================================================
@app.route('/api/data', methods=['GET'])
def get_data():
    user = request.args.get('username')
    print(user)
    records = get_user_records(user)
    return jsonify({'records': records}), 200

@app.route('/api/data/<string:type>/<string:uuid>', methods=['GET'])
def get_data_by_uuid(type, uuid):
    result = get_uploaded_result_by_uuid(uuid, type)
    return jsonify(result), 200

@app.route('/api/data/<string:uuid>', methods=['DELETE'])
def delete_data_by_uuid(uuid):
    result = delete_record(uuid)
    if result:
        return jsonify({'message': 'Record deleted successfully'}), 200
    else:
        return jsonify({'message': 'Record deletion failed'}), 500

@app.route('/api/student/data/<string:uuid>/<string:form_type>/<string:name>', methods=['GET'])
def get_student_data_by_name(uuid, form_type, name):
    result = get_student_data_by_uuid_and_name(uuid, name, form_type)
    return jsonify(result), 200

@app.route('/api/student/data/<string:uuid>/<string:form_type>/<string:name>/<string:cluster>', methods=['PUT'])
def update_student_cluster_by_name(uuid, name, form_type, cluster):
    result = update_student_cluster(uuid, name, cluster, form_type)
    if result:
        return jsonify({'message': 'Student cluster updated successfully'}), 200
    else:
        return jsonify({'message': 'Student cluster update failed'}), 500

@app.route('/api/data', methods=['POST'])
def fetch_data():
    if 'file' not in request.files:
        print("Error: No file part in request")
        return jsonify({'message': 'No file part in request'}), 400
    file = request.files['file']
    if file.filename == '':
        print("Error: No selected file")
        return jsonify({'message': 'No selected file'}), 400
    
    if file and file.filename.lower().endswith('.csv'):
        uuid = str(uuid4())
        record_name = request.form.get('datasetName')
        form_type = request.form.get('kindOfData')
        user = request.form.get('user')
        if not user:
            print("Error: User not provided in form data")
            return jsonify({'message': 'User not found'}), 400

        file_path = upload_file(file, uuid, form_type)
        summary = summarize_answers(file_path)

        df, df_questions_only, df_scaled = load_data_and_preprocess(file_path, form_type)
        columns = df.columns.to_list()
        is_valid = validate_dataset(columns, form_type)
        if not is_valid:
            print("Error: Invalid dataset. Columns:", columns)
            return jsonify({'message': 'Invalid dataset'}), 400

        df_pca, optimal_pc = pca(df_scaled)
        df_pca, optimal_k, cluster_count, df_original_questions_only = kmeans(df_pca, df_questions_only)
        df_cluster_summary = summarize_answer_per_cluster(df_original_questions_only, form_type)
        upload_student_data(df_pca, uuid, form_type)
        svm_summary = svm_classification(df_pca, 'Cluster') 
        rf_summary = random_forest_classification(df_pca, 'Cluster')
        nn_summary = neural_network_classification(df_pca, 'Cluster')

        best_accuracy = 0
        best_model = None
        
        for model in [svm_summary, rf_summary, nn_summary]:
            if model['accuracy'] > best_accuracy:
                best_accuracy = model['accuracy']
                best_model = model


        results = {
            'id': uuid,
            'user': user,
            'type': form_type,
            'data_summary': {
                'answers_summary': {
                    'full': summary,
                    'per_cluster': df_cluster_summary
                },
                'pca_summary': {
                    'optimal_pc': optimal_pc
                },
                'cluster_summary': {
                    'optimal_k': optimal_k,
                    'cluster_count': cluster_count
                },
                'classification_summary': best_model
            }
        }
        
        print("Results:", results)
        results_path = upload_results(results)
        if not insert_result_record(uuid, record_name, user, form_type) or not results_path:
            print("Error: Failed to insert result record or get results_path")
            return jsonify({'message': 'Failed to insert result record'}), 500

        return jsonify({'message': 'File uploaded and processed successfully', 'data': results}), 200
    
    else:
        print("Error: Invalid file type. Only CSV files are accepted.")
        return jsonify({'message': 'Invalid file type. Only CSV files are accepted.'}), 400


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
